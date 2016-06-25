'use strict';

const _ = require('underscore');

const common_io = require('./common-io.js');
const Room = require('./room.js').Room;
const UserManager = require('./usermanager.js').UserManager;

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
        in_rooms.forEach(function(room_name) {
            common_io.send_response(io.to(room_name), channel, msg, false);
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

module.exports.RoomManager = RoomManager;
