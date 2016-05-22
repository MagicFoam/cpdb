var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

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
var passport = require('passport');
var expressSession = require('express-session');

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
var flash = require('connect-flash');
app.use(flash());

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

var routes = require('./routes/index')(passport);
app.use('/', routes);

var home = require('./routes/home');
app.use('/home', home);

var profile = require('./routes/profile');
app.use('/profile', profile);

var user = require('./models/user').user;
var user_stem = require('./models/user_stem').user_stem;
var stem = require('./models/stem').stem;
var adv = require('./models/adv.js').adv;
var adv_stem = require('./models/adv_stem.js').adv_stem;

var fill_data = require('./fill_data');

var db = require('./db.js').db;

user.sync().then(
     function() {
         user.count().then(function (count) {
             if (count == 0) {
                 stem.sync().then(function() {
                     user_stem.sync();
                     adv.sync().then(function() {
                         adv_stem.sync().then(function() {
                             fill_data(20, 500);
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
    var err = new Error('Not Found');
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