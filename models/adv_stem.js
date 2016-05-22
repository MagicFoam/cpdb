var db = require('../db.js').db;
var adv = require('./adv.js').adv;
var stem = require('./stem.js').stem;

var adv_stem = db.define('adv_stem', {
}, {
    freezeTableName: true
});

adv_stem.belongsTo(stem);
adv_stem.belongsTo(adv);
adv.hasMany(adv_stem);
stem.hasMany(adv_stem);

//adv_stem.sync();

module.exports = {
    adv_stem: adv_stem
};