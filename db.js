var Sequelize = require('sequelize');
var sequelize = new Sequelize('main', null, null, {
	host: 'localhost',
	dialect: 'sqlite',
	pool: {
		max: 5,
		min: 0,
		idle: 10000
	},
	// SQLite only
	storage: '/home/igor/cpdb/cpdb.db'
});

module.exports = {
	sq: Sequelize,
	db: sequelize
};