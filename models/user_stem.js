"use strict";

let db = require('../db.js').db;
let sq = require('../db.js').sq;
let user = require('./user.js').user;
let stem = require('./stem.js').stem;

let user_stem = db.define('user_stem', {
    quantity: {
        type: sq.INTEGER,
        defaultValue: 1
    }
}, {
    freezeTableName: true
});

user.belongsToMany(stem, { through: user_stem });
stem.belongsToMany(user, { through: user_stem });

module.exports = {
    user_stem: user_stem
};