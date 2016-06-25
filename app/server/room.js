'use strict';

const _ = require('underscore');

class Room {
    constructor(name, log) {
        this.name = name;
        this.users = {};
        this.logger = log;
    }

    get_name() {
        return this.name;
    }

    is_user_in_room(username) {
        return _.contains(this.get_users_in_room(), username);
    }

    get_users_in_room() {
        return Object.keys(this.users);
    }

    get_socket_of_user(username) {
        return this.users[username] || false;
    }

    add_to_room(username, socket) {
        this.users[username] = socket;
        socket.join(this.name);
    }

    remove_from_room(username) {
        var socket = this.get_socket_of_user(username);

        socket.leave(this.name, (err) => {
            if(err) {
                this.logger.error('Could not leave room: ', err);
            }
        });

        delete this.users[username];
    }
}

module.exports.Room = Room;
