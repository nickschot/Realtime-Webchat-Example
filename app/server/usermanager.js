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
        return socket.handshake.session.username ? socket.handshake.session.username : false;
    }

    static set_username(socket, username) {
        socket.handshake.session.username = username;
    }

    static remove_username(socket) {
        delete socket.handshake.session.username;
    }
}

module.exports.UserManager = UserManager;
