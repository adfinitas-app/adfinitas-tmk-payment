var checkValidity = function(elem, regex, type) {
        var input= $('#' + elem);
        var re = regex;
        var is_valid = re.test(input.val());
        if ( is_valid ) {
            input.removeClass("invalid").addClass("valid");
            return false;
        }
        else {
            if (input.val() || type === 'submit')
                input.removeClass("valid").addClass("invalid");
            else
                input.removeClass("valid invalid").addClass("field");
            return true;
        }
    };

var checkValidityEvent = function() {
    $('#email').blur(function () {
        checkValidity('email', /^[^\W][a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*\@[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*\.[a-zA-Z]{2,4}$/, 'blur');
    });

    $('#prenom').blur(function () {
        checkValidity('prenom', /^[a-zA-Z]+(-[a-zA-Z]{1,100})?$/, 'blur');
    });

    $('#nom').blur(function () {
        checkValidity('nom', /^[a-zA-Z]+(-[a-zA-Z]{1,100})?$/, 'blur');
    });

    $('#tel').blur(function () {
        checkValidity('tel', /^(0|\+33|0033)[1-9][0-9]{8}?$/, 'blur');
    });

    $('#otherAmount').blur(function () {
        checkValidity('otherAmount', /^[0-9]+(,|.[0-9]{1,2})?$/, 'blur');
    });

    $('#codePostal').blur(function () {
        checkValidity('codePostal', /^[0-9]{5,5}?$/, 'blur');
    });

    $('#adresseUne').blur(function () {
        if ($(this).val() !== '')
            $(this).addClass('valid');
        else
            $(this).removeClass('valid').addClass('field');
    });

    $('#adresseDeux').blur(function () {
        if ($(this).val() !== '')
            $(this).addClass('valid');
        else
            $(this).removeClass('valid').addClass('field');
    });

    $('#ville').blur(function () {
        if ($(this).val() !== '')
            $(this).addClass('valid');
        else
            $(this).removeClass('valid').addClass('field');
    });
};
