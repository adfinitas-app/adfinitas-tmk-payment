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

var extractUrlParams = function(){
    var t = document.location.search.substring(1).split('&'); var f = [];
    for (var i=0; i<t.length; i++){
        var x = t[ i ].split('=');
        f[x[0]]=decodeURIComponent(x[1]);
    }
    return f;
};
var p = extractUrlParams();
if ('valid' in p)
{
    $('#payment-form').append(decodeURIComponent(p['valid']));
    window.history.pushState("", "", '/');
}
fixOtherAmount();
var card = createCard();
switchFormEvent();
submitFormEvent(card);
checkValidityEvent();