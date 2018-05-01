const jwt = require('jsonwebtoken');
const sqlQueries = require('../sqlQueries.js');
const Broadcast = require('./SocketHelpers.js').Broadcast;
const appVariables = require('../appVariables.js');
const tokenConfig = require('../../config/token.config.js');

const {google} = require('googleapis');
const googleOathConfig = require('../../config/googleoath.config.js');


const googleSigninSuccess = function(authorizationCode) {
    const self = this;

    const oauth2Client = new google.auth.OAuth2(
        googleOathConfig.web.client_id,
        googleOathConfig.web.client_secret,
        googleOathConfig.web.redirect_uris[0]
    );

    oauth2Client.getToken(authorizationCode, function(err, tokens) {
        if (!err) {
            oauth2Client.setCredentials(tokens);
            const plus = google.plus({
                version: 'v1',
                auth: oauth2Client
            });

            plus.people.get({ userId: 'me' }).then(function(res) {
                const userData = res.data;

                sqlQueries.signinGoogleAccount(userData, function(User) {
                    self.socket.authenticated = User.exists;

                    if (self.socket.authenticated) {
                        // Send JWT Token
                        const token = createToken(User.accountSK, User.username);
                        self.socket.emit('userToken',{token: token});

                        appVariables.onlineUsers[self.socket.id] = {accountSK: User.accountSK, username: User.username};
                        console.log(User.username + " logged in.");
                        self.socket.emit('userSigninSuccess');
                    } else {
                        self.socket.emit('generalError', {error: 'Unable to sign in as ' + userData.emails[0].value});
                    }
                });
            });
        }
    });
};

const googleSignoutSuccess = function() {
    const self = this;

    console.log(appVariables.onlineUsers[self.socket.id].username + " signed out.");

    delete appVariables.onlineUsers[self.socket.id];
    self.socket.authenticated = false;
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
                    appVariables.onlineUsers[self.socket.id] = {accountSK: User.accountSK, username: User.username};

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
        const accountSK = appVariables.onlineUsers[self.socket.id].accountSK;

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
                    Broadcast.refreshGameDetails(self.socket, data.currentGame);
                    Broadcast.refreshGameList(self.socket);
                }
            }
        });

        delete appVariables.onlineUsers[self.socket.id];
    }


    // Removes connected socket.
    const socketIndex = appVariables.connectedSockets.indexOf(self.socket);
    if (socketIndex >= 0)
        appVariables.connectedSockets.splice(socketIndex, 1);
};

module.exports = function(socket){
    this.socket = socket;

    this.handlers = {
        'userGoogleSigninSuccess': googleSigninSuccess.bind(this),
        'userGoogleSignoutSuccess': googleSignoutSuccess.bind(this),
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
