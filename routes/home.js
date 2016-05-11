"use strict";

var express = require('express');
var router = express.Router();
var user_stem = require('../models/user_stem').user_stem;
var stem = require('../models/stem').stem;
var stemmer = require('../stemmer.js').st;

var isAuthenticated = function (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (req.isAuthenticated())
        return next();
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/');
};

var save_user_stem = function(new_user_stem) {
    user_stem.findOne({ where: { userId : new_user_stem.userId, stemId: new_user_stem.stemId } }).then(
        function(usr_stm) {
            if (!usr_stm) {
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
        }).catch(
        function(err) {
           if (err) {
               console.log('Error in Saving user_stem: ' + err);
               throw err;
           }
        });
};

/* GET Home Page */
router.get('/', isAuthenticated, function(req, res, next){
    res.render('home', { user: req.user });
});

router.post('/search', function(req, res, next){
    var words = req.body.query;
    var id = req.body.id;
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
                                userId: id,
                                stemId: saved_stem.id
                            });
                            save_user_stem(new_user_stem);
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
                        userId: id,
                        stemId: stm.id
                    });
                    save_user_stem(new_user_stem);
                }
            });
    }
    res.send(id);
});

module.exports = router;