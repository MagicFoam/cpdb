"use strict";

let sq = require('../db.js').sq;
let db = require('../db.js').db;

let stem = db.define('stem', {
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

//stem.sync();

module.exports = {
    stem: stem
};