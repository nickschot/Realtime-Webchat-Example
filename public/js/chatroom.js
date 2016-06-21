'use strict';

$().ready(function(){
    var socket = io(),
        username = false,
        current_room_name = false;

    $(window).on('beforeunload', function() {
        socket.emit('disconnect-from-app');
    });

    function get_rooms() {
        socket.emit('get_rooms');
    }

    function get_username() {
        socket.emit('get_username');
    }

    function enter_room(room_name) {
        if(current_room_name) {
            console.log('Leaving room ', current_room_name);
            socket.emit('leave_room', current_room_name);
        }
        socket.emit('join_room', room_name);
        $('#chatbox_messages').empty();

        $('#current-room').text(room_name);
    }

    get_username();
    get_rooms();
    appendMessage('system', {message: 'Please click a room on the left'});

    $('#chatbox_form').on('submit', function(e){
        e.preventDefault();

        var messageText = $('#chatbox_message').val();

        if(messageText){
            var message = {
                message: messageText
            };

            socket.emit('chatbox_message', message);
            $('#chatbox_message').val('');
        }
    });

    $('#new-room').on('submit', function(e) {
        e.preventDefault();

        var room_name = $('#new-room-name').val();
        $('#new-room-name').val('');
        socket.emit('add_room', room_name);
        get_rooms();
    });

    socket.on('receive_username', function(msg) {
        username = msg.data;
    });

    socket.on('chatbox_message', function(msg){
        appendMessage('user', msg.data);
        console.log('chatbox message', msg);
    });

    socket.on('system_message', function(msg){
        appendMessage('system', msg.data);
        console.log('system message', msg);
    });

    socket.on('receive_rooms', function(msg) {
        if(!msg.error) {
            var rooms = msg.data;
            $('#chat-rooms').empty();
            rooms.forEach(function(room_name) {
                var room = $('<li class="room_name"><a>' + room_name + '</a></li>');

                room.on('click', function() {
                    enter_room(room_name);
                    current_room_name = room_name;
                });

                room.appendTo('#chat-rooms');
            });
        } else {
            window.alert(msg.error);
        }
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

            if(lastMessageFromUser(msg.username)){
                if(msg.username === username){
                    $('#chatbox_messages li:last-child').addClass('previous-message');
                } else {
                    messageClass += ' consecutive-message';
                }

                messageClass += ' username-hidden';
            }

            messageElem = $('<li class="' + messageClass + '"><span></span><p></p></li>');
            messageElem.children('span').text(msg.username);
            messageElem.children('p').text(msg.message);
        }

        messageElem
            .css('opacity', 0)
            .appendTo('#chatbox_messages')
            .animate({ opacity: 1 }, 300)
            .css('transform', 'translateY(0)');
        scrollDown();
    }

    function lastMessageFromUser(username){
        var lastUsername = $('#chatbox_messages li:last-child').find('span').text();
        return lastUsername === username;
    }

    function scrollDown(){
        var height = $('.chatbox_messages_wrapper ul').outerHeight();
        var wrapperHeight = $('.chatbox_messages_wrapper').height();

        var scrollStart = $('.chatbox_messages_wrapper ul').scrollTop();
        var scrollEnd = height > wrapperHeight ? height - wrapperHeight : scrollStart;

        //TODO: don't scroll when a user is scrolled up
        $('.chatbox_messages_wrapper').animate({
            scrollTop: scrollEnd+'px'
        }, 300);
    }
});
