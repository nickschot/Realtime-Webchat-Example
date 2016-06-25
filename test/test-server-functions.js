'use strict';

const chai = require('chai');
const should = chai.should();

const UserManager = require('../app/server/usermanager').UserManager;

let um = new UserManager();

let socketMock = {
    handshake: {
        session : {
            save: function(){ return true; },
            username: ''
        }
    }
};

describe('UserManager', function() {
    let username = 'Mocha Chai';

    it('Should LOGIN the USER', function(done){
        um.log_in(socketMock, username);

        socketMock.handshake.session.username.should.equal(username);
        um.username_exists(username).should.be.true;
        um.get_all_logged_in_users().should.contain(username);
        um.is_logged_in(socketMock).should.be.true;

        done();
    });

    it('Should LOGOUT the USER', function(done){
        um.log_out(socketMock);

        socketMock.handshake.session.should.not.contain.keys('username');
        um.username_exists(username).should.be.false;
        um.get_all_logged_in_users().should.not.contain(username);
        um.is_logged_in(socketMock).should.be.false;

        done();
    });
});
