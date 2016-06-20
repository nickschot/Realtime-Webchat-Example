'use strict';

const _ = require('underscore');

module.exports.handle_messaging = function(io, log) {
    //Server API
    var rooms = {'Room 1': []},
        users = [];

    function get_room(room_name) {
        return rooms[room_name];
    }

    function user_in_rooms(username) {
        var result = [];

        for(var room_name in rooms) {
            if(rooms.hasOwnProperty(room_name)) {
                var users_in_room = rooms[room_name];

                if(_.contains(users_in_room, username)) {
                    result.push(room_name);
                }
            }
        }

        return result
    }

    function join_room(socket, room_name) {
        var username = get_username(socket);
        socket.join(room_name);

        // Add user to room if room exists
        if(rooms[room_name] !== undefined) {
            rooms[room_name].push(username);
        }
    }

    function add_room(room_name) {
        // Create room
        if(rooms[room_name] === undefined) {
            rooms[room_name] = [];
        }
    }

    function remove_room(room_name) {
        delete rooms[room_name];
    }

    function leave_room(socket, room_name) {
        var username = get_username(socket),
            room = get_room(room_name);

        socket.leave(room_name);

        // Remove user from room
        var room_index = room.indexOf(username);
        if(room_index > 0) {
            room.splice(room_index, 1);
        }
    }

    function is_logged_in(socket) {
        console.log(users, get_username(socket));
        return get_username(socket) && _.contains(users, get_username(socket));
    }

    function username_exists(username) {
        return _.contains(users, username);
    }

    function log_in(socket, username) {
        users.push(username);

        set_username(socket, username);
        socket.handshake.session.save();

        console.log('User logged in as ', username);
    }

    function log_out(socket) {
        var username = get_username(socket);
        users.splice(users.indexOf(username), 1);

        remove_username(socket);
        socket.handshake.session.save();
    }

    function get_username(socket) {
        return socket.handshake.session.username;
    }

    function set_username(socket, username) {
        socket.handshake.session.username = username;
    }

    function remove_username(socket) {
        delete socket.handshake.session.username;
    }

    function send_response(socket, channel, data, error) {
        socket.emit(channel, {data: data, error: error});
    }

    function broadcast_message_to_user_rooms(socket, channel, msg) {
        var in_rooms = user_in_rooms(get_username(socket));

        log.info('New message: ', msg);
        in_rooms.forEach(function(room_name) {
            io.to(room_name).emit(channel, msg);
        });
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

            send_response(socket, 'logged-in', response, false);
        });

        socket.on('log-out', function() {
            console.log('log-out');
            log_out(socket);
        });

        socket.on('get_rooms', function() {
            var room_names = Object.keys(rooms);
            console.log('get_rooms ', socket.handshake.session);
            if(is_logged_in(socket)) {
                send_response(socket, 'receive_rooms', room_names, false);
            } else {
                send_response(socket, 'receive_rooms', undefined, 'User is not logged in! Cannot retrieve rooms!');
            }
        });

        socket.on('join_room', function(msg) {
            var room_name = msg,
                username = get_username(socket);

            join_room(socket, room_name);

            log.info(username + ' entered room ' + room_name);
            broadcast_message_to_user_rooms(socket, 'system_message', {message: msg.username + ' connected'});
        });

        socket.on('add_room', function(msg) {
            var room_name = msg;
            add_room(room_name);
        });

        socket.on('leave_room', function(msg) {
            var room_name = msg,
                room = get_room(room_name),
                username = get_username(socket);

            leave_room(socket, room_name);

            // Remove room if empty
            if(room.length === 0) {
                remove_room(room_name);
                log.info('Room ' + room_name + ' is empty and is removed');
            }

            log.info(username + ' disconnected');
            broadcast_message_to_user_rooms(socket, 'system_message', {
                message: username + ' disconnected'
            });
        });

        socket.on('remove_room', function(msg) {
            var room_name = msg;
            remove_room(room_name);
        });

        socket.on('chatbox_message', function(msg){
            if(msg.message) {
                broadcast_message_to_user_rooms(socket, 'chatbox_message', msg);
            }
        });
    });
};
