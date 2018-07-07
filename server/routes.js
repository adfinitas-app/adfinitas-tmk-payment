var requires = require('./requires.js');

requires.app.use(requires.express.static('../client'));

var checkValidity = function(input, regex) {
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
		console.log(i + ' => ' + data[i]);
		if ((index = my_indexOf(toCheck, i)) >= 0) {
			if (checkValidity(data[i], toCheck[index][1]) === false) {
				console.log('Error in data: ' + i + ' : stop');
				return false;
			}
		}
	}
	return (true);
}

requires.app

.get('/', function (req, res) {
	res.sendStatus(200);
})

.post('/', function (req, res) {
	console.log(JSON.stringify(req.body, null, 4));
	if (checkError(req.body) === false) {
		console.log('paiement refusé : erreur dans les données envoyé au serveur');
		req.app.io.emit('paymentError');
		res.sendStatus(200);
	} else {


		if (req.body.paymentType === 'unique') {
			requires.stripe.charges.create({
				source: req.body.stripeSource,
				amount: parseInt(req.body.amount * 100),
				metadata: {
					email: req.body.email,
					civility: req.body.civility,
					firstname: req.body.firstname,
					lastname: req.body.lastname,
					address1: req.body.address1,
					address2: req.body.address2,
					postalcode: req.body.postalcode,
					city: req.body.city,
					country: req.body.country,
					phone: req.body.phone
				},
				currency: 'eur'
			})
			.then(function () {
				//add bdd
			})
			.then(function () {

				req.app.io.emit('paymentSuccess');
				res.sendStatus(200);
			})
			.catch(function (err) {
				console.log(JSON.stringify(err, null, 4));
				req.app.io.emit('paymentError');
				res.sendStatus(200);
			});
		}



		 else if (req.body.paymentType === 'monthly') {
			requires.stripe.customers.create({
				email: req.body.email,
				source: req.body.stripeSource,
			})
			.then(function (customer) {
				requires.stripe.subscriptions.create({
					customer: customer.id,
					items: [
						{
							plan: parseInt(req.body.amount) + '_GIFT',
						},
					],
				});
			})
			.then(function () {

				req.app.io.emit('paymentSuccess');
				res.sendStatus(200);
			})
			.catch(function (err) {
				console.log(JSON.stringify(err, null, 4));
				req.app.io.emit('paymentError');
				res.sendStatus(200);
			});
		}
	}



});
