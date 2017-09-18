var postIt = function(type) {
    var form = document.createElement('form');
    form.setAttribute('method', 'post');
    form.setAttribute('action', '/');
    form.style.display = 'hidden';
    var hiddenInput = document.createElement('input');
    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('name', 'type');
    hiddenInput.setAttribute('value', type);
    form.appendChild(hiddenInput);
    document.body.appendChild(form);
    form.submit();
};

var ponctuelClickEvent = function() {
    $('#btnPonctuel').click(function(event) {
        event.preventDefault();
        postIt('ponctuel', form);
        boolType = true;
        $(this).css('color', 'red');
        $('#btnMensuel').css('color', 'black');
    });
};

var mensuelClickEvent = function() {
    $('#btnMensuel').click(function(event) {
        event.preventDefault();
        postIt('mensuel', form);
        boolType = false;
        $(this).css('color', 'red');
        $('#btnPonctuel').css('color', 'black');
    });
};