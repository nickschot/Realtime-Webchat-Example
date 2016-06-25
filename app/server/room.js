'use strict';

const _ = require('underscore');

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
    }
}

module.exports.Room = Room;
