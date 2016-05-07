"use strict";

var LocalStrategy   = require('passport-local').Strategy;
var user = require('../models/user').user;
var user_stem = require('../models/user_stem').user_stem;
var stem = require('../models/stem').stem;
var stemmer = require('../stemmer.js').st;
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){
	passport.use('signup', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            var findOrCreateUser = function() {
                user.findOne({ where: { username :  username } }).then(
                    function(usr) {
                        // already exists
                        if (usr) {
                            console.log('User already exists with username: ' + username);
                            return done(null, false, req.flash('message','User Already Exists'));
                        } else {
                            // if there is no user with that email
                            // create the user
                            var newUser = user.build({username: username});
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

                                    user.max('id').then(function(max) {
                                        var words = req.body.text_stem;
                                        var stm = new stemmer();
                                        let wrd = stm.tokenizeAndStem(words);
                                        for (let value of wrd) {
                                            stem.findOne({ where: { stem :  value } }).then(
                                                function(stm) {
                                                    if (!stm) {
                                                        var new_stem = stem.build({stem: value});
                                                        new_stem.save().then(
                                                            function (saved_stem) {
                                                                var new_user_stem = user_stem.build({
                                                                    userId: max,
                                                                    stemId: saved_stem.id
                                                                });
                                                                new_user_stem.save().then(
                                                                    function (saved_user_stem) {
                                                                        console.log('User_stem saving successful');
                                                                    }).catch(
                                                                    function (err) {
                                                                        if (err) {
                                                                            console.log('Error in Saving user_stem: ' + err);
                                                                            throw err;
                                                                        }
                                                                    });
                                                                console.log('Stem saving successful');
                                                            }).catch(
                                                            function (err) {
                                                                if (err) {
                                                                    console.log('Error in Saving stem: ' + err);
                                                                    throw err;
                                                                }
                                                            });
                                                    }
                                                    else {
                                                        var new_user_stem = user_stem.build({
                                                            userId: max,
                                                            stemId: stm.id
                                                        });
                                                        new_user_stem.save().then(
                                                            function (saved_user_stem) {
                                                                console.log('User_stem saving successful');
                                                            }).catch(
                                                            function (err) {
                                                                if (err) {
                                                                    console.log('Error in Saving user_stem: ' + err);
                                                                    throw err;
                                                                }
                                                            });
                                                    }
                                                });
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