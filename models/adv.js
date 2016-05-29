"use strict";

let sq = require('../db.js').sq;
let db = require('../db.js').db;

let adv = db.define('adv', {
    location: {
        type: sq.STRING
    },
    link: {
        type: sq.STRING
    }
}, {
    freezeTableName: true
});

//adv.sync();

module.exports = {
    adv: adv
};
