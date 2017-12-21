var express 		= require('express');
var app 			= express();
var bodyParser 		= require('body-parser');
var stripe 			= require("stripe")("sk_test_laxl5BP0TNodFtPrFaBsrKZm");
var randomString	= require('randomstring');
var mailjet 		= require('node-mailjet').connect('046c2f7906cb46386aa6caa407c47fe1', '48fff2e9e0d628131fe20dfc6bce00fd');
const Sequelize		= require('sequelize');
const sequelize		= new Sequelize(process.env.DATABASE_URL || 'postgres://adfinitech1@localhost:5432/paiement', {operatorsAliases:false});

// necessary to receive data from form
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//init server and socket io to transmit charge status
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// access to io inside routes
app.io = io;

module.exports = {
		express,
		app,
		bodyParser,
		server,
		io,
		stripe,
		Sequelize,
		sequelize,
		randomString,
		mailjet
	}
