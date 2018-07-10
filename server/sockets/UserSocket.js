const jwt = require('jsonwebtoken');
const sqlQueries = require('../sqlQueries.js');
const Broadcast = require('./SocketHelpers.js').Broadcast;
const Validations = require('./SocketHelpers.js').Validations;
const tokenConfig = require('../../config/token.config.js');

const {google} = require('googleapis');
const googleOathConfig = require('../../config/googleoath.config.js');


// Gets user data from Google, links the user to the socket, and sends a new token.
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

                // Removes the size parameter from the image url so that we can specify the size during render.
                userData.image.url = userData.image.url.replace('?sz=50', '');

                // Truncate name to 25 characters
                userData.name.givenName = userData.name.givenName.substring(0, 26);

                sqlQueries.signinGoogleAccount(userData, function(User) {

                    if (User.exists) {
                        self.socket.user = {
                            accountSK: User.accountSK,
                            username: User.username
                        };

                        // Send JWT Token
                        const token = createToken(User.accountSK, User.username);
                        self.socket.emit('userToken', {
                            token: token,
                            accountSK: User.accountSK,
                            username: User.username,
                            avatarURL: User.avatarURL
                        });

                        console.log(User.username + " signed in with Google.");
                        self.socket.emit('userSigninSuccess');
                    } else {
                        self.socket.emit('generalError', {error: 'Unable to sign in as ' + userData.emails[0].value});
                    }
                });
            });
        }
    });
};

// Unlinks user from socket upon Google sign out.
const googleSignoutSuccess = function() {
    const self = this;

    console.log(self.socket.user.username + " signed out.");

    self.socket.user = {
        accountSK: null,
        username: null
    };
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

                if (User.exists) {
                    self.socket.user = {
                        accountSK: User.accountSK,
                        username: User.username
                    };

                    // Refresh the token
                    const token = createToken(User.accountSK, User.username);
                    self.socket.emit('userToken', {
                        token: token,
                        accountSK: User.accountSK,
                        username: User.username,
                        avatarURL: User.avatarURL
                    });

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

// Changes the user's username
const changeName = function(newDetails) {
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

    const newUsername = newDetails.newName.trim();

    if (newUsername.length < 2 || newUsername.length > 25) {
        self.socket.emit('generalError', {error: 'New name must be between 2 and 25 characters.'});
    } else {
        sqlQueries.changeUsername(self.socket.user.accountSK, newUsername, function(User) {
            // Triggers a new token to be created because the token contains the username
            self.socket.emit('userRequestToken');

            console.log(User.oldUsername + ' changed their name to ' + User.newUsername + '.');
        });
    }
};

// Performs cleanup when a socket disconnects.
const disconnectSocket = function() {
    const self = this;

    console.log('Socket disconnected.');

    sqlQueries.leaveGame(self.socket.user.accountSK, function (data) {
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

    self.socket.user = {
        accountSK: null,
        username: null
    };
};

module.exports = function(socket){
    this.socket = socket;

    this.handlers = {
        'userGoogleSigninSuccess': googleSigninSuccess.bind(this),
        'userGoogleSignoutSuccess': googleSignoutSuccess.bind(this),
        'userVerifyToken': verifyToken.bind(this),
        'userChangeName': changeName.bind(this),
        'disconnect': disconnectSocket.bind(this),
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
