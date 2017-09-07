var checkErrors = function(form) {
    var error = 0;
    error += checkValidity('email', /^[^\W][a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*\@[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*\.[a-zA-Z]{2,4}$/, 'submit');
    //error += checkValidity('prenom', /^[a-zA-Z]+(-[a-zA-Z]{1,100})?$/, 'submit');
    //error += checkValidity('nom', /^[a-zA-Z]+(-[a-zA-Z]{1,100})?$/, 'submit');
    if ( $('#tel').value ) {
        error += checkValidity('tel', /^(0|\+33|0033)[1-9][0-9]{8}?$/, 'submit');
    }
    if ( document.getElementById('amount-5').checked === true && boolType === true) {
        error += checkValidity('otherAmount', /^[0-9]+(,|.[0-9]{1,2})?$/, 'submit');
    }
    //error += checkValidity('codePostal', /^[0-9]{5,5}?$/, 'submit');
    if (boolType === false) {  // Mensuel
        if (form.attr('action') !== '/mensuel')
            form.attr('action', '/mensuel');
    }
    else if (boolType === true) { // Ponctuel
        if (form.attr('action') !== '/ponctuel')
            form.attr('action', '/ponctuel');
    }
    $('div#mensuel select option').first().attr('value', '5').next().attr('value', '10').next().attr('value', '15').next().attr('value', '20').next().attr('value', '25').next().attr('value', '30');
    if (error > 0)
        return false;
    return true;
};

function stripeSourceHandler(source) {
    var form = document.getElementById('payment-form');
    var hiddenInput = document.createElement('input');
    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('name', 'stripeSource');
    hiddenInput.setAttribute('value', source.id);
    form.appendChild(hiddenInput);
    form.submit();
}

var submitFormEvent = function(card) {
    $('#payment-form').submit(function(event) {
        event.preventDefault();
        var otherAmount = $('#amount-5');
        otherAmount.attr('value', otherAmount.next('input').attr('value'));
        if (checkErrors( $(this) ) === false)
        {
            console.log('Not submitted');
            return false;
        }
        if (boolType === true && $(this).attr('action') === '/ponctuel') {
            stripe.createSource(card).then(function (result) {
                if (result.error) {
                    $('#cardError').text(result.error.message);
                }
                else {
                    stripeSourceHandler(result.source);
                }
            });
        }
        else if (boolType === false && $(this).attr('action') === '/mensuel') {
            console.log('Traitement Mensuel');
            // stripe.createSource({
            //     type: "sepa_debit",
            //     sepa_debit: {
            //         iban: $('#account_number').val(),
            //     },
            //     currency: 'eur',
            //     owner: {
            //         name: $('#prenom').val() + ' ' + $('#nom').val(),
            //     },
            // }).then(function(result) {
            //    if (result.error) {
            //        $('#formError').text(result.error.message);
            //    }
            //    else {
            //        stripeSourceHandler(result.source);
            //    }
            // });
            stripe.createSource(card).then(function (result) {
                if (result.error) {
                    $('#cardError').text(result.error.message);
                }
                else {
                    stripeSourceHandler(result.source);
                }
            });
        }
        console.log('Submitted');
    });
};