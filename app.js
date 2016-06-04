"use strict";

let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');

let app = express();

// view engine setup
app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'pug');

// uses setup
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname + '/public')));

// Configuring Passport
let passport = require('passport');
let expressSession = require('express-session');

/* TODO - Why Do we need this key ? */
app.use(expressSession({
	secret: 'mySecretKey',
	resave: true,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

 // Using the flash middleware provided by connect-flash to store messages in session
 // and displaying in templates
let flash = require('connect-flash');
app.use(flash());

// Initialize Passport
let initPassport = require('./passport/init');
initPassport(passport);

let routes = require('./routes/index')(passport);
app.use('/', routes);

let home = require('./routes/home');
app.use('/home', home);

let profile = require('./routes/profile');
app.use('/profile', profile);

let user = require('./models/user').user;
let user_stem = require('./models/user_stem').user_stem;
let stem = require('./models/stem').stem;
let adv = require('./models/adv.js').adv;
let adv_stem = require('./models/adv_stem.js').adv_stem;

let fill_data = require('./fill_data');

let db = require('./db.js').db;

user.sync().then(
     function() {
         user.count().then(function (count) {
             if (count == 0) {
                 stem.sync().then(function() {
                     user_stem.sync();
                     adv.sync().then(function() {
                         adv_stem.sync().then(function() {
                             fill_data(20, 100, 20);
                         });
                     });
                 });
             }
         });
     }).catch(function(err) {
    if (err) {
        console.log('Error in creating tables: ' + err);
        throw err;
    }
});


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

module.exports = app;