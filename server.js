var stripe = require("stripe")("sk_test_laxl5BP0TNodFtPrFaBsrKZm");
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlEncoded = bodyParser.urlencoded({ extended: false });
const Sequelize = require('sequelize');
const sequelize = new Sequelize('postgres://kxtlvtghnbpyvx:55de3be945b0c2abfb037eb79147c7df0981c260b2a8b80836a4efab12db6c25@ec2-54-75-227-173.eu-west-1.compute.amazonaws.com:5432/ded0orheosck9p');
//const sequelize = new Sequelize('postgres://postgres:satinifda@localhost:5432/paiement');
var Regex = require('regex');

var debug = function(obj, objname)
{
    console.log('\n--------\n\n' + objname + ' object: ');
    console.log(JSON.stringify(obj, null, 4));
    //for (i in obj){console.log(i + ' => ' + obj[i]);}
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
            transaction.sync({force: true})
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
                    console.log('Correctly added transaction to database.');
                })
                .catch(error => {
                    console.log('Erreur de synchronisation: ' + error);
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
        array.push([data.codePostal, /^[0-9]{5,5}?$/, 'code postal']);
        array[0][1] = /^(5|10|15|20|25|30)?$/; // change la regex
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

app.use(express.static(__dirname + '/public'))

    .get('/', function (req, res) {
        res.end('bonjour');
    })

    .get('/accepte', function (req, res) {

        res.header("Content-Type", "text/html;charset=utf-8");
        res.end('Paiement <span style="color: green;">accepté</span> !');
    })

    .get('/refuse', function (req, res) {
        res.header("Content-Type", "text/html;charset=utf-8");
        res.end('Paiement <span style="color: red;">refusé</span> !');
    })

    .post('/', urlEncoded, function (req, res) {
        debug(req.body, 'req.body');
        if (checkError(req.body) === 84) {
            console.log('Refused by server.');
            res.redirect('/refuse');
            return (84);
        }
        else if (req.body.paymentType === 'creditCard') {
            // stripe.accounts.create({
            //     country: "FR",
            //     type: "custom",
            //     email: 'tech@adfinitas.fr',
            //
            // }).then(function(acct) {
            //     debug(acct, 'account');
            //     // asynchronously called
            // });
            return stripe.charges.create({
                source: req.body.stripeSource,
                amount: parseInt(req.body.amount * 100),
                currency: 'eur'
            })
                .then(function () {
                    addTransaction(req.body.civilite, req.body.nom, req.body.prenom, req.body.amount, 'creditCard', req.body.email, req.body.tel, makeAdress(req.body))
                })
                .then(function () {
                    console.log('terminé');
                    res.redirect('/accepte');
                })
                .catch(function (err) {
                    debug(err, 'Error');
                    res.redirect('/refuse');
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
                    console.log('Paiment sepa réussi !');
                    res.redirect('/accepte');
                })
                .catch(function (err) {
                    debug(err, 'Error');
                    res.redirect('/refuse');
                });
        }
    })

.listen(process.env.PORT || 8080);
