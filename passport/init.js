"use strict";

let login = require('./login');
let signup = require('./signup');
let user = require('../models/user').user;

module.exports = function(passport){
	// Passport needs to be able to serialize and
    // deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        console.log('serializing user: ');
        //console.log(user);
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        user.findById(id).then(
            function(user) {
                console.log('deserialize user:'/*,user*/);
                done(null, user);
            }).catch(
                function(err) {
                    done(err);
                });
    });
    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport);
    signup(passport);
};