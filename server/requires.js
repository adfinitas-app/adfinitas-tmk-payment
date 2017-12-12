var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var stripe = require("stripe")("sk_test_laxl5BP0TNodFtPrFaBsrKZm");

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
		stripe
}
