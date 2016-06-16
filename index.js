'use strict';
const requireDir        = require('require-dir');

const express           = require('express');
const app               = express();
const session           = require('express-session');
const http              = require('http').Server(app);
//const authentication    = require('./server/authentication');
const io                = require('socket.io')(http);

const bunyan            = require('bunyan');
const expressBunyan     = require('express-bunyan-logger');

const util              = requireDir('util');

// LOGGING
const bunyanConfig = {
    name: 'ChatSome'
};
const expressBunyanConfig = {
    name: 'ChatSome',
    excludes: [
        'user-agent',
        'body',
        'short-body',
        'req-headers',
        'res-headers',
        'req',
        'res',
        'incoming',
        'response-hrtime'
    ]
};
const log = bunyan.createLogger(bunyanConfig);

// MIDDLEWARE
app.use(expressBunyan(expressBunyanConfig));
app.use(expressBunyan.errorLogger(expressBunyanConfig));

app.use(session({
    secret: 'chatsomeIsAwesome!',
    resave: false,
    saveUninitialized: false
}));

//app.get('/pages/authenticated/*', authentication.requireAuthentication);

// ENDPOINTS
//Frontend entrypoint
app.get('/', function(req, res){
    res.sendFile(__dirname + '/pages/index.html');
});
//Frontend static files
app.use('/pages', express.static('pages'));
app.use('/public', express.static('public'));

//Server API
io.on('connection', function(socket){
    log.info('A user connected');
    //TODO: don't emit this to the user who connected
    socket.broadcast.emit('system_message', {
        message: 'A user connected'
    });

    socket.on('disconnect', function(){
        log.info('A user disconnected');
        socket.broadcast.emit('system_message', {
            message: 'A user disconnected'
        });
    });

    socket.on('chatbox_message', function(msg){
        if(msg.message){
            msg = util.functions.escapeMessageObj(msg);
            log.info('New message: ', msg);
            socket.broadcast.emit('chatbox_message', msg);
        }
    });
});


//Start the HTTP server on port 3000
http.listen(process.env.PORT || 3000, function(){
    log.info('listening on *:' + (process.env.PORT || 3000));
});
