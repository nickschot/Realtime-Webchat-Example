'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
chai.use(chaiHttp);

//Instantiate a server to use
//const server = require('../index');

/*
describe('Blobs', function() {
    it('retrieve the start page HTML', function(done){
        chai.request(server)
            .get('/')
            .end(function(err, res){
                res.should.have.status(200);
                done();
            });
    });
});
*/
