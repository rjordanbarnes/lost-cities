const jwt = require('jsonwebtoken');
const sqlQueries = require('../sqlQueries.js');
const Broadcast = require('./SocketHelpers.js').Broadcast;

// Authenticates if username is in SQL database.
const loginRequest = function(username){
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

            self.socket.emit('new jwt token',{token: token});


            self.app.onlineUsers[self.socket.id] = User.UserId;
            console.log(username + " logged in.");
            self.socket.emit('user login success');
        } else {
            self.socket.emit('server error', {error: 'Unable to login as ' + username + '.'});
        }
    });
};

const tokenAuthRequest = function(token) {
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
                    self.socket.server.in(User.CurrentRoom).emit('server error', {error: 'The host left.'});
                    self.socket.server.in(User.CurrentRoom).emit('room shutdown');

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
        'user login request': loginRequest.bind(this),
        'token auth request': tokenAuthRequest.bind(this),
        'disconnect': disconnectSocket.bind(this)
    };
};