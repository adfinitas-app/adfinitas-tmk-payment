function regexVerif(input, regex) {
	if (regex.test(input) === true) {
		return true;
	}
	else {
		return false;
	}
}

function checkRequired(data, element) {
	console.log('CHECKING REQUIRED');
	if (data[element].required) {
		if (data[element].selector.val() === '' || data[element].selector.val() === undefined) {
			return (1);
		} else {
			return (0);
		}
	}
	return (0);
}

function checkPattern(data, element) {
	console.log('CHECKING PATTERN');
	if (data[element].pattern) {
		if (data[element].selector !== undefined && data[element].selector.val() !== undefined && data[element].selector.val() !== '') {
			if (!regexVerif(data[element].selector.val(), data[element].pattern.regex)) {
				return (1);
			} else {
				return (0);
			}
		} else {
			return (0);
		}
	}
	return (0);
}

function checkExtra(data, element) {
	console.log('CHECKING EXTRA');
	if (data[element].extra) {
		if (data[element].extra.testFunction(data[element].selector.val()) === false) {
			return (1);
		} else {
			return (0);
		}
	}
	return (0);
}

function checkValidation(data, element, show) {
	var error = 0;
	var arrayFunc = [
		[checkRequired, data[element].required],
		[checkPattern, data[element].pattern],
		[checkExtra, data[element].extra]
	];

	console.log('%c' + element + ': ' + data[element].selector.selector, 'color: blue');
	for (var i = 0; i < 3; i++) {
		error = (arrayFunc[i][0])(data, element);
		if (error > 0) {
			if (show) {
				showError(data[element].borderSelector, (arrayFunc[i][1]).message);
			} else {
				showBorderError(data[element].borderSelector, (arrayFunc[i][1]).message);
			}
			return (error);
		}
		console.log('%cOK', 'color: green');
	}
	if (show) {
		hideError(data[element].borderSelector);
	} else {
		showBorderValid(data[element].borderSelector);
	}
	console.log('');
	return (error);
}

function showBorderError(selector, message) {
	console.log('%cKO', 'color: red;');
	if (selector.hasClass('invalid')) {
		selector.children('.error-message').html(message);
	}
	selector.addClass('invalid');
	selector.removeClass('valid');
	selector.css({
		'border'	: '1px solid #dab65d'
	});
}

function showBorderValid(selector) {
	if (selector.hasClass('invalid')) {
		selector.children('.error-message').remove();
	}
	selector.removeClass('invalid');
	selector.addClass('valid');
	selector.css({
		'border'	: '1px solid rgb(187, 214, 178)'
	});
}

function hideError(selector) {
	console.log('%cOK', 'color: green;');
	selector.children('.error-message').remove();
	selector.removeClass('error-showed');
	selector.css({
		'border'		: '1px solid rgb(187, 214, 178)'
	});
	selector.addClass('valid');
	selector.removeClass('invalid');

	return (0);
}

function showError(selector, message) {
	console.log('%cKO', 'color: red;');
	selector.css({
		'border'		: '1px solid rgb(218,182,93)',
		'background'	: '#fff9df',
		'color'			: '#b48629'
	});
	selector.addClass('invalid');
	if (selector.hasClass('error-showed') === false) {
		selector.prepend('<p class="error-message">' + message + '</p>');
		selector.addClass('error-showed');
	} else {
		selector.children('.error-message').html(message);
	}
	return (0);
}

function getDataValidation() {
	var data = {

		email		: {
			selector		: $('input[name="email"]'),
			borderSelector	: $('input[name="email"]').closest('.input-container'),
			required		: {
				message: 'Veuillez entrer une adresse e-mail.'
			},
			pattern: {
				regex: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
				message: 'Veuillez entrer une adresse e-mail valide.'
			},
			extra: undefined
		},
		civility	: {
			selector		: $('select[name="civility"]'),
			borderSelector	: $('select[name="civility"]').closest('.input-container'),
			required		: {
				message: 'Veuillez indiquer une civilité.'
			},
			pattern: undefined,
			extra: undefined
		},
		firstname	: {
			selector		: $('input[name="firstname"]'),
			borderSelector	: $('input[name="firstname"]').closest('.input-container'),
			required		: {
				message: 'Veuillez indiquer votre prénom.'
			},
			pattern: undefined,
			extra: undefined
		},
		lastname	: {
			selector		: $('input[name="lastname"]'),
			borderSelector	: $('input[name="lastname"]').closest('.input-container'),
			required		: {
				message: 'Veuillez indiquer votre nom.'
			},
			pattern: undefined,
			extra: undefined
		},
		iban		: {
			selector		: $('input[name="iban"]'),
			borderSelector	: $('input[name="iban"]').closest('.input-container'),
			required: ($('.paymentOption.active').attr('type') === 'MONTHLY_DONATION') ? {message: "Veuillez entrer votre IBAN."} : undefined,
			pattern: {
				regex: /^AL\d{10}[0-9A-Z]{16}$|^AD\d{10}[0-9A-Z]{12}$|^AT\d{18}$|^BH\d{2}[A-Z]{4}[0-9A-Z]{14}$|^BE\d{14}$|^BA\d{18}$|^BG\d{2}[A-Z]{4}\d{6}[0-9A-Z]{8}$|^HR\d{19}$|^CY\d{10}[0-9A-Z]{16}$|^CZ\d{22}$|^DK\d{16}$|^FO\d{16}$|^GL\d{16}$|^DO\d{2}[0-9A-Z]{4}\d{20}$|^EE\d{18}$|^FI\d{16}$|^FR\d{12}[0-9A-Z]{11}\d{2}$|^GE\d{2}[A-Z]{2}\d{16}$|^DE\d{20}$|^GI\d{2}[A-Z]{4}[0-9A-Z]{15}$|^GR\d{9}[0-9A-Z]{16}$|^HU\d{26}$|^IS\d{24}$|^IE\d{2}[A-Z]{4}\d{14}$|^IL\d{21}$|^IT\d{2}[A-Z]\d{10}[0-9A-Z]{12}$|^[A-Z]{2}\d{5}[0-9A-Z]{13}$|^KW\d{2}[A-Z]{4}22!$|^LV\d{2}[A-Z]{4}[0-9A-Z]{13}$|^LB\d{6}[0-9A-Z]{20}$|^LI\d{7}[0-9A-Z]{12}$|^LT\d{18}$|^LU\d{5}[0-9A-Z]{13}$|^MK\d{5}[0-9A-Z]{10}\d{2}$|^MT\d{2}[A-Z]{4}\d{5}[0-9A-Z]{18}$|^MR13\d{23}$|^MU\d{2}[A-Z]{4}\d{19}[A-Z]{3}$|^MC\d{12}[0-9A-Z]{11}\d{2}$|^ME\d{20}$|^NL\d{2}[A-Z]{4}\d{10}$|^NO\d{13}$|^PL\d{10}[0-9A-Z]{,16}n$|^PT\d{23}$|^RO\d{2}[A-Z]{4}[0-9A-Z]{16}$|^SM\d{2}[A-Z]\d{10}[0-9A-Z]{12}$|^SA\d{4}[0-9A-Z]{18}$|^RS\d{20}$|^SK\d{22}$|^SI\d{17}$|^ES\d{22}$|^SE\d{22}$|^CH\d{7}[0-9A-Z]{12}$|^TN59\d{20}$|^TR\d{7}[0-9A-Z]{17}$|^AE\d{21}$|^GB\d{2}[A-Z]{4}\d{14}$/,
				message: 'Veuillez entrer un IBAN valide.'
			},
			extra: {
				testFunction: function (val) {

					// si type de paoiement = unique, alors vérifier sa validitée ici.
					return true;

				},
				message: 'Veuillez entrer votre IBAN.'
			}
		},
		address1	: {
			selector		: $('input[name="address1"]'),
			borderSelector	: $('input[name="address1"]').closest('.input-container'),
			required		: {
				message: 'Veuillez indiquer votre adresse.'
			},
			pattern: undefined,
			extra: undefined
		},
		address2	: {
			selector		: $('input[name="address2"]'),
			borderSelector	: $('input[name="address2"]').closest('.input-container'),
			required: undefined,
			pattern: undefined,
			extra: undefined
		},
		city		: {
			selector		: $('input[name="city"]'),
			borderSelector	: $('input[name="city"]').closest('.input-container'),
			required		: {
				message: 'Veuillez indiquer votre ville.'
			},
			pattern: undefined,
			extra: undefined
		},
		country		: {
			selector		: $('select[name="country"]'),
			borderSelector	: $('select[name="country"]').closest('.input-container'),
			required		: {
				message: 'Veuillez indiquer votre pays.'
			},
			pattern: undefined,
			extra: {
				testFunction: function (val) {
					var oneCtry = (site.getCountries())[0];
					var result = (oneCtry.indexOf(val) >= 0) ? true : false;
					console.log(result);
					return result;
				},
				message: 'Veuillez choisir un pays valide.'
			}
		},
		postalcode	: {
			selector		: $('input[name="postalcode"]'),
			borderSelector	: $('input[name="postalcode"]').closest('.input-container'),
			required		: {
				message: 'Veuillez indiquer votre code postale.'
			},
			pattern: {
				regex: /^[0-9]{5,5}?$/,
				message: 'Veuillez entrer un code postal valide.'
			},
			extra: undefined
		},
		phone		: {
			selector		: $('input[name="phone"]'),
			borderSelector	: $('input[name="phone"]').closest('.input-container'),
			required: undefined,
			pattern: {
				regex: /^(0|\+33|0033)[1-9][0-9]{8}?$/,
				message: 'Veuillez entrer un numéro de téléphone valide.'
			},
			extra: undefined
		},
	};
	return (data);
}

function formValidation() {
	var data = getDataValidation();
	var error = 0;

	for (element in data) {
		error += checkValidation(data, element, true);
	}

	//Check amount
	if ($('#amount-other').prop('checked') === true) {
		if (regexVerif($('#amount-other').val(), /^[0-9]+(,|.[0-9]{1,2})?$/) === false) {
			$('#amount-other-text').closest('.input-container').css({
				'border'	: '1px solid rgb(218,182,93)'
			});
			error += 1;
			$('#amount-other-text').closest('.input-container').addClass('invalid').removeClass('valid');
		} else {
			$('#amount-other-text').closest('.input-container').css({
				'border'	: '1px solid rgb(187, 214, 178)'
			});
			$('#amount-other-text').closest('.input-container').addClass('valid').removeClass('invalid');
		}
	}

	if (error > 0) {
		console.log('Too much errors');
		return false;
	}
	console.log('ALL OK : SUBMITTING FORM');
	submitForm();
}

function passiveFormValidation() {
	var data = getDataValidation();

	$('.input-container input, .input-container select').on('focus', function() {
		console.log('focus');
		if ( $(this).closest('.input-container').hasClass('invalid') === false && $(this).closest('.input-container').hasClass('valid') === false) {
			$(this).closest('.input-container').css({
				border: '1px solid #737273'
			});
		}
	});

	$('.input-container input, .input-container select').on('focusout', function() {
		if ( $(this).closest('.input-container').hasClass('invalid') === false && $(this).closest('.input-container').hasClass('valid') === false) {
			$(this).closest('.input-container').css({
				border: '1px solid #cacaca'
			});
		}
	});

	$('.field').on('input', function () {
		var name = $(this).attr('name');
		checkValidation(data, name, false);
	});
}
