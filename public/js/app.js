'use strict';

/**
 * Created by nickschot on 16/06/16.
 */
$().ready(function(){
    var socket = io();
    var username = 'User'+ Math.floor(Math.random() * (99999 - 10000) + 10000);

    appendMessage('system', {message: 'Welcome to Chatsome '+username});

    $('#chatbox_form').on('submit', function(e){
        e.preventDefault();

        var messageText = $('#chatbox_message').val();

        if(messageText){
            var message = {
                username: username,
                message: messageText
            };

            socket.emit('chatbox_message', message);
            appendMessage('user', message);
            $('#chatbox_message').val('');
        }
    });

    socket.on('chatbox_message', function(msg){
        appendMessage('user', msg);
    });

    socket.on('system_message', function(msg){
        appendMessage('system', msg);
    });

    function appendMessage(type, msg){
        var messageClass = '';

        if(type === 'system'){
            messageClass = 'system';
            $('#chatbox_messages').append('<li class="' + messageClass + '"><i>' + msg.message + '</i></li>');
        } else {
            if(msg.username === username){
                messageClass = 'user';
            }
            $('#chatbox_messages').append('<li class="' + messageClass + '"><span>' + msg.username + '</span><p>' + msg.message + '</p></li>');
        }
    }
});
