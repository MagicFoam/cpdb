var sq = require('../db.js').sq;
var db = require('../db.js').db;
var user_stem = require('./user_stem.js').user_stem;

var stem = db.define('stem', {
    stem: {
        type: sq.STRING
    }
}, {
    freezeTableName: true
});

stem.sync();

module.exports = {
    stem: stem
};