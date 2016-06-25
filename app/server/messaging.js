'use strict';

const RoomManager = require('./roommanager.js').RoomManager;
const UserManager = require('./usermanager.js').UserManager;
const common_io = require('./common-io.js');




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

            common_io.send_response(socket, 'logged-in', response, false);
        });

        socket.on('log-out', function() {
            user_manager.log_out(socket);
        });

        socket.on('get_username', function() {
            common_io.send_response(socket, 'receive_username', UserManager.get_username(socket), false);
        });

        socket.on('get_rooms', function() {
            if(user_manager.is_logged_in(socket)) {
                common_io.send_rooms_to(socket, room_manager);
            } else {
                common_io.send_response(socket, 'receive_rooms', undefined, 'User is not logged in! Cannot retrieve rooms!');
            }
        });

        socket.on('join_room', function(msg) {
            var room_name = msg,
                username = UserManager.get_username(socket);

            room_manager.join_room(socket, room_name);

            log.info(username + ' entered room ' + room_name);
            room_manager.broadcast_message_to_user_rooms(socket, 'system_message', {message: username + ' connected'});
            common_io.send_response(socket, 'system', {message: 'Joined room ' + room_name}, false);
        });

        socket.on('add_room', function(msg) {
            var room_name = msg;
            room_manager.add_room(room_name);

            common_io.send_rooms_to(io, room_manager);
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
