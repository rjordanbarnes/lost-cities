const sql = require('seriate');

const loginRequest = function(userInfo){

};

module.exports = function(app, socket, broadcaster){
    this.app = app;
    this.socket = socket;
    this.broadcaster = broadcaster;

    this.handlers = {
        'login request': loginRequest.bind(this)
    };
};