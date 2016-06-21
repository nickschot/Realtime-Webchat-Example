'use strict';

$().ready(function() {
    var socket = io();

    function get_rooms() {
        socket.emit('get_rooms');
    }

    $(window).on('beforeunload', function() {
        socket.emit('disconnect-from-app');
    });

    get_rooms();

    socket.on('receive_rooms', function(msg) {
        console.log('Received rooms', msg);
        if(!msg.error) {
            var rooms = msg.data;
            $('#chat-rooms').empty();
            rooms.forEach(function(room_name) {
                var room = $('<li class="room_name"><div><span></span><button></button></div></li>');

                room.find('span').text(room_name);
                room.find('button').text('Enter Room').on('click', function() {
                    enter_room(room_name);
                });


                room.appendTo('#chat-rooms');
            });
        } else {
            window.alert(msg.error);
        }
    });


    $('#new-room').on('submit', function(e) {
        e.preventDefault();

        var room_name = $('#new-room-name').val();
        socket.emit('add_room', room_name);
        //enter_room(room_name);
        get_rooms();
    });

    function enter_room(room_name) {
        socket.emit('join_room', room_name);
        window.location = 'http://' + window.location.host + '/chatroom.html?room-name=' + room_name;
    }
});
