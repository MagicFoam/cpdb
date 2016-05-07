"use strict";

var LocalStrategy   = require('passport-local').Strategy;
var usr = require('../models/user').user;
var usr_stem = require('../models/user_stem').usr_stem;
var stemmer = require('../stemmer.js').st;
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
                            var date = req.body.date.split('/');
                            newUser.birthday = new Date(date[2], date[1] - 1, date[0], 10, 0, 0, 0);
                            // save the user
                            newUser.save().then(
                                function(saveduser) {
                                    usr.max('id').then(function(max) {
                                        var words = req.body.text_stem;
                                        var stm = new stemmer();
                                        let wrd = stm.tokenizeAndStem(words);
                                        for (let value of wrd) {
                                            var new_user_stem = usr_stem.build({stem: value});
                                            new_user_stem.userId = max;
                                            new_user_stem.save().then(
                                                function (saved_stem) {
                                                    //console.log(saved_stem);
                                                    console.log('Stem saving successful');
                                                }).catch(
                                                function (err) {
                                                    if (err) {
                                                        console.log('Error in Saving stem: ' + err);
                                                        throw err;
                                                    }
                                                })
                                        }
                                    });
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