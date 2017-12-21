var requires = require('./requires.js');
var bdd 	 = require('./bdd.js');

requires.app.use(requires.express.static('../client'));

function checkValidity(input, regex) {
	if (regex.test(input) === true) {
		return true;
	}
	else {
		return true;
	}
}

function my_indexOf(tab, str) {
	var len = tab.length;

	for (var i = 0; i < len; i++) {
		if (tab[i][0] === str) {
			return (i);
		}
	}
	return (-1);
}

function checkError(data) {
	return new Promise(function(resolve, reject) {
		var toCheck = [
			["civility"			, /^(M|MME)$/						, "message"],
			["firstname"		, /^[a-zA-Z ]+(-[a-zA-Z ]{1,255})$/	, "message"],
			["lastname"			, /^[a-zA-Z ]+(-[a-zA-Z ]{1,255})$/	, "message"],
			["email"			, /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "message"],
			["address1"			, /^[a-zA-Z ]+(-[a-zA-Z ]{1,255})$/	, "message"],
			["address2"			, /^[a-zA-Z ]+(-[a-zA-Z ]{1,255})$/	, "message"],
			["postalcode"		, /^[0-9]{5,5}$/, "message"],
			["city"				, /^[a-zA-Z ]+(-[a-zA-Z ]{1,255})$/	, "message"],
			["country"			, /^[a-zA-Z ]+(-[a-zA-Z ]{1,255})$/	, "message"],
			["phone"			, /^(0|\+33|0033)[1-9][0-9]{8}?$/	, "message"],
			["amount"			, /^[0-9]+(,|.[0-9]{1,2})?$/		, "message"],
			["paymentType"		, /^(unique|monthly)$/, "message"],
		];
		var index = 0;
		var error = 0;

		for (i in data) {
			console.log('Checking ' + i + ' => ' + data[i]);
			if ((index = my_indexOf(toCheck, i)) >= 0) {
				if (checkValidity(data[i], toCheck[index][1]) === false) {
					console.log('Error in data: ' + i + ' : stop');
					reject(i);
				}
			}
		}
		resolve('success');
	});
}

function proceedPayment(req) {
	return new Promise(function(resolve, reject) {
		if (req.body.paymentType === 'unique') {
			return requires.stripe.charges.create({
				source: req.body.stripeSource,
				amount: parseInt(req.body.amount * 100),
				currency: 'eur'
			}).then(() => {
				resolve('success');
			}).catch((error) => {
				reject(error);
			});
		} else {
			return requires.stripe.customers.create({
				email: req.body.email,
				source: req.body.stripeSource,
			})
			.then(function (customer) {
				return requires.stripe.subscriptions.create({
					customer: customer.id,
					items: [
						{
							plan: parseInt(req.body.amount) + '_GIFT',
						},
					],
				});
			}).then(function () {
				resolve('success');
			}).catch((error) => {
				reject(error);
			});
		}
	});
}

function generateRandomString(length) {
	var str = requires.randomString.generate({
		length: length,
		charset: 'alphabetic'
	});
	return str;
}

function getUserId(email, table) {
	return new Promise(function(resolve, reject) {
		var query = table.findOne({
			where: {
				login: {
					[requires.Sequelize.Op.eq]: email
				}
			}
		});
		resolve(query);
	});
}

function handleMailjetError (err) {
	console.log(err.ErrorMessage);
	throw new Error(err.ErrorMessage);
}

function sendEmail (dest, text) {
	console.log('Sending mail to ' + dest);
	email = {};
	email.FromName = 'Nom de l\'asso';
	email.FromEmail = 'web@adfinitas.fr';
	email.Subject = 'Don effectué';
	email.Recipients = [{Email: dest}];
	email['Html-Part'] = text;

	requires.mailjet.post('send')
	.request(email)
	.catch(handleMailjetError);
}

function sendError(req, res, error) {
	console.log('CATCHED ERROR : ' + error + ': ' + JSON.stringify(error, null, 4));
	req.app.io.emit('paymentError');
	res.sendStatus(200);
}

function sendSuccess(req, res) {
	console.log('Sucessfully proceed to payment');
	req.app.io.emit('paymentSuccess');
	res.sendStatus(200);
}

requires.app

.get('/', function (req, res) {
	res.sendStatus(200);
})

.post('/', function (req, res) {
	console.log('Received ' + JSON.stringify(req.body, null, 4));

	checkError(req.body)
	.then((success) => {
		return proceedPayment(req);
	})
	.then((charge) => {
		return bdd.connectToBdd();
	})
	.then((success) => {
		return bdd.defineTable('transaction', bdd.getTransactionTableModel(), bdd.getTransactionTableModelData());
	})
	.then((table) => {
		var data = {
			civility	: req.body.civility,
			firstname	: req.body.firstname,
			lastname	: req.body.lastname,
			email		: req.body.email,
			address1	: req.body.address1,
			address2	: req.body.address2,
			postalcode	: req.body.postalcode,
			city		: req.body.city,
			country		: req.body.country,
			phone		: req.body.phone,
			amount		: req.body.amount,
			type		: req.body.paymentType
		};
		for (i in data) { if (!data[i]) { console.log('Void value in data : ' + i);}}
		return bdd.insertInBdd(table, data);
	})
	.then((success) => {
		sendEmail(req.body.email, '<p>Bonjour vous avez fait un don de <b>' + req.body.amount + '€ </b>pour notre association et nous vous en remercions</p>');
		return bdd.defineTable('users', bdd.getUsersTableModel(), bdd.getUsersTableModelData());
	})
	.then((table) => {
		return getUserId(req.body.email, table)
		.then((result) => {
			if (result === null) {
				var data = {
					login		: req.body.email,
					password	: generateRandomString(255)
				}
				console.log('Added new user : ' + req.body.email );
				return bdd.insertInBdd(table, data);
			}
			console.log('User ' + req.body.email + ' already exists');
			return (0);
		})
		.catch((error) => {
			console.log('Error while getting user id');
		});
	})
	.then(() => {
		sendSuccess(req, res);
	})
	.catch((error) => {
		sendError(req, res, error);
	});
});
