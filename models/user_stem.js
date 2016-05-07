var sq = require('../db.js').sq;
var db = require('../db.js').db;
var user = require('./user.js').user;

var usr_stem = db.define('user_stem', {
    stem: {
        type: sq.STRING
    }
}, {
    freezeTableName: true
});

user.hasMany(usr_stem);
usr_stem.belongsTo(user);

usr_stem.sync();

module.exports = {
    usr_stem: usr_stem
};