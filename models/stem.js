var sq = require('../db.js').sq;
var db = require('../db.js').db;

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