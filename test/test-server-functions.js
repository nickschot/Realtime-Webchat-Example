'use strict';

const chai = require('chai');
const should = chai.should();

const UserManager = require('../app/server/usermanager').UserManager;
const Room = require('../app/server/room').Room;

let logger = _getLoggerMock();
let um = new UserManager();
let room = new Room('testRoom', logger);
let errRoom = new Room('errorRoom', logger);

function _getSocketMock(){
    return {
        handshake: {
            session : {
                save: function(){ return true; },
                username: ''
            }
        },
        join: function(name, callback){
            if(callback){
                if(name === 'errorRoom'){
                    callback('Socket.IO failed to join because username is ERROR');
                } else {
                    callback();
                }
            } else {
                return true;
            }
        },
        leave: function(name, callback){
            if(callback){
                if(name === 'errorRoom'){
                    callback('Socket.IO failed to leave because username is ERROR');
                } else {
                    callback();
                }
            } else {
                return true;
            }
        }
    };
}

function _getLoggerMock(){
    return {
        info: function(){},
        error: function(){}
    };
}

describe('UserManager CLASS', function() {
    let socketMock = _getSocketMock();
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

describe('Room CLASS', function(){
    let socketMock = _getSocketMock();
    let username = 'Mocha Chai';

    it('Should add the USER to the ROOM', function(done){
        room.add_to_room(username, socketMock);

        room.is_user_in_room(username).should.be.true;
        room.get_users_in_room().should.contain(username);
        room.get_socket_of_user(username).should.eql(socketMock);

        done();
    });

    it('Should remove the USER from the ROOM', function(done){
        room.remove_from_room(username);

        room.is_user_in_room(username).should.be.false;
        room.get_users_in_room().should.not.contain(username);
        room.get_socket_of_user(username).should.be.false.and.should.not.eql(socketMock);

        let tmpSocketMock = _getSocketMock();
        errRoom.add_to_room(username, tmpSocketMock);
        errRoom.remove_from_room(username);

        done();
    });

    it('Should return ALL USERS in the ROOM', function(done){
        let socketMocks = [_getSocketMock(), _getSocketMock(), _getSocketMock()];
        let usernames = ['Username 1', 'Username 2', 'Username 3'];

        usernames.forEach((username, index) => { room.add_to_room(username, socketMocks[index]); });

        room.get_users_in_room().should.eql(usernames);

        room.remove_from_room(usernames[2]);
        delete usernames[2];

        room.get_users_in_room().should.eql(usernames);

        room.remove_from_room(usernames[1]);
        room.remove_from_room(usernames[0]);
        usernames = [];

        room.get_users_in_room().should.eql(usernames);

        done();
    });
});
