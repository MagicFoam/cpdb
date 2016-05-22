var sq = require('../db.js').sq;
var db = require('../db.js').db;

var adv = db.define('adv', {
    name: {
        type: sq.STRING
    },
    location: {
        type: sq.STRING
    }
}, {
    freezeTableName: true
});

//adv.sync();

module.exports = {
    adv: adv
};
