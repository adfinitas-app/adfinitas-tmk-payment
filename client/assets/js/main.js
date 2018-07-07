var site = {
	settings			: {},
	stripe				: Stripe('pk_test_Z55r5B5tPTiP36UUSJiJftze'),
	creditCard			: {},

	getSettings			: function() {
		return new Promise((resolve, reject) => {
			$.when( $.get('assets/layouts/settings.cfg') ).done(function(data) {
				resolve(data);
			}).fail(function() {
				console.log('Failed to load settings.');
			});
		});
	},
	start				: function() {
		console.log('start');
		$(window).resize(site.resize);
		site.init();
	},
	resize				: function() {
		console.log('resize');
	},
	init				: function() {
		console.log('init');
		site.getSettings().then(function(data) {
			settings = JSON.parse(data);
			site.loadTemplates().then(function(template) {
					var formView = new(site.FormView(template));
					site.fillOutForm();
					site.formatTel();
					passiveFormValidation();
					var socket = io.connect(settings.APP_URL);

					socket.on('paymentError', function() {
						console.log('received paymentError');
						$('#paymentStatus').html('Paiement refusé !').css('color', 'red');
					});

					socket.on('paymentSuccess', function() {
						console.log('received paymentSuccess');
						$('#paymentStatus').html('Paiement accepté !').css('color', 'green');
					});
				});
		});
	},
	extractUrlParams	: function() {
		var t = document.location.search.substring(1).split('&'); var f = [];
		for (var i=0; i<t.length; i++){
			var x = t[ i ].split('=');
			f[x[0]]=decodeURIComponent(x[1]);
		}
		return f;
	},
	fillOutForm			: function() {
		var query 		= site.extractUrlParams();
		var variables	= [
			'firstname',
			'lastname',
			'email',
			'address1',
			'address2',
			'postalcode',
			'city',
			'phone'
		];
		for (i in query) {
			if (variables.indexOf(i) >= 0) {
				$('input[name="' + i + '"]').val(query[i]);
			}
		}
		if ('civility' in query) {
			if (query['civility'] === 'M') {
				$('select[name="civility"]>option:eq(1)').prop('selected', true);
			} else if (query['civility'] === 'MME') {
				$('select[name="civility"]>option:eq(2)').prop('selected', true);
			}
		}
		if ('amount' in query) {
			if (query['amount'] === settings.UNIQUE_DONATION.AMOUNT_1) {
				$('#amount-1').prop('checked', true);
			} else if (query['amount'] === settings.UNIQUE_DONATION.AMOUNT_2) {
				$('#amount-2').prop('checked', true);
			} else if (query['amount'] === settings.UNIQUE_DONATION.AMOUNT_3) {
				$('#amount-3').prop('checked', true);
			} else {
				$('#amount-other-text').val(query['amount'] / 100);
				$('#amount-other-text').trigger('click');
				$('#amount-other-text').trigger('blur');
			}
		}
		if ('country' in query) {
			var countries = site.getCountries();
			if (countries[0].indexOf(query['country']) >= 0) {
				$('select[name="country"] > option:eq(' + parseInt(countries[0].indexOf(query['country']) + 1) + ')').prop('selected', true);
			} else if (countries[1].indexOf(query['country']) >= 0) {
				$('select[name="country"] > option:eq(' + parseInt(countries[1].indexOf(query['country']) + 1) + ')').prop('selected', true);
			}
		}
	},
	getCountries		: function() {
		var countries = [
			[], []
		];
		$('select[name="country"] option').each(function() {
			if ($(this).attr('value') !== '') {
				countries[0].push($(this).attr('value'));
				countries[1].push($(this).text());
			}
		});
		return (countries);
	},
	formatTel			: function() {
		$('#tel').intlTelInput({
			initialCountry: "fr",
			onlyCountries: ["al", "ad", "at", "by", "be", "ba", "bg", "hr", "cz", "dk",
			"ee", "fo", "fi", "fr", "de", "gi", "gr", "va", "hu", "is", "ie", "it", "lv",
			"li", "lt", "lu", "mk", "mt", "md", "mc", "me", "nl", "no", "pl", "pt", "ro",
			"ru", "sm", "rs", "sk", "si", "es", "se", "ch", "ua", "gb"]
		});
	},
	PaymentTypeModel	: function() {
		return (
			Backbone.Model.extend({
				defaults: {
					AMOUNT_1	: settings.UNIQUE_DONATION.AMOUNT_1 / 100,
					AMOUNT_2	: settings.UNIQUE_DONATION.AMOUNT_2 / 100,
					AMOUNT_3	: settings.UNIQUE_DONATION.AMOUNT_3 / 100,
					AUTRE		: site.uniqueDonationHtml(),
					type		: site.uniqueDonationType()
				}
			})
		);
	},
	monthlyDonationHtml	: function() {
		return (`<div class="input-container">
					<input type="text" name="iban" placeholder="Numéro de compte IBAN*" class="field"/>
				</div>`);
	},
	uniqueDonationType	: function() {
		return ('UNIQUE_DONATION');
	},
	uniqueDonationHtml	: function() {
		return (`<div>
			<label for="amount-other">
			<input type="radio" value="other" id="amount-other" name="amount" /><div class="input-container" style="display: inline-block;"><input type="text" id="amount-other-text" placeholder="Autre montant"/></div> €
			</label>
			</div>
			<div class="input-container">
				<div id="stripeCardError"></div>
				<div id="stripeCardElement" type="text"></div>
			</div>
			`);
	},
	monthlyDonationType	: function() {
		return ('MONTHLY_DONATION');
	},
	loadTemplates		: function() {
		return new Promise((resolve, reject) => {
			var template = {};

			$.when(
				$.get('assets/layouts/form.template'),
				$.get('assets/layouts/header.template'),
				$.get('assets/layouts/fields.template'),
				$.get('assets/layouts/paymentType.template'),
				$.get('assets/layouts/footer.template')
			).done(function(data0, data1, data2, data3, data4) {
				template.form = data0[0];
				template.header = data1[0];
				template.fields = data2[0];
				template.paymentType = data3[0];
				template.footer = data4[0];
				resolve(template);
			}).fail(function() {
				console.log('Failed to load one or more template.');
			});
		});
	},
	createCard			: function() {
		var elements = this.stripe.elements();
		var card = elements.create('card', {hidePostalCode: true});
		card.mount('#stripeCardElement');
		return (card);
	},
	FormView			: function(template) {
		return (
			Marionette.View.extend({
				el			: settings.WRAPPER_JQ_SELECTOR,
				template	: _.template(template.form),
				regions		: {
					header		: '#headerRegion',
					fields		: '#fieldsRegion',
					paymentType	: '#paymentTypeRegion',
					footer		: '#footerRegion'
				},
				initialize	: function() {
					console.log('init formView');
					this.render();
					$('#btnSubmit').click(site.validateForm);
				},
				onRender	: function() {
					this.headerView = new(site.HeaderView(template));
					this.fieldsView = new(site.FieldsView(template));
					this.paymentTypeView = new(site.PaymentTypeView(template))({
						model: new (site.PaymentTypeModel())
					});
					this.footerView = new(site.FooterView(template));

					this.showChildView('header', this.headerView);
					this.showChildView('fields', this.fieldsView);
					this.showChildView('paymentType', this.paymentTypeView);
					this.showChildView('footer', this.footerView);

					creditCard = site.createCard();

				}
			})
		);
	},
	HeaderView			: function(template) {
		return (
			Marionette.View.extend({
				template: _.template(template.header)
			})
		);
	},
	FieldsView			: function(template) {
		return (
			Marionette.View.extend({
				template: _.template(template.fields)
			})
		);
	},
	PaymentTypeView		: function(template) {
		return (
			Marionette.View.extend({
				model		: this.model,
				template	: _.template(template.paymentType),
				events		: {
					'click .paymentOption'		: 'updateModel',
					'click #amount-other-text'	: 'fixOtherAmount',
					'click #amount-other'		: 'focusInputText'
				},
				modelEvents	: {
					'change:type':	'myRender'
				},
				updateModel	: function (e) {
					e.preventDefault();
					if ($(e.currentTarget).attr('type') === site.uniqueDonationType()) {
						this.model.set({
							'AUTRE'		: site.uniqueDonationHtml(),
							'type'		: site.uniqueDonationType(),
							'AMOUNT_1'	: settings.UNIQUE_DONATION.AMOUNT_1 / 100,
							'AMOUNT_2'	: settings.UNIQUE_DONATION.AMOUNT_2 / 100,
							'AMOUNT_3'	: settings.UNIQUE_DONATION.AMOUNT_3 / 100
						});
						$(e.currentTarget).addClass('active');
					} else if ($(e.currentTarget).attr('type') === site.monthlyDonationType()) {
						this.model.set({
							'AUTRE'		: site.monthlyDonationHtml(),
							'type'		: site.monthlyDonationType(),
							'AMOUNT_1'	: settings.MONTHLY_DONATION.AMOUNT_1 / 100,
							'AMOUNT_2'	: settings.MONTHLY_DONATION.AMOUNT_2 / 100,
							'AMOUNT_3'	: settings.MONTHLY_DONATION.AMOUNT_3 / 100
						});
					}
				},
				myRender	: function () {
					this.render();
					if (this.model.get('type') === site.uniqueDonationType()) {
						$('.paymentOption[type="UNIQUE_DONATION"]').addClass('active');
						$('.paymentOption[type="MONTHLY_DONATION"]').removeClass('active');
						creditCard = site.createCard();
					} else if (this.model.get('type') === site.monthlyDonationType()){
						$('.paymentOption[type="MONTHLY_DONATION"]').addClass('active');
						$('.paymentOption[type="UNIQUE_DONATION"]').removeClass('active');
					}
					passiveFormValidation();
				},
				fixOtherAmount:		function () {
					$('#amount-other').trigger('click');
					$('#amount-other-text').on('blur', function() {
						$('#amount-other').attr('value', $(this).val() );
					});
				},
				focusInputText: function () {
					$('#amount-other-text').focus();
				}
			})
		);
	},
	FooterView			: function(template) {
		return (
			Marionette.View.extend({
				template: _.template(template.footer)({
					SITE_NAME	: settings.SITE_NAME,
					URL			: settings.URL
				})
			})
		);
	},
	validateForm		: function() {
		formValidation();
	},
};

$(document).ready(function() {
	site.start();
});
