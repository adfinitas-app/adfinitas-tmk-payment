var ponctuelClickEvent = function(ponctuelDiv, mensuelDiv, form) {
    $('#btnPonctuel').click(function(event) {
        event.preventDefault();
        boolType = true;
        ponctuelDiv.css('display', 'block');
        mensuelDiv.css('display', 'none');
        form.attr('action', '/ponctuel');
        $('.valid').removeClass('valid').addClass('field');
        $('.invalid').removeClass('invalid').addClass('field');
        $(this).css('color', 'red');
        $('#btnMensuel').css('color', 'black');
        form.trigger('reset');
    });
};

var mensuelClickEvent = function(ponctuelDiv, mensuelDiv, form) {
    $('#btnMensuel').click(function(event) {
        event.preventDefault();
        boolType = false;
        ponctuelDiv.css('display', 'none');
        mensuelDiv.css('display', 'block');
        form.attr('action', '/mensuel');
        $('.valid').removeClass('valid').addClass('field');
        $('.invalid').removeClass('invalid').addClass('field');
        $(this).css('color', 'red');
        $('#btnPonctuel').css('color', 'black');
        form.trigger('reset');
    });
};