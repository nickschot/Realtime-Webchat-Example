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
        var messageElem = '';

        if(type === 'system'){
            messageClass = 'system';
            
            messageElem = $('<li class="' + messageClass + '"><p><i></i></p></li>');
            messageElem.find('i').text(msg.message);
        } else {
            messageClass = msg.username === username ? 'user' : '';

            messageElem = $('<li class="' + messageClass + '"><span></span><p></p></li>');
            messageElem.children('span').text(msg.username);
            messageElem.children('p').text(msg.message);
        }

        $('#chatbox_messages').append(messageElem);
    }
});
