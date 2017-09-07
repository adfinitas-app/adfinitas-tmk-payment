var stripe = require("stripe")("sk_test_laxl5BP0TNodFtPrFaBsrKZm");
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlEncoded = bodyParser.urlencoded({ extended: false });
var fs = require('fs');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('postgres://kxtlvtghnbpyvx:55de3be945b0c2abfb037eb79147c7df0981c260b2a8b80836a4efab12db6c25@ec2-54-75-227-173.eu-west-1.compute.amazonaws.com:5432/ded0orheosck9p');
var Regex = require('regex');

var debug = function(obj, objname) {
    console.log('\n--------\n\n' + objname + ' object: ');
    for (i in obj){console.log(i + ' => ' + obj[i]);}
};

var addTrans = function(civilite, nom, prenom, montant, type, email, tel, adresse) {
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

var checkErrors = function(obj, type) {
    var error = 0;

    error += checkValidity(obj.email, /^[^\W][a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*\@[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*\.[a-zA-Z]{2,4}$/);
    if (type === 'mensuel') {
        if (obj.amountMensuel !== '5' && obj.amountMensuel !== '10' && obj.amountMensuel !== '15' && obj.amountMensuel !== '20' && obj.amountMensuel !== '25')
            error += 1;
    }
    else if (type === 'ponctuel')
        error += checkValidity(obj.amount[0], /^[0-9]+(,|.[0-9]{1,2})?$/);
    else if (obj.prenom)
        error += checkValidity(obj.prenom, /^[a-zA-Z]+(-[a-zA-Z]{1,100})?$/);
    else if (obj.nom)
        error += checkValidity(obj.nom, /^[a-zA-Z]+(-[a-zA-Z]{1,100})?$/);
    else if (obj.civilite !== 'Mr' && obj.civilite !== 'Mme')
        error += 1;
    else if (!obj.adresseUne || !obj.ville)
        error += 1;
    else if (obj.tel)
        error += checkValidity(obj.tel, /^(0|\+33|0033)[1-9][0-9]{8}?$/);
    else if (obj.codePostal)
        error += checkValidity(obj.codePostal, /^[0-9]{5,5}?$/);
    var find = false;
    var arrPays = ['DE', 'AT', 'BE', 'BG', 'CY', 'HR', 'DK', 'ES', 'EE', 'FI', 'FR', 'GR', 'HU', 'IS', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'MC', 'NO', 'NL', 'PL', 'PT', 'RO', 'GB', 'CZ', 'SM', 'SK', 'SI', 'CH', 'SE'];
    for (i in arrPays) {
        if (obj.pays === arrPays[i])
            find = true;
    }
    if (find === false)
        error += 1;
    if (error > 0)
        return false;
    return true;
};
console.log('salut!');
app.use(express.static(__dirname + '/public'))

    .get('/', function(req, res) {
        console.log('bonjour');
        fs.readFile(__dirname + '/public/index.html', (err, data) => {
            if (err) throw err;
            res.end(data);
        });
    })

    .post('/ponctuel', urlEncoded, function(req, res) {
        debug(req.body, 'req.body');
        req.body.amount[0] = req.body.amount[0] === 'next' ? req.body.amount[1] : req.body.amount[0];
        if (checkErrors(req.body, 'ponctuel') === false) {
            console.log('Refused by server');
            res.redirect('/');
            return;
        }
        return stripe.charges.create({
            source: req.body.stripeSource,
            amount: parseInt(req.body.amount[0] * 100),
            currency: 'eur'
        }).then(function(charge) {
            debug(charge, 'Charge');
            console.log('new charge created without customer');
            addTrans(req.body.civilite, req.body.nom, req.body.prenom, req.body.amount[0], 'ponctuel', req.body.email, req.body.tel, makeAdress(req.body));
            res.redirect('/');
        }).catch(function(err) {
            debug(err, 'Error');
            res.redirect('/');
        });
    })

    .post('/mensuel', urlEncoded, function(req, res) {
        debug(req.body, 'req.body');
        if (checkErrors(req.body, 'mensuel') === false) {
            console.log('Refused by server');
            res.redirect('/');
            return;
        }
        return stripe.customers.create({
            email: req.body.email,
            source: req.body.stripeSource,
        })
            .then(function(customer) {
                stripe.subscriptions.create({
                    customer: customer.id,
                    items: [
                        {
                            plan: req.body.amountMensuel + '_GIFT',
                        },
                    ],
                });
                addTrans(req.body.civilite, req.body.nom, req.body.prenom, req.body.amountMensuel, 'mensuel', req.body.email, req.body.tel, makeAdress(req.body));
                console.log('New customer successfully subscribed to plan');
                res.redirect('/');
            }).catch(function(err) {
                debug(err, 'Error');
                console.log(err);
                res.redirect('/');
            });
    })

    .listen(process.env.PORT || 8080);
