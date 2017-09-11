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
    var arrPays = ['DE', 'AT', 'BE', 'BG', 'CY', 'HR', 'DK', 'ES', 'EE', 'FI', 'FR', 'GR', 'HU', 'IS', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'MC', 'NO', 'NL', 'PL', 'PT', 'RO', 'GB', 'CZ', 'SM', 'SK', 'SI', 'CH', 'SE'];

    error += checkValidity(obj.email, /^[^\W][a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*\@[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*\.[a-zA-Z]{2,4}$/);
    if (type === 'mensuel') {
        if (['5', '10', '15', '20', '25', '30'].indexOf(obj.amountMensuel) < 0)
            error += 1;
    }
    else if (type === 'ponctuel') {
        error += checkValidity(obj.amount[0], /^[0-9]+(,|.[0-9]{1,2})?$/);
    }
    if (obj.prenom) {
        error += checkValidity(obj.prenom, /^[a-zA-Z]+(-[a-zA-Z]{1,100})?$/);
    }
    if (obj.nom) {
        error += checkValidity(obj.nom, /^[a-zA-Z]+(-[a-zA-Z]{1,100})?$/);
    }
    if (obj.civilite !== 'Mr' && obj.civilite !== 'Mme') {
        error += 1;
    }
    //ville adresse
    if (obj.tel) {
        error += checkValidity(obj.tel, /^(0|\+33|0033)[1-9][0-9]{8}?$/);
    }
    if (obj.codePostal) {
        error += checkValidity(obj.codePostal, /^[0-9]{5,5}?$/);
    }
    if (arrPays.indexOf(obj.pays) < 0) {
        error += 1;
        console.log('pays error');
    }
    if (error > 0)
        return false;
    return true;
};

app.use(express.static(__dirname + '/public'))

    .get('/', function (req, res) {
        fs.readFile(__dirname + '/public/index.html', (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200);
            res.end(data);
        });
    })

    .post('/ponctuel', urlEncoded, function (req, res) {
        debug(req.body, 'req.body');
        req.body.amount[0] = req.body.amount[0] === 'next' ? req.body.amount[1] : req.body.amount[0];
        if (checkErrors(req.body, 'ponctuel') === false) {
            console.log('Refused by server');
            var string = encodeURIComponent('<p style="font-size: 20px; font-family: Arial, serif; font-weight: bold; margin: auto; color: red;text-align: center;">Votre paiement à été refusé.</p>');
            res.redirect('/?valid=' + string);
            return;
        }
        return stripe.charges.create({
            source: req.body.stripeSource,
            amount: parseInt(req.body.amount[0] * 100),
            currency: 'eur'
        }).then(function (charge) {
            debug(charge, 'Charge');
            console.log('new charge created without customer');
            addTrans(req.body.civilite, req.body.nom, req.body.prenom, req.body.amount[0], 'ponctuel', req.body.email, req.body.tel, makeAdress(req.body));
            var string = encodeURIComponent('<p style="font-size: 20px; font-family: Arial, serif; font-weight: bold; margin: auto; color: green;text-align: center;">Votre paiement à été accepté.</p>');
            res.redirect('/?valid=' + string);
        }).catch(function (err) {
            debug(err, 'Error');
            res.redirect('/');
        });
    })

    .post('/mensuel', urlEncoded, function (req, res) {
        debug(req.body, 'req.body');
        if (checkErrors(req.body, 'mensuel') === false) {
            console.log('Refused by server');
            var string = encodeURIComponent('<p style="font-size: 20px; font-family: Arial, serif; font-weight: bold; margin: auto; color: red;text-align: center;">Votre paiement mensuel à été refusé.</p>');
            res.redirect('/?valid=' + string);
            return;
        }
        return stripe.customers.create({
            email: req.body.email,
            source: req.body.stripeSource,
        })
            .then(function (customer) {
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
                var string = encodeURIComponent('<p style="font-size: 20px; font-family: Arial, serif; font-weight: bold; margin: auto; color: green;text-align: center;">Votre paiement mensuel à été accepté.</p>');
                res.redirect('/?valid=' + string);
            }).catch(function (err) {
                debug(err, 'Error');
                console.log(err);
                res.redirect('/');
            });
    })

.listen(process.env.PORT || 8080);
