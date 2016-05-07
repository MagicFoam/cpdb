var sq = require('../db.js').sq;
var db = require('../db.js').db;
var user = require('./user.js').user;
var stem = require('./stem.js').stem;

var user_stem = db.define('user_stem', {
}, {
    freezeTableName: true
});

user_stem.belongsTo(stem);
user_stem.belongsTo(user);
user.hasMany(user_stem);
stem.hasMany(user_stem);
user_stem.sync();

module.exports = {
    user_stem: user_stem
};