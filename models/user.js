var sq = require('../db.js').sq;
var db = require('../db.js').db;

var user = db.define('user', {
	username: {
		type: sq.STRING
	},
	password: {
		type: sq.STRING
	},
	email: {
		type: sq.STRING
	},
	firstName: {
		type: sq.STRING
	},
	lastName: {
		type: sq.STRING
	},
	birthday: {
		type: sq.DATE
	},
	gender: {
		type: sq.STRING
	}
}, {
	freezeTableName: true
});

user.sync();

module.exports = {
	user: user
};