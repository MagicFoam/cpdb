"use strict";

var user_stem = require('./models/user_stem').user_stem;
var stem = require('./models/stem').stem;
var user = require('./models/user').user;
var bCrypt = require('bcrypt-nodejs');
var words = require('./words_string');
var stemmer = require('./stemmer.js').st;

function rand_int(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generates hash using bCrypt
var createHash = function(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

module.exports = function(nobjects, nfeatures) {
    var i = 0;
    var j = 0;
    for (i = 0; i < nobjects; i++) {
        var newUser = user.build({username: i});
        newUser.password = createHash(i);
        newUser.email = i + '@yandex.ru';
        newUser.firstName = i;
        newUser.lastName = i;
        newUser.gender = (i % 2) ? 'm' : 'f';
        newUser.birthday = new Date(rand_int(1900, 2000), rand_int(1, 12) - 1, rand_int(1, 28), 10, 0, 0, 0);
        newUser.save().then(function(saved_user){}).catch(function(err){
            if (err) {
                console.log('Error in Saving user: ' + err);
                throw err;
            }
        });
    }
    var stm = new stemmer();
    i = 0;
    let wrd = stm.tokenizeAndStem(words);
    for (let value of wrd) {
        if (i == nfeatures) {
            break;
        }
        var new_stem = stem.build({stem: value});
        new_stem.quantity = rand_int(1, nobjects);
        new_stem.save().then(function(saved_stem){}).catch(function(err) {
            if (err) {
                console.log('Error in Saving stem: ' + err);
                throw err;
            }
        });
        i++;
    }
    stem.findAndCountAll().then(function(results) {
        user.count().then(function(count) {
            var current_user = 1;
            for (i = 1; i <= results.count; i++) {
                for (j = 0; j < results.rows[i].quantity; j++) {
                    if (current_user > nobjects) {
                        current_user = 1;
                    }
                    var new_user_stem = user_stem.build({userId: current_user, stemId: i});
                    new_user_stem.quantity = rand_int(1, 50);
                    new_user_stem.save().then(function(saved_user_stem){}).catch(function (err) {
                        if (err) {
                            console.log('Error in Saving user_stem: ' + err);
                            throw err;
                        }
                    });
                    current_user++;
                }
            }
        })
    });
};