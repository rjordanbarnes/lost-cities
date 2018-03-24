const jwt = require('jsonwebtoken');
const sqlQueries = require('../sqlQueries.js');
const Broadcast = require('./SocketHelpers.js').Broadcast;
const tokenConfig = require('../../config/token.config.js');

// Authenticates if username is in SQL database.
const requestLogin = function(username){
    const self = this;

    sqlQueries.loginAccount(username, function(User) {
        self.socket.authenticated = User.exists;

        if (self.socket.authenticated) {
            // Send JWT Token
            const token = createToken(User.accountSK, username);
            self.socket.emit('userToken',{token: token});

            self.app.onlineUsers[self.socket.id] = {accountSK: User.accountSK, username: User.username};
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
            self.socket.emit('userToken',{errors: err.toString()});
            console.log("Expired, invalid, or missing token.");
        } else {
            sqlQueries.verifyToken(decoded.accountSK, function(User) {
                self.socket.authenticated = User.exists;

                if (self.socket.authenticated) {
                    self.app.onlineUsers[self.socket.id] = {accountSK: User.accountSK, username: User.username};

                    // Refresh the token
                    const token = createToken(User.accountSK, User.username);
                    self.socket.emit('userToken',{token: token});

                    console.log(User.username + " token authenticated.");
                } else {
                    // User information in token doesn't exist.
                    self.socket.emit('userToken',{errors: "Invalid token request."});
                    console.log("Invalid token request for " + User.username + ".")
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
        const accountSK = self.app.onlineUsers[self.socket.id].accountSK;

        sqlQueries.leaveGame(accountSK, function (data) {
            if (data.hasOwnProperty('errors')) {
                console.log(data.errors.message);
            } else {
                console.log("User left game.");

                self.socket.leave(data.currentGame);

                if (data.gameShutdown) {
                    self.socket.broadcast.to(data.currentGame).emit('generalError', {error: 'The host left.'});
                    self.socket.broadcast.to(data.currentGame).emit('gameShutdown');

                    // Makes every socket leave the room.
                    self.socket.server.of('/').in(data.currentGame).clients(function(error, clients) {
                        if (clients.length > 0) {
                            clients.forEach(function(socket_id) {
                                self.socket.server.sockets.sockets[socket_id].leave(data.currentGame);
                            });
                        }
                    });

                    Broadcast.refreshGameList(self.socket);
                } else {
                    Broadcast.refreshGameDetails(self.socket, User.currentGame);
                    Broadcast.refreshGameList(self.socket);
                }
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

function createToken(accountSK, username) {
    const profile = {
        accountSK: accountSK,
        username: username
    };

    return jwt.sign(profile, tokenConfig.secret, { expiresIn: tokenConfig.expiration });
}
