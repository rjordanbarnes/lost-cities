const jwt = require('jsonwebtoken');
const sqlQueries = require('../sqlQueries.js');
const Broadcast = require('./SocketHelpers.js').Broadcast;

// Authenticates if username is in SQL database.
const requestLogin = function(username){
    const self = this;

    sqlQueries.loginUser(username, function(User) {
        self.socket.authenticated = User.Exists;

        if (self.socket.authenticated) {
            const profile = {
                userId: User.UserId,
                username: username
            };

            // Send JWT Token
            const token = jwt.sign(profile, 'SECRET', { expiresIn: 60*60 });

            self.socket.emit('userNewToken',{token: token});


            self.app.onlineUsers[self.socket.id] = User.UserId;
            console.log(username + " logged in.");
            self.socket.emit('userLoginSuccess');
        } else {
            self.socket.emit('generalError', {error: 'Unable to login as ' + username + '.'});
        }
    });
};

const verifyToken = function(token) {
    const self = this;

    jwt.verify(token, 'SECRET', function(err, decoded) {
        if (err) {
            console.log("Expired");
        } else {
            sqlQueries.verifyToken(decoded.userId, function(User) {
                self.socket.authenticated = User.Exists;

                if (self.socket.authenticated) {
                    self.app.onlineUsers[self.socket.id] = User.UserId;
                    console.log(User.Username + " token authenticated.");
                } else {
                    // Token's not legit
                    console.log("Invalid token request.")
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
            Broadcast.refreshRoomList(self.socket);

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
