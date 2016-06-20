'use strict';

module.exports.handle_messaging = function(io, log) {
    //Server API
    var rooms = {'Room 1': []};

    io.on('connection', function(socket){
        var username = '';

        socket.on('user_connected', function(msg){
            // TODO only in room
            username = msg.username;
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
