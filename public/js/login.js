'use strict';

$().ready(function() {
    $('#login-form').on('submit', function(e) {
        console.log('on submit');
        e.preventDefault();

        var socket = io(),
            username = $('#username').val();

        socket.on('logged-in', function(msg) {
            console.log('logged-in message');
            if(msg === 'succeeded') {
                window.location = 'http://' + window.location.host + '/browser.html';
            } else {
                console.log(msg);
                window.alert(msg);
            }
        });

        socket.emit('log-in', username);
    });

});
