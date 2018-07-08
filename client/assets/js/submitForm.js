function stripeSourceHandler(result, error, type) {
	if (result.error) {
		$('#' + error + 'Error').show().text(result.error.message);
		$('#' + error + 'Error').parent('.input-container').css({
			'border'			: '1px solid rgb(218,182,93)',
			'color'				: 'rgb(180, 134, 41)',
			'background-color'	: 'rgb(255, 249, 223)'
		});
		return (false);
	}
	else {
		$('#' + error + 'Error').hide();
		$('#' + error + 'Error').closest('.input-container').css({
			'border'	: '1px solid rgb(187, 214, 178)'
		});
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
		return (true);
	}
};

function showPaymentStatus() {
	$('#paymentStatus').show();
}

function submitForm() {
	if ($('.paymentOption.active').attr('type') === 'UNIQUE_DONATION') {
		site.stripe.createSource(creditCard).then(function (result) {
			if (stripeSourceHandler(result, 'stripeCard', 'unique')) {
				//continue sending
				showPaymentStatus();
				console.log('continue sending');
				var form = document.getElementById('paymentForm');
				var fd = new FormData(form);
				var data = {};
				for (var p of fd) {data[p[0]] = p[1];}
				$.ajax({
					url: '/',
					data: JSON.stringify(data),
					processData: false,
					contentType: 'application/json',
					type: 'POST'
				});
			} else {
				console.log('stop sending: error with card');
			}
		});
	
	} else {
		site.stripe.createSource({
			type: 'sepa_debit',
			sepa_debit: {
				iban: $('input[name="iban"]').val(),
			},
			currency: 'eur',
			owner: {
				name: $('input[name="firstname"]').val() + $('input[name="lastname"]').val(),
			},
		}).then(function(result) {
			// handle result.error or result.source
			if (stripeSourceHandler(result, null, 'monthly')) {
				console.log('continue sending');
				showPaymentStatus();
				var form = document.getElementById('paymentForm');
				var fd = new FormData(form);
				var data = {};
				for (var p of fd) {
					if (p[0] !== 'iban') {
						data[p[0]] = p[1];
					}
				}
				$.ajax({
					url: '/',
					data: JSON.stringify(data),
					processData: false,
					contentType: 'application/json',
					type: 'POST'
				});
			} else {
				console.log('stop sending: error with iban');
			}
		});
	}
}
