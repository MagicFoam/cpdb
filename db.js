"use strict";

let Sequelize = require('sequelize');
let sequelize = new Sequelize('main', null, null, {
	host: 'localhost',
	dialect: 'sqlite',
	pool: {
		max: 5,
		min: 0,
		idle: 10000
	},
	//timezone: '+03:00', // not supported, dates must be always in UTC+0
	// SQLite only
	storage: '/home/igor/cpdb/cpdb.db'
});

module.exports = {
	sq: Sequelize,
	db: sequelize
};