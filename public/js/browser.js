'use strict';

$().ready(function() {
    var socket = io();

    socket.emit('get_rooms');

    socket.on('receive_rooms', function(msg) {
        console.log('Received rooms', msg);
        var rooms = msg.rooms;

        rooms.forEach(function(room_name) {
            var room = $('<li class="room_name"><span></span></li>');
            console.log(room, room_name);
            room.find('span').text(room_name);

            room.appendTo('#chat-rooms');
        });
    });


    $('#new-room').on('submit', function(e) {
        e.preventDefault();

        var room_name = $('#new-room-name').val();
        socket.emit('add_room', room_name);

        window.location = 'http://' + window.location.host + '/authenticated/chatroom.html?room=' + room_name;
    });
});
