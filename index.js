'use strict';

const express           = require('express');
const app               = express();
const session           = require('express-session');
const http              = require('http').Server(app);
const authentication    = require('./server/authentication');

const bunyan            = require('bunyan');
const expressBunyan     = require('express-bunyan-logger');

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

app.get('/pages/authenticated/*', authentication.requireAuthentication);

// ENDPOINTS
app.get('/', function(req, res){
    res.send('<h1>Hello world</h1>');
});

app.use('/pages', express.static('pages'));
app.use('/public', express.static('public'));



//Start the HTTP server on port 3000
http.listen(3000, function(){
    log.info('listening on *:3000');
});
