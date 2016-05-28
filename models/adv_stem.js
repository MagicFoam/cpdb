"use strict";

let db = require('../db.js').db;
let adv = require('./adv.js').adv;
let stem = require('./stem.js').stem;

let adv_stem = db.define('adv_stem', {
}, {
    freezeTableName: true
});

adv.belongsToMany(stem, { through: adv_stem });
stem.belongsToMany(adv, { through: adv_stem });

module.exports = {
    adv_stem: adv_stem
};