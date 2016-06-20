"use strict";

module.exports.is_authenticated = function(req, res) {
    console.log("Hello!!!!!");
    console.log(req.session);
    req.session.name = "hello!";
    console.log(req.url);
    req.next();
};
