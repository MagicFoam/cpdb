var LocalStrategy   = require('passport-local').Strategy;
var usr = require('../models/user').user;
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){
	passport.use('signup', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            var findOrCreateUser = function() {
                usr.findOne({ where: { username :  username } }).then(
                    function(user) {
                        // already exists
                        if (user) {
                            console.log('User already exists with username: ' + username);
                            return done(null, false, req.flash('message','User Already Exists'));
                        } else {
                            // if there is no user with that email
                            // create the user
                            var newUser = usr.build({username: username});
                            // set the user's local credentials
                            newUser.password = createHash(password);
                            newUser.email = req.body.email;
                            newUser.firstName = req.body.firstName;
                            newUser.lastName = req.body.lastName;
                            newUser.gender = req.body.gender;
                            // save the user
                            newUser.save().then(
                                function(saveduser) {
                                    console.log('User Registration successful');
                                    return done(null, saveduser);
                                }).catch(
                                function(err) {
                                    if (err){
                                        console.log('Error in Saving user: ' + err);
                                        throw err;
                                    }
                                });
                        }
                    }).catch(
                        function(err) {
                            // In case of any error, return using the done method
                            if (err){
                                console.log('Error in SignUp: ' + err);
                                return done(err);
                            }
                        });
            };
            // Delay the execution of findOrCreateUser and execute the method
            // in the next tick of the event loop
            process.nextTick(findOrCreateUser);
        })
    );
    // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    }
};