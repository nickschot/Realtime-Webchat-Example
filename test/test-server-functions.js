'use strict';

const chai = require('chai');
const should = chai.should();

const UserManager = require('../app/server/usermanager').UserManager;

let um = new UserManager();

function _getSocketMock(){
    return {
        handshake: {
            session : {
                save: function(){ return true; },
                username: ''
            }
        }
    };
}

let socketMock = _getSocketMock();

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

    it('Should return ALL logged in USERS', function(done){
        let socketMocks = [_getSocketMock(), _getSocketMock(), _getSocketMock()];
        let usernames = ['Username 1', 'Username 2', 'Username 3'];

        //Log in all users and check if they are added correctly
        usernames.forEach((username, index) => { um.log_in(socketMocks[index], username); });
        usernames.forEach((username) => { um.username_exists(username).should.be.true; });

        um.get_all_logged_in_users().should.eql(usernames);

        um.log_out(socketMocks[2]);
        delete usernames[2];

        um.get_all_logged_in_users().should.eql(usernames);

        um.log_out(socketMocks[1]);
        um.log_out(socketMocks[0]);
        usernames = [];
        um.get_all_logged_in_users().should.eql(usernames);

        done();
    });
});
