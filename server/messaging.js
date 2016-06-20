'use strict';

module.exports.handle_messaging = function(io, log) {
    //Server API
    io.on('connection', function(socket){
        var username = '';

        socket.on('connected', function(msg){
            username = msg.username;
            log.info(username + ' connected');
            socket.broadcast.emit('system_message', {
                message: msg.username+' connected'
            });
        });

        socket.on('disconnect', function(){
            log.info(username + ' disconnected');
            socket.broadcast.emit('system_message', {
                message: username + ' disconnected'
            });
        });

        socket.on('chatbox_message', function(msg){
            if(msg.message){
                log.info('New message: ', msg);
                socket.broadcast.emit('chatbox_message', msg);
            }
        });
    });
}
