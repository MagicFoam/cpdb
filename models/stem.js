var sq = require('../db.js').sq;
var db = require('../db.js').db;

var stem = db.define('stem', {
    stem: {
        type: sq.STRING
    },
    quantity: {
        type: sq.INTEGER,
        defaultValue: 1
    }
}, {
    freezeTableName: true
});

stem.sync();

module.exports = {
    stem: stem
};