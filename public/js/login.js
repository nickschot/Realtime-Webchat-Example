'use strict';

$().ready(function() {
    console.log('on ready');
    $('#login-form').on('submit', function(e) {
        e.preventDefault();

        var username = $('#username').val();
        window.location = 'http://' + window.location.host + '/authenticated/browser.html?username=' + username;
    });

});
