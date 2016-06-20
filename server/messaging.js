'use strict';

const _ = require('underscore');

module.exports.handle_messaging = function(io, log) {
    //Server API
    var rooms = {'Room 1': []},
        users = [];

    function is_logged_in(socket) {
        return !(!socket.handshake.session.username);
    }

    function username_exists(username) {
        return _.contains(users, username);
    }

    function log_in(socket, username) {
        users.push(username);

        socket.handshake.session.username = username;
        socket.handshake.session.save();
    }

    function log_out(socket) {
        var username = socket.handshake.session.username;
        users.splice(users.indexOf(username), 1);

        delete socket.handshake.session.username;
        socket.handshake.session.save();
    }

    io.on('connection', function(socket){
        var username = '';

        socket.on('log-in', function(msg) {
            var username = msg,
                response;

            if(!username_exists(username)) {
                log_in(socket, username);
                response = 'succeeded';
            } else {
                response = 'User in use!';
            }

            socket.emit('logged-in', response);
        });

        socket.on('disconnect', function() {
            log_out(socket);
        });

        socket.on('user_connected', function(msg){
            // TODO only in room
            var username = msg.username;
            log.info(username + ' connected');
            socket.broadcast.emit('system_message', {
                message: msg.username + ' connected'
            });
        });

        socket.on('user_disconnect', function(){
            // TODO only in room
            log.info(username + ' disconnected');
            socket.broadcast.emit('system_message', {
                message: username + ' disconnected'
            });
        });

        socket.on('get_rooms', function() {
            var room_names = Object.keys(rooms);

            log.info('Retrieving rooms...');
            socket.emit('receive_rooms', {rooms: room_names});
            log.info('Rooms: ' + room_names);
        });

        socket.on('join_room', function(msg) {
            var room_name = msg;
            socket.join(room_name);

            // Add user to room
            if(rooms[room_name] !== undefined) {
                rooms[room_name].push(socket.id);
            }
        });

        socket.on('add_room', function(msg) {
            var room_name = msg;

            // Create room
            if(rooms[room_name] === undefined) {
                rooms[room_name] = [socket.id];
            }
        });

        socket.on('leave_room', function(msg) {
            var room_name = msg,
                room = rooms[room_name];

            socket.leave(room_name);

            // Remove user from room
            var room_index = room.indexOf(socket.id);
            if(room_index > 0) {
                room.splice(room_index, 1);
            }

            // Remove room if empty
            if(room.length === 0) {
                delete rooms[room_name];
            }
        });

        socket.on('chatbox_message', function(msg){
            // TODO only in room
            if(msg.message){
                log.info('New message: ', msg);
                socket.broadcast.emit('chatbox_message', msg);
            }
        });
    });
};
