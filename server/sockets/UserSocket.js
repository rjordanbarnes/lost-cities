const sql = require('seriate');

// Authenticates if username is in SQL database.
const loginRequest = function(userInfo){
    let self = this;

    sql.execute({
        query: sql.fromFile("../sql/loginRequest"),
        params: {
            username: {
                val: userInfo.username
            }
        }
    }).then(function(results) {
        self.socket.authenticated = results.length > 0

        if (self.socket.authenticated) {
            self.app.onlineUsers[self.socket.id] = results[0].UserID;
            self.socket.emit('user login success');
        } else {
            self.socket.emit('user login failed', {error: 'Unable to login as ' + userInfo.username + '.'});
        }
    }, function(err) {
        console.error(err);
    });
};

module.exports = function(app, socket){
    this.app = app;
    this.socket = socket;

    this.handlers = {
        'user login request': loginRequest.bind(this)
    };
};