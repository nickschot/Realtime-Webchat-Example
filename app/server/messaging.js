'use strict';

const _ = require('underscore');

class UserManager {
    constructor() {
        this.users = [];
    }

    log_in(socket, username) {
        this.users.push(username);

        UserManager.set_username(socket, username);
        socket.handshake.session.save();
    }

    log_out(socket) {
        var username = UserManager.get_username(socket);
        this.users.splice(this.users.indexOf(username), 1);

        UserManager.remove_username(socket);
        socket.handshake.session.save();
    }

    is_logged_in(socket) {
        return UserManager.get_username(socket) &&
               this.username_exists(UserManager.get_username(socket))
               ;
    }

    get_all_logged_in_users() {
        return this.users;
    }

    username_exists(username) {
        return _.contains(this.get_all_logged_in_users(), username);
    }

    static get_username(socket) {
        return socket.handshake.session.username;
    }

    static set_username(socket, username) {
        socket.handshake.session.username = username;
    }

    static remove_username(socket) {
        delete socket.handshake.session.username;
    }
}

class Room {
    constructor(name, log) {
        this.name = name;
        this.users = {};
        this.logger = log;
    }

    is_user_in_room(username) {
        return _.contains(this.get_users_in_room(), username);
    }

    get_users_in_room() {
        return Object.keys(this.users);
    }

    get_socket_of_user(username) {
        return this.users[username];
    }

    add_to_room(username, socket) {
        this.users[username] = socket;

        socket.join(this.name);
    }

    remove_from_room(username) {
        var socket = this.get_socket_of_user(username);

        socket.leave(this.name, function(err) {
            if(err) {
                this.logger.error('Could not leave room: ', err);
            }
        });

        delete this.users[username];

        if(false) {
            
        }
    }


}

class RoomManager {
    constructor(logger, io) {
        this.rooms = {};
        this.logger = logger;
        this.io = io;
    }

    get_room(room_name) {
        return this.rooms[room_name];
    }

    get_all_rooms() {
        return Object.keys(this.rooms);
    }

    room_exists(room_name) {
        return _.contains(this.get_all_rooms(), room_name);
    }

    join_room(socket, room_name) {
        var username = UserManager.get_username(socket);

        // Add user to room if room exists
        if(this.room_exists(room_name)) {
            this.rooms[room_name].add_to_room(username, socket);
        }
    }

    leave_room(socket, room_name) {
        var username = UserManager.get_username(socket),
            room = this.get_room(room_name);

        this.logger.info(username + ' disconnected');
        this.broadcast_message_to_user_rooms(socket, 'system_message', {
            message: username + ' disconnected'
        });

        room.remove_from_room(username);
    }

    leave_all_rooms(socket) {
        var rooms = this.get_rooms_of_user(socket),
            self = this;

        rooms.forEach(function(room) {
            self.leave_room(socket, room);
        });
    }

    get_rooms_of_user(socket) {
        var result = [],
            username = UserManager.get_username(socket);

        for(var room_name in this.rooms) {
            if(this.rooms.hasOwnProperty(room_name)) {

                if(this.rooms[room_name].is_user_in_room(username)) {
                    result.push(room_name);
                }
            }
        }

        return result;
    }

    broadcast_message_to_user_rooms(socket, channel, msg) {
        var in_rooms = this.get_rooms_of_user(socket),
            io = this.io;

        this.logger.info('New message: ', msg);
        console.log(in_rooms);
        in_rooms.forEach(function(room_name) {
            send_response(io.to(room_name), channel, msg, false);
        });
    }

    add_room(room_name) {
        // Create room
        if(!this.room_exists(room_name)) {
            this.rooms[room_name] = new Room(room_name, this.logger);
        }
    }

    remove_room(room_name) {
        delete this.rooms[room_name];
    }
}


function send_response(nsp, channel, data, error) {
    nsp.emit(channel, {data: data, error: error});
}

function send_rooms_to(nsp, room_manager) {
    send_response(nsp, 'receive_rooms', room_manager.get_all_rooms(), false);
}


module.exports.handle_messaging = function(io, log) {
    //Server API
    var room_manager = new RoomManager(log, io),
        user_manager = new UserManager();


    io.on('connection', function(socket){
        socket.on('log-in', function(msg) {
            var username = msg,
                response;

            if(!user_manager.username_exists(username)) {
                user_manager.log_in(socket, username);
                response = 'succeeded';
            } else {
                response = 'User in use!';
            }

            send_response(socket, 'logged-in', response, false);
        });

        socket.on('log-out', function() {
            user_manager.log_out(socket);
        });

        socket.on('get_username', function() {
            send_response(socket, 'receive_username', UserManager.get_username(socket), false);
        });

        socket.on('get_rooms', function() {
            if(user_manager.is_logged_in(socket)) {
                send_rooms_to(socket, room_manager);
            } else {
                send_response(socket, 'receive_rooms', undefined, 'User is not logged in! Cannot retrieve rooms!');
            }
        });

        socket.on('join_room', function(msg) {
            var room_name = msg,
                username = UserManager.get_username(socket);

            room_manager.join_room(socket, room_name);

            log.info(username + ' entered room ' + room_name);
            room_manager.broadcast_message_to_user_rooms(socket, 'system_message', {message: username + ' connected'});
            send_response(socket, 'system', {message: 'Joined room ' + room_name}, false);
        });

        socket.on('add_room', function(msg) {
            var room_name = msg;
            room_manager.add_room(room_name);

            send_rooms_to(io, room_manager);
        });

        socket.on('leave_room', function(msg) {
            var room_name = msg;

            room_manager.leave_room(socket, room_name);
        });

        socket.on('remove_room', function(msg) {
            var room_name = msg;
            room_manager.remove_room(room_name);
        });

        socket.on('chatbox_message', function(msg){
            var username = UserManager.get_username(socket);

            if(msg.message) {
                msg.username = username;
                room_manager.broadcast_message_to_user_rooms(socket, 'chatbox_message', msg);
            }
        });

        socket.on('disconnect-from-app', function() {
            log.info('User ' + UserManager.get_username(socket) + ' has disconnected from app');
            room_manager.leave_all_rooms(socket);
            user_manager.log_out(socket);
        });
    });
};
