const sqlQueries = require('../sqlQueries.js');
const Broadcast = require('./SocketHelpers.js').Broadcast;
const Validations = require('./SocketHelpers.js').Validations;

// Creates a new game with the current socket as the host.
const create = function(gameInput) {
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

    gameInput.gameName = gameInput.gameName.trim();

    if(gameInput.gamePassword.trim().length < 1) {
        gameInput.gamePassword = 'NULL'
    }

    if (gameInput.gameName.length < 4 || gameInput.gameName.length > 20) {
        self.socket.emit('generalError', {error: 'Game name must be between 4 and 20 characters.'});
    } else {
        const userId = self.app.onlineUsers[self.socket.id].userId;

        sqlQueries.createGame(userId, gameInput.gameName, gameInput.gamePassword, function (NewGame) {
            if (NewGame && NewGame.hasOwnProperty('errors')) {
                // SQL Errors
            } else {
                console.log('Created game ' + gameInput.gameName);
                // Host joins game channel.
                self.socket.join(NewGame.gameId);

                self.socket.emit('gameCreate', NewGame);
                Broadcast.refreshGameList(self.socket);
                Broadcast.refreshGameDetails(self.socket, NewGame.gameId);
            }
        });
    }
};

// Causes the current socket to join the specified game as a player.
const join = function(gameInput) {
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

    const userId = self.app.onlineUsers[self.socket.id].userId;

    sqlQueries.joinGame(userId, gameInput.gameId, gameInput.password, function (data) {
        if (data && data.hasOwnProperty('errors')) {
            // SQL Errors
        } else {
            console.log('Player joined a game.');
            // Joins game's socket.io channel.
            self.socket.join(gameInput.gameId);

            self.socket.emit('gameJoin', {gameId: gameInput.gameId});

            Broadcast.refreshGameList(self.socket);
            Broadcast.refreshGameDetails(self.socket, gameInput.gameId);
        }
    });
};

const spectate = function(gameId) {
    const self = this;

    const userId = self.app.onlineUsers[self.socket.id].userId;

    sqlQueries.spectateGame(userId, gameId, function () {
        console.log('Spectator joined game.');
        // Joins game's socket.io channel.
        self.socket.join(gameId);

        Broadcast.refreshGameList(self.socket);
        Broadcast.refreshGameDetails(self.socket, gameId);
    });
};

// Causes the socket to leave the game they're in.
const leave = function(){
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

    const userId = self.app.onlineUsers[self.socket.id].userId;

    sqlQueries.leaveGame(userId, function (User) {
        console.log(User.Username + " left game.");
        self.socket.leave(User.currentGame);

        if (User.isHost) {
            // Shutdown the game if the user was the host of the game.
            sqlQueries.shutdownGame(User.currentGame, function () {
                console.log(User.Username + " shutdown game.");
                self.socket.broadcast.to(User.currentGame).emit('generalError', {error: 'The host left.'});
                self.socket.broadcast.to(User.currentGame).emit('gameShutdown');

                Broadcast.refreshGameList(self.socket);
            });
        } else {
            // Let the other clients know if the user was in their game.
            Broadcast.refreshGameDetails(self.socket, User.CurrentGame);
            Broadcast.refreshGameList(self.socket);
        }
    });
};

// Toggles the user's ready status.
const toggleReady = function() {
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

    const userId = self.app.onlineUsers[self.socket.id].userId;

    sqlQueries.readyToggle(userId, function (User) {
        console.log(User.Username + " readied up.");
        Broadcast.refreshGameDetails(self.socket, User.CurrentGame);
    });
};

// Sends the game details to a single socket.
const getDetails = function(gameId) {
    const self = this;

    sqlQueries.getGameDetails(gameId, function (Game) {
        console.log('Sent single user game details for ' + Game.gameName);
        self.socket.emit('gameUpdate', Game);
    });
}

module.exports = function(app, socket){
    this.app = app;
    this.socket = socket;

    this.handlers = {
        'gameCreate': create.bind(this),
        'gameJoin': join.bind(this),
        'gameLeave': leave.bind(this),
        'gameToggleReady': toggleReady.bind(this),
        'gameSpectate': spectate.bind(this),
        'gameGetDetails': getDetails.bind(this)
    };
};
