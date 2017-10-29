const jwt = require('jsonwebtoken');
const sqlQueries = require('../sqlQueries.js');
const Broadcast = require('./SocketHelpers.js').Broadcast;
const tokenConfig = require('../../config/token.config.js');

// Authenticates if username is in SQL database.
const requestLogin = function(username){
    const self = this;

    sqlQueries.loginUser(username, function(User) {
        self.socket.authenticated = User.Exists;

        if (self.socket.authenticated) {
            // Send JWT Token
            const token = createToken(User.UserId, username);
            self.socket.emit('userNewToken',{token: token});


            self.app.onlineUsers[self.socket.id] = User.UserId;
            console.log(username + " logged in.");
            self.socket.emit('userLoginSuccess');
        } else {
            self.socket.emit('generalError', {error: 'Unable to login as ' + username + '.'});
        }
    });
};

// Checks if the passed token is valid.
const verifyToken = function(token) {
    const self = this;

    jwt.verify(token, tokenConfig.secret, function(err, decoded) {
        if (err) {
            console.log("Expired or invalid token.");
        } else {
            sqlQueries.verifyToken(decoded.userId, function(User) {
                self.socket.authenticated = User.Exists;

                if (self.socket.authenticated) {
                    self.app.onlineUsers[self.socket.id] = User.UserId;

                    // Refresh the token
                    const token = createToken(User.UserId, User.Username);
                    self.socket.emit('userNewToken',{token: token});

                    console.log(User.Username + " token authenticated.");
                } else {
                    // User information in token doesn't exist.
                    console.log("Invalid token request for " + User.Username + ".")
                }
            });
        }
    });
};

// Performs cleanup when a socket disconnects.
const disconnectSocket = function() {
    const self = this;

    console.log('Socket disconnected.');

    // If the socket is authenticated, handle disconnecting the user.
    if (self.socket.authenticated) {
        const userId = self.app.onlineUsers[self.socket.id];

        sqlQueries.leaveRoom(userId, function(User) {
            console.log(User.Username + " left room.");

            if (User.IsHost) {
                // Shutdown the room if the user was the host of the room.
                sqlQueries.shutdownRoom(User.CurrentRoom, function () {
                    console.log(User.Username + " shutdown room.");
                    self.socket.server.in(User.CurrentRoom).emit('generalError', {error: 'The host left.'});
                    self.socket.server.in(User.CurrentRoom).emit('roomShutdown');

                    Broadcast.refreshRoomList(self.socket);
                });
            } else if (User.CurrentRoom) {
                // Let the other clients know if the user was in their room.
                Broadcast.refreshRoomDetails(self.socket, User.CurrentRoom);
            }
        });

        delete self.app.onlineUsers[self.socket.id];
    }


    // Removes connected socket.
    const socketIndex = self.app.connectedSockets.indexOf(self.socket);
    if (socketIndex >= 0)
        self.app.connectedSockets.splice(socketIndex, 1);
};

module.exports = function(app, socket){
    this.app = app;
    this.socket = socket;

    this.handlers = {
        'userRequestLogin': requestLogin.bind(this),
        'userVerifyToken': verifyToken.bind(this),
        'disconnect': disconnectSocket.bind(this)
    };
};


//// Helpers ////

function createToken(userId, username) {
    const profile = {
        userId: userId,
        username: username
    };

    return jwt.sign(profile, tokenConfig.secret, { expiresIn: tokenConfig.expiration });
}
