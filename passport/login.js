"use strict";

let LocalStrategy   = require('passport-local').Strategy;
let user = require('../models/user').user;
let bCrypt = require('bcrypt-nodejs');

module.exports = function(passport) {
	passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) {
            user.findOne( { where: { username :  username }}).then(
                function(user) {
                    // Username does not exist, log the error and redirect back
                    if (!user){
                        console.log('User Not Found with username ' + username);
                        return done(null, false, req.flash('message', 'User Not found.'));
                    }
                    // User exists but wrong password, log the error
                    if (!isValidPassword(user, password)){
                        console.log('Invalid Password');
                        return done(null, false, req.flash('message', 'Invalid Password'));
                        // redirect back to login page
                    }
                    // User and password both match, return user from done method
                    // which will be treated like success
                    return done(null, user);
                }
            ).catch(
                function(err) {
                    // In case of any error, return using the done method
                    if (err)
                        return done(err);
                });
        })
    );
    // Generates hash using bCrypt
    let isValidPassword = function(user, password){
        return bCrypt.compareSync(password, user.password);
    }
};