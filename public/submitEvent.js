var checkErrors = function(form) {
    // a refaire
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
        stripe.createSource(card).then(function (result) {
            if (result.error) {
                $('#cardError').text(result.error.message);
            }
            else {
                stripeSourceHandler(result.source);
            }
        });
        console.log('Submitted');
    });
};