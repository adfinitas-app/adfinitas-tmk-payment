var stripe = Stripe('pk_test_UjvXyhdpMKpOEtP71vxFF2Ub');

var createCard = function() {
    var elements = stripe.elements();
    var card = elements.create('card');
    card.mount('#cardElement');
    return (card);
};

var card;
//ponctuelClickEvent();
//mensuelClickEvent();
//submitFormEvent(card);
//checkValidityEvent();

var PaymentType = Backbone.Model.extend({
    defaults: {
        paymentType: 'creditCard',
        html: '<div id="cardElement" type="color"></div>' +
        '            <div id="cardError" style="margin-bottom: 10px;"></div>'
    },
    getDefault: function () {
        return this.defaults.html;
    }
});

var getCode = function(type, model) {
    if (type === 'sepa') {
        return '<input type="text" name="iban" placeholder="Numéro de compte IBAN" id="iban">' +
            '<span class="help-block hidden"></span>' +
            '<div id="ibanError" style="margin-bottom: 10px;"></div>' +
            '<input type="text" name="adresseUne" id="adresseUne" placeholder="Adresse" class="">' +
            '            <span class="help-block hidden"></span>' +
            '            <input type="text" name="adresseDeux" id="adresseDeux" placeholder="Adresse (suite) - optionnel" class="">' +
            '            <span class="help-block hidden"></span>' +
            '            <div class="row">' +
            '                <div class="column small-12 medium-4">' +
            '                    <input type="text" name="ville" id="ville" placeholder="Ville" class="">' +
            '                    <span class="help-block hidden"></span>' +
            '                </div>' +
            '                <div class="column small-12 medium-4">' +
            '                    <input type="text" name="codePostal" id="codePostal" placeholder="Code postal" class="">' +
            '                    <span class="help-block hidden"></span>' +
            '                </div>\n' +
            '                <div class="column small-12 medium-4">' +
            '                    <select name="pays" class=""><option value="pays" disabled selected>Pays</option><option value="DE">Allemagne</option><option value="AT">Autriche</option><option value="BE">Belgique</option><option value="BG">Bulgarie</option><option value="CY">Chypre</option><option value="HR">Croatie</option><option value="DK">Danemark</option><option value="ES">Espagne</option><option value="EE">Estonie</option><option value="FI">Finlande</option><option value="FR">France</option><option value="GR">Grèce</option><option value="HU">Hongrie</option><option value="IE">Irlande</option><option value="IS">Islande</option><option value="IT">Italie</option><option value="LV">Lettonie</option><option value="LI">Liechtenstein</option><option value="LT">Lituanie</option><option value="LU">Luxembourg</option><option value="MT">Malte</option><option value="MC">Monaco</option><option value="NO">Norvège</option><option value="NL">Pays-Bas</option><option value="PL">Pologne</option><option value="PT">Portugal</option><option value="RO">Roumanie</option><option value="GB">Royaume-Uni</option><option value="CZ">République tchèque</option><option value="SM">Saint-Marin</option><option value="SK">Slovaquie</option><option value="SI">Slovénie</option><option value="CH">Suisse</option><option value="SE">Suède</option></select>' +
            '                    <span class="help-block hidden"></span>' +
            '                </div>' +
            '            </div>';
    }
    else
        return model.getDefault();
};

var PaymentTypeView = Backbone.View.extend({

    el: '#paymentTypeTemplate',

    initialize: function() {
        this.render();
        this.model.on('change', this.renderForm, this);
        card = createCard();
        this.fixOtherAmount();
    },

    events: {
        'click .paymentOption': 'choosePaymentType',
    },

    render: function() {
        var template = _.template( $('#paymentTemplate').html(), {} );
        var html = template(this.model.toJSON());
        this.$el.html(html);
        $('#btnPonctuel').css({
            'border-bottom': '2px solid red',
            'color': 'red',
            'font-weight': 'bold'
        });
        return this;
    },

    choosePaymentType: function(e) {
        e.preventDefault();
        var paymentType = $(e.currentTarget).data('payment-type');
        var html = getCode(paymentType, this.model);
        this.model.set({'paymentType': paymentType, 'html': html});
    },

    renderForm: function() {
        this.render();
        if (this.model.get('paymentType') === 'creditCard') {
            card = createCard();
            $('#btnPonctuel').css({
                'border-bottom': '2px solid red',
                'color': 'red',
                'font-weight': 'bold'
            });
            $('#btnMensuel').css({
                'border-bottom': 'none',
                'color': 'inherit',
                'font-weight': 'normal'
            });
            $('option#autre').show();
        }
        else if (this.model.get('paymentType') === 'sepa') {
            $('#btnMensuel').css({
                'border-bottom': '2px solid red',
                'color': 'red',
                'font-weight': 'bold'
            });
            $('#btnPonctuel').css({
                'border-bottom': 'none',
                'color': 'inherit',
                'font-weight': 'normal'
            });
            $('option#autre').hide();
        }
    },

    fixOtherAmount: function () {
        //Au changement de montant avec le select :
        $('form#paymentForm select[name="amount"]').on('change', function (e) {
            var otherAmount = $('#otherAmount');
            // si le truc selectionné a pour id 'autre' et qu'il y a pas encore de input text Autre montant en dessous
            if (this[this.selectedIndex].id === 'autre' && otherAmount.length === 0) {
                // insertion de l'input text Autre montant en dessous du select avec effet
                $('<input type="text" name="otherAmount" id="otherAmount" placeholder="Veuillez indiquer votre montant" style="display: none;">')
                    .insertAfter(this).show(500, function() {
                    //placement du curseur sur l'input text Autre montant
                    this.focus();
                    // on recupere la bordure du select pour savoir si il y a une erreur ou pas
                    var border = $('form#paymentForm select[name="amount"]').css('border');
                    // si il y a une bordure differente de celle de base
                    if (border !== '1px solid rgb(202, 202, 202)') {
                        // on la transfere sur le nouvelle input "Autre montant"
                        $(this).css('border', border);
                        $('form#paymentForm select[name="amount"]').css({'margin-bottom': '10px', 'border': '1px solid #cacaca'});
                        // si la bordure est rouge (il y a une erreur après) on met pas de marge bottom pour que l'erreur soit collé
                        if (border === '1px solid rgb(255, 0, 0)') {
                            $(this).css('margin-bottom', '0');
                        } else {
                            $(this).css('margin-bottom', '10px');
                        }
                    }
                });
                $('#otherAmount').on('change', function() {
                    $('select[name="amount"] #autre').attr('value', this.value);
                });
            }
            else if (otherAmount.length > 0) {
                //fait disparaitre l'input text Autre montant
                otherAmount.hide(600, 'swing', function () {
                    // le supprime du DOM
                    var border = $(this).css('border');
                    if (border !== '1px solid rgb(202, 202, 202)') {
                        $('form#paymentForm select[name="amount"]').css('border', border);
                        if (border === '1px solid rgb(255, 0, 0)') {
                            $('select[name="amount"]').css('margin-bottom', '0');
                        }
                        else {
                            $('select[name="amount"]').css('margin-bottom', '10px');
                        }
                    }
                    this.remove();
                });
                // suppression de l'event
                $('#otherAmount').off('change');
                //Remise de la valeur du select Autre montant a 'autre'
                $('select[name="amount"] #autre').attr('value', 'autre');
            }
        });
    }
});

var InputValidationModel = Backbone.Model.extend({
    validation: {
        amount: [{
            required: true,
            msg: 'Veuillez entrer un montant.'
        }, {
            pattern: /^[0-9]+(,|.[0-9]{1,2})?$/,
            msg: 'Veuillez entrer un montant valide.'
        }, {
            range: [1, 999999],
            msg: 'Le montant doit être compris entre 1 et 999 999€: '
        }],
        email: [{
            required: true,
            msg: 'Veuillez entrer une adresse e-mail.'
        }, {
            pattern: 'email',
            msg: 'Veuillez entrer une adresse e-mail valide.'
        }],
        civilite: [{
            required: true,
            msg: 'Veuillez indiquer une civilité.'
        }, {
            oneOf: ['Mr', 'Mme', 'autre'],
            msg: 'Veuillez indiquez une civlité valide.'
        }],
        prenom: [{
            required: true,
            msg: 'Veuillez indiquer votre prénom.'
        }, {
            pattern: /^[a-zA-Z ]+(-[a-zA-Z ]{1,128})?$/,
            msg: 'Veuillez entrez un prénom composé d\'uniquement 1 à 128 lettres.'
        }],
        nom: [{
            required: true,
            msg: 'Veuillez indiquer votre nom.'
        }, {
            pattern: /^[a-zA-Z ]+(-[a-zA-Z ]{1,128})?$/,
            msg: 'Veuillez entrez un nom composé d\'uniquement 1 à 128 lettres.'
        }],
        iban: {
            required: function () {
                return $('#cardElement').length > 0 ? false : true;
            },
            msg: 'Veuillez entrer votre IBAN.'
        },
        adresseUne: {
            required: function () {
                return $('#cardElement').length > 0 ? false : true;
            },
            msg: 'Veuillez entrer votre adresse.'
        },
        adresseDeux: {
            required: false
        },
        ville: {
            required: function () {
                return $('#cardElement').length > 0 ? false : true;
            },
            msg: 'Veuillez entrer votre ville.'
        },
        codePostal: {
            required: function () {
                return $('#cardElement').length > 0 ? false : true;
            },
            pattern: /^[0-9]{5,5}?$/,
            msg: 'Veuillez entrer un code postal valide.'
        },
        pays: {
            required: function () {
                return $('#cardElement').length > 0 ? false : true;
            },
            oneOf: ['DE', 'AT', 'BE', 'BG', 'CY', 'HR', 'DK', 'ES', 'EE', 'FI', 'FR', 'GR', 'HU', 'IS', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'MC', 'NO', 'NL', 'PL', 'PT', 'RO', 'GB', 'CZ', 'SM', 'SK', 'SI', 'CH', 'SE'],
            msg: 'Veuillez entrer un pays valide.'
        },
        tel: {
            required: false,
            pattern: /^(0|\+33|0033)[1-9][0-9]{8}?$/,
            msg: 'Veuillez entrer un numéro de téléphone valide.'
        }
    }
});

$.fn.serializeObject = function () {
    "use strict";
    var a = {}, b = function (b, c) {
        var d = a[c.name];
        "undefined" != typeof d && d !== null ? $.isArray(d) ? d.push(c.value) : a[c.name] = [d, c.value] : a[c.name] = c.value
    };
    return $.each(this.serializeArray(), b), a
};

_.extend(Backbone.Validation.callbacks, {
    valid: function (view, attr, selector) {
        var $el = view.$('[name=' + attr + ']').last();
        if ((attr === 'tel' || attr === 'adresseDeux') && $el.val() === '')
            return ;
        if (attr === 'amount' && view.$('[name="otherAmount"]').length > 0)
            $el = view.$('[name="otherAmount"]').last();
        $el.css({'border': '1px solid green', 'margin-bottom': '16px'}).nextAll('.help-block').first().html('').css({'display': 'none'});
        console.log('valid: %c' + attr, "color:green;");
    },
    invalid: function (view, attr, error, selector) {
        var $el = view.$('[name=' + attr + ']').last();
        if (attr === 'amount' && view.$('[name="otherAmount"]').length > 0)
            $el = view.$('[name="otherAmount"]').last();
        $el.css({'border': '1px solid red', 'margin-bottom': '0'}).nextAll('.help-block').first().css({'margin-bottom': '10px', 'display': 'block', 'padding': '0 0 0 5px'}).html(error);
        console.log('invalid: %c' + attr, "color:red;");
    }
});

var stripeSourceHandler = function (result, error, type) {
    if (result.error) {
        $('#' + error + 'Error').text(result.error.message);
    }
    else {
        var form = document.getElementById('paymentForm');
        var hiddenInput = document.createElement('input');
        hiddenInput.setAttribute('type', 'hidden');
        hiddenInput.setAttribute('name', 'stripeSource');
        hiddenInput.setAttribute('value', result.source.id);
        form.appendChild(hiddenInput);
        var hiddenInput2 = document.createElement('input');
        hiddenInput2.setAttribute('type', 'hidden');
        hiddenInput2.setAttribute('name', 'paymentType');
        hiddenInput2.setAttribute('value', type);
        form.appendChild(hiddenInput2);
        form.submit();
    }
};

var InputValidationView = Backbone.View.extend({

    el: '#paymentForm',

    events: {
        'click #btnSubmit': 'inputValidation'
    },

    initialize: function (data) {
        this.paymentModel = data.model2;
        Backbone.Validation.bind(this);
        this.model.bind('validated:invalid', function(model, errors) {
            // do something
        });
    },

    inputValidation: function (e) {
        e.preventDefault();
        var data = this.$el.serializeObject();

        this.model.set(data);

        if (this.model.isValid(true)) {
            if (this.paymentModel.get('paymentType') === 'creditCard') {
                stripe.createSource(card).then(function (result) {
                    stripeSourceHandler(result, 'card', 'creditCard')
                });
            }
            else if (this.paymentModel.get('paymentType') === 'sepa') {
                stripe.createSource({
                    type: 'sepa_debit',
                    sepa_debit: {
                        iban: $('#iban').val(),
                    },
                    currency: 'eur',
                    owner: {
                        name: [$('#prenom').val(), $('#nom').val()].join(' '),
                    },
                }).then(function(result) {
                    stripeSourceHandler(result, 'iban', 'sepa')
                });
            }
        }
    },

    remove: function() {
        Backbone.Validation.unbind(this);
        return Backbone.View.prototype.remove.apply(this, arguments);
    }
});

$(document).ready(function () {
    var paymentType = new PaymentType();
    var paymentTypeView = new PaymentTypeView({model : paymentType});
    var inputValidationModel = new InputValidationModel();
    var inputValidationView = new InputValidationView({model: inputValidationModel, model2: paymentType});
});