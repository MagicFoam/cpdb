"use strict";

let user_stem = require('./models/user_stem').user_stem;
let stem = require('./models/stem').stem;
let user = require('./models/user').user;
let adv = require('./models/adv').adv;
let bCrypt = require('bcrypt-nodejs');
let words = require('./words_string');
let stemmer = require('./stemmer.js').st;
let advs = require('./adv_data.js');

function rand_int(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generates hash using bCrypt
function createHash(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

module.exports = function(nobjects, nfeatures, nadvs) {
    for (let i = 0; i < nobjects; i++) {
        let newUser = user.build({username: i});
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
    let stm = new stemmer();
    let i = 0;
    let wrd = stm.tokenizeAndStem(words);
    for (let value of wrd) {
        if (i == nfeatures) {
            break;
        }
        let new_stem = stem.build({stem: value});
        new_stem.quantity = rand_int(1, nobjects);
        new_stem.save().then(function(saved_stem){}).catch(function(err) {
            if (err) {
                console.log('Error in Saving stem: ' + err);
                throw err;
            }
        });
        i++;
    }
    stem.findAndCountAll().then(function(stems) {
        user.findAndCountAll().then(function(users) {
            let current_user = 0;
            for (let i = 1; i <= stems.count; i++) {
                for (let j = 0; j < stems.rows[i].quantity; j++) {
                    if (current_user >= nobjects) {
                        current_user = 0;
                    }
                    let rand = rand_int(1, 50);
                    stems.rows[i].addUser(users.rows[current_user], {quantity: rand});
                    current_user++;
                }
            }
        })
    });
    for (let i = 0; i < nadvs; i++) {
        let new_adv = adv.build({link: ''});
        new_adv.location = advs[i].picture_file;
        new_adv.save().then(function(saved_adv) {
            for (let j = 0; j < advs[i].words.length; j++) {
                stem.findOne({where: {stem: advs[i].words[j]}}).then(function(stm) {
                    if (!stm) {
                        let new_stem = stem.build({stem: advs[i].words[j]});
                        new_stem.quantity = 0;
                        new_stem.save().then(function(saved_stem){
                            saved_adv.addStem(saved_stem);
                        })
                    }
                    else {
                        saved_adv.addStem(stm);
                    }
                })        
            }
        })
    }
};