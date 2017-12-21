var requires = require('./requires.js');
const sequelize = requires.sequelize;

function getUsersTableModelData() {
	return ({
		timestamps: true,
		createdAt: 'date',
		updatedAt: false,
		freezeTableName: true
	});
}

function getUsersTableModel() {
	return (
		{
			id: {
				type: requires.Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			login: {
				type: requires.Sequelize.STRING(255),
				allowNull: false
			},
			password: {
				type: requires.Sequelize.STRING(255),
				allowNull: false
			},
			date: requires.Sequelize.DATE(1),
		}
	);
}

function getTransactionTableModelData() {
	return ({
		timestamps: true,
		createdAt: 'date',
		updatedAt: false,
		freezeTableName: true
	});
}

function getTransactionTableModel() {
	return (
		{
			id: {
				type: requires.Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			civility: {
				type: requires.Sequelize.STRING(3),
				allowNull: false
			},
			firstname: {
				type: requires.Sequelize.STRING(255),
				allowNull: false
			},
			lastname: {
				type: requires.Sequelize.STRING(255),
				allowNull: false
			},
			email: {
				type: requires.Sequelize.STRING(255),
				allowNull: false
			},
			address1: {
				type: requires.Sequelize.STRING(255),
				allowNull: false
			},
			address2: {
				type: requires.Sequelize.STRING(255),
				allowNull: true
			},
			postalcode: {
				type: requires.Sequelize.STRING(7),
				allowNull: false
			},
			city: {
				type: requires.Sequelize.STRING(255),
				allowNull: false
			},
			country:  {
				type: requires.Sequelize.STRING(3),
				allowNull: false
			},
			phone: {
				type: requires.Sequelize.STRING(15),
				allowNull: true
			},
			amount: {
				type: requires.Sequelize.DOUBLE,
				allowNull: false
			},
			type: {
				type: requires.Sequelize.STRING(15),
				allowNull: false
			},
			date: requires.Sequelize.DATE(1),
		}
	);
}

function insertInBdd(table, data) {
	return new Promise(function(resolve, reject) {
		const buildedTable = table.build(data);
		buildedTable.save()
		.then(() => {
			console.log('Sucessfully added ' + JSON.stringify(data, null, 4) + ' to bdd');
			resolve('success');
		})
		.catch((error) => {
			reject('insertInBdd ' + error);
		});
	});
}

function defineTable(tableName, tableModel, tableModelData) {
	return new Promise(function(resolve, reject) {
		const table = sequelize.define(tableName, tableModel, tableModelData);

		table.sync({})
		.then(() => {
			console.log('Sync table : ' + tableName);
			resolve(table);
		})
		.catch((error) => {
			console.log('Sync error');
			reject(error);
		})
	});
}

function connectToBdd() {
	console.log('Connecting to database');
	return new Promise(function(resolve, reject) {
		sequelize
		.authenticate()
		.then(() => {
			console.log('Successfully connected to database');
			resolve('success');
		})
		.catch(error => {
			reject('Unable to connect to the database : ' + error);
		});
	});
}


module.exports = {
	getUsersTableModelData,
	getUsersTableModel,
	getTransactionTableModelData,
	getTransactionTableModel,
	insertInBdd,
	defineTable,
	connectToBdd
}

//format table transaction a revoir
