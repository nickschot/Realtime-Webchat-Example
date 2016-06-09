const app = require('express')();
const http = require('http').Server(app);

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

// DUMMY ENDPOINT
app.get('/', function(req, res){
    res.send('<h1>Hello world</h1>');
});

//Start the HTTP server on port 3000
http.listen(3000, function(){
    log.info('listening on *:3000');
});
