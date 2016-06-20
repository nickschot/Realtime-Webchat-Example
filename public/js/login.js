'use strict';

$().ready(function() {
    $('#login-form').on('submit', function(e) {
        e.preventDefault();

        var socket = io(),
            username = $('#username').val();

        socket.on('logged-in', function(msg) {
            if(msg.data === 'succeeded') {
                window.location = 'http://' + window.location.host + '/browser.html';
            } else {
                window.alert(msg.data);
            }
        });

        socket.emit('log-in', username);
    });

});
