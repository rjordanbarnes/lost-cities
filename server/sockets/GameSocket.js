const sqlQueries = require('../sqlQueries.js');
const Broadcast = require('./SocketHelpers.js');

const loginRequest = function(userInfo){

};

module.exports = function(app, socket){
    this.app = app;
    this.socket = socket;

    this.handlers = {
        'login request': loginRequest.bind(this)
    };
};