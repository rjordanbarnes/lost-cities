const sql = require('seriate');

const loginRequest = function(userInfo){
    let self = this;
    // Authenticates if username is in SQL database.
    sql.execute({
        query: 'SELECT UserID, Name FROM Users WHERE Name=@username',
        params: {
            username: {
                val: userInfo.username
            }
        }
    }).then(function(results) {
        self.socket.authenticated = results.length > 0

        if (self.socket.authenticated) {
            self.app.onlineUsers[self.socket.id] = results[0].UserID;
            self.socket.emit('login success');
        } else {
            self.socket.emit('login failed', {error: 'Unable to login as ' + userInfo.username + '.'});
        }
    }, function(err) {
        console.error(err);
    });
};

module.exports = function(app, socket){
    this.app = app;
    this.socket = socket;

    this.handlers = {
        'login request': loginRequest.bind(this)
    };
};