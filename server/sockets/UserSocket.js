const sqlQueries = require('../sqlQueries.js');

// Authenticates if username is in SQL database.
const loginRequest = function(userInfo){
    let self = this;

    sqlQueries.loginRequest(userInfo, function(results) {
        self.socket.authenticated = results.length > 0;

        if (self.socket.authenticated) {
            self.app.onlineUsers[self.socket.id] = results[0].UserId;
            console.log(userInfo.username + " logged in.");
            self.socket.emit('user login success');
        } else {
            self.socket.emit('user login failed', {error: 'Unable to login as ' + userInfo.username + '.'});
        }
    });
};

module.exports = function(app, socket){
    this.app = app;
    this.socket = socket;

    this.handlers = {
        'user login request': loginRequest.bind(this)
    };
};