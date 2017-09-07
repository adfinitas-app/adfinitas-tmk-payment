var stripe = Stripe('pk_test_UjvXyhdpMKpOEtP71vxFF2Ub');
var boolType = true; // true -> Paiement ponctuel   False -> Paiement mensuel

var fixOtherAmount = function() {
    $('label[for="amount-5"]').click(function() {
        document.getElementById('amount-5').checked = true;
        $('#otherAmount').focus();
    });

    $('.definedAmount').click(function() {
        $('#otherAmount').removeClass('invalid valid').addClass('field');
    });
};

var createCard = function() {
    var elements = stripe.elements();
    var classes = {
        base: 'field',
        complete: 'valid',
        invalid: 'invalid'
    };
    var card = elements.create('card', {classes: classes});
    card.mount('#cardElement');
    return (card);
};

var switchFormEvent = function() {
    var ponctuelDiv = $('#ponctuel');
    var mensuelDiv = $('#mensuel');
    var form = $('#payment-form');

    ponctuelClickEvent(ponctuelDiv, mensuelDiv, form);
    mensuelClickEvent(ponctuelDiv, mensuelDiv, form);
};

fixOtherAmount();
var card = createCard();
switchFormEvent();
submitFormEvent(card);
checkValidityEvent();