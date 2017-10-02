var stripe = require("stripe")("sk_test_laxl5BP0TNodFtPrFaBsrKZm");
var express = require('express');
var app = express();
//var request = require('request');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//var urlEncoded = bodyParser.urlencoded({ extended: true });
const Sequelize = require('sequelize');
//const sequelize = new Sequelize('postgres://kxtlvtghnbpyvx:55de3be945b0c2abfb037eb79147c7df0981c260b2a8b80836a4efab12db6c25@ec2-54-75-227-173.eu-west-1.compute.amazonaws.com:5432/ded0orheosck9p');
const sequelize = new Sequelize('postgres://postgres:satinifda@localhost:5432/paiement');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var Regex = require('regex');

var debug = function(obj, objname)
{
    console.log('\n--------\n\n' + objname + ' object: ');
    console.log(JSON.stringify(obj, null, 4));
    for (i in obj){console.log(i + ' => ' + obj[i]);}
};

var addTransaction = function(civilite, nom, prenom, montant, type, email, tel, adresse) {
    sequelize
        .authenticate()
        .then(() => {
            console.log('Connection has been established successfully.');
            const transaction = sequelize.define('transaction', {
                    id: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                        primaryKey: true,
                        autoIncrement: true
                    },
                    civilite: {
                        type: Sequelize.STRING(7),
                        allowNull: false
                    },
                    nom: {
                        type: Sequelize.STRING(255),
                    },
                    prenom: {
                        type: Sequelize.STRING(255),
                    },
                    montant: {
                        type: Sequelize.REAL,
                        allowNull: false
                    },
                    type: {
                        type: Sequelize.STRING(15),
                        allowNull: false
                    },
                    email: {
                        type: Sequelize.STRING(255),
                        allowNull: false
                    },
                    tel: {
                        type: Sequelize.STRING(15)
                    },
                    adresse: {
                        type: Sequelize.TEXT
                    },
                    date: Sequelize.DATE(1),
                },
                {
                    timestamps: true,
                    createdAt: 'date',
                    updatedAt: false,
                    freezeTableName: true
                }
            );
            transaction.sync({})
                .then(() => {
                    console.log('Synchronisation réussie !');
                    transaction
                        .build({
                            civilite: civilite,
                            nom: nom,
                            prenom: prenom,
                            montant: montant,
                            type: type,
                            email: email,
                            tel: tel,
                            adresse: adresse
                        })
                        .save()
                })
                .then(anotherTask => {

                })
                .catch(error => {
                    console.log('Error: ' + error);
                });
        })
        .catch(err => {
            console.error('Unable to connect to the database:', err);
        });
};

var makeAdress = function (obj) {
    return [obj.adresseUne, obj.adresseDeux, obj.ville, obj.codePostal, obj.pays].join(' ');
};

var checkValidity = function(input, regex) {
    if (regex.test(input) === true)
        return false;
    else
        return true;
};

var checkError = function (data) {
    if (!data || !data.amount || !data.email || !data.civilite || !data.prenom || !data.nom || !data.stripeSource || !data.paymentType)
        return (84);
    var stringError = '';
    var array = [
        [data.amount, /^[0-9]+(,|.[0-9]{1,2})?$/, 'montant'],
        [data.email, /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'email'],
        [data.civilite, /^(Mr|Mme|autre)?$/, 'civilite'],
        [data.prenom, /^[a-zA-Z ]+(-[a-zA-Z ]{1,120})?$/, 'prenom'],
        [data.nom, /^[a-zA-Z ]+(-[a-zA-Z ]{1,120})?$/, 'nom'],
        [data.paymentType, /^(creditCard|sepa)?$/, 'type de paiement'],
    ];
    if (data.tel)
        array.push([data.tel, /^(0|\+33|0033)[1-9][0-9]{8}?$/, 'tel']);
    if (data.paymentType === 'sepa') {
        if (!data.adresseUne || !data.ville || !data.codePostal || !data.pays)
            return (84);
        //faire la regex PAYS
        array.push([data.codePostal, /^[0-9]{5,5}?$/, 'code postal']);
        array[0][1] = /^(5|10|15|20|25|30)?$/; // change la regex du montant
        if (data.adresseUne.trim().length === 0)
            stringError += "'" + 'adresseUne' + "' ; ";
        if (data.ville.trim().length === 0)
            stringError += "'" + 'ville' + "' ; ";
    }
    for (i = 0; i < array.length; i++) {
        if (checkValidity(array[i][0], array[i][1]) === true) { // true = erreur / false = correcte
            stringError += "'" + array[i][2] + "' ; ";
        }
    }
    console.log('Erreur avec : ' + stringError + '.');
    if (stringError !== '')
        return (84);
    return (0);
};

server.listen(process.env.PORT || 8080);
app.io = io;
app.use(express.static(__dirname + '/public'))

    .get('/', function (req, res) {
        res.end('bonjour');
    })

    .post('/', function (req, res) {
        debug(req.body, 'req.body');
        if (checkError(req.body) === 84) {
            console.log('Refused by server.');
            res.redirect('/refuse');
            return (84);
        }
        else if (req.body.paymentType === 'creditCard') {
            return stripe.charges.create({
                source: req.body.stripeSource,
                amount: parseInt(req.body.amount * 100),
                currency: 'eur'
            })
                .then(function () {
                    addTransaction(req.body.civilite, req.body.nom, req.body.prenom, req.body.amount, 'creditCard', req.body.email, req.body.tel, makeAdress(req.body))
                })
                .then(function () {
                    req.app.io.emit('paymentSuccess');
                })
                .catch(function (err) {
                    debug(err, 'Error');
                    req.app.io.emit('paymentError');
                    // message = '';
                    // switch (err.type) {
                    //     case 'StripeCardError':
                    //         // A declined card error // => e.g. "Your card's expiration year is invalid."
                    //         switch (err.code) {
                    //             case 'invalid_number':
                    //                 message = 'Le numéro de carte n\'est pas un numéro de carte de crédit valide.';
                    //                 break;
                    //             case 'invalid_expiry_month':
                    //                 message = 'Le mois de la date d\'expiration de la carte n\'est pas valide.';
                    //                 break;
                    //             case 'invalid_expiry_year':
                    //                 message = 'L\'année de la date d\'expiration de la carte n\'est pas valide.';
                    //                 break;
                    //             case 'invalid_cvc':
                    //                 message = 'Le code de sécurité de la carte n\'est pas valide.';
                    //                 break;
                    //             case 'invalid_swipe_data':
                    //                 message = 'Le swipe de votre carte n\'est pas valide.';
                    //                 break;
                    //             case 'incorrect_number':
                    //                 message = 'Le numéro de carte est incorrecte.';
                    //                 break;
                    //             case 'expired_card':
                    //                 message = 'La carte de crédit à expiré';
                    //                 break;
                    //             case 'incorrect_cvc':
                    //                 message = 'Le code de sécurité de la carte est incorrecte.';
                    //                 break;
                    //             case 'incorrect_zip':
                    //                 message = 'Le code zip de la carte est incorrecte.';
                    //                 break;
                    //             case 'card_declined':
                    //                 message = 'La carte de crédit à été refusé.';
                    //                 break;
                    //             case 'missing':
                    //                 message = 'Il n\'y à pas de carte de crédit sur le client chargé';
                    //                 break;
                    //             case 'processing_error':
                    //                 message = 'Une erreur est survenue pendant le traitement de la carte';
                    //                 break;
                    //         }
                    //         break;
                    //     case 'RateLimitError':
                    //         // Too many requests made to the API too quickly
                    //         message = 'Trop de requêtes ont été envoyés en trop peu de temps.';
                    //         break;
                    //     case 'StripeInvalidRequestError':
                    //         // Invalid parameters were supplied to Stripe's API
                    //         message = '';
                    //         break;
                    //     case 'StripeAPIError':
                    //         // An error occurred internally with Stripe's API
                    //         message = '';
                    //         break;
                    //     case 'StripeConnectionError':
                    //         // Some kind of error occurred during the HTTPS communication
                    //         message = '';
                    //         break;
                    //     case 'StripeAuthenticationError':
                    //         // You probably used an incorrect API key
                    //         message = '';
                    //         break;
                    //     default:
                    //         // Handle any other types of unexpected errors
                    //         message = '';
                    //         break;
                    // }
                });
        }
        else if (req.body.paymentType === 'sepa') {
            return stripe.customers.create({
                email: req.body.email,
                source: req.body.stripeSource,
            })
                .then(function (customer) {
                    stripe.subscriptions.create({
                        customer: customer.id,
                        items: [
                            {
                                plan: req.body.amount + '_GIFT',
                            },
                        ],
                    });
                })
                .then(function () {
                    addTransaction(req.body.civilite, req.body.nom, req.body.prenom, req.body.amount, 'sepa', req.body.email, req.body.tel, makeAdress(req.body));
                    req.app.io.emit('paymentSuccess');
                })
                .catch(function (err) {
                    debug(err, 'Error');
                    req.app.io.emit('paymentError');
                });
        }
    });



//.listen(process.env.PORT || 8080);
