const sqlQueries = require('../sqlQueries.js');
const Broadcast = require('./SocketHelpers.js').Broadcast;
const Validations = require('./SocketHelpers.js').Validations;
const appVariables = require('../appVariables.js');

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
        const accountSK = appVariables.onlineUsers[self.socket.id].accountSK;

        sqlQueries.createGame(accountSK, gameInput.gameName, gameInput.gamePassword, function (NewGame) {
            if (NewGame && NewGame.hasOwnProperty('errors')) {
                console.log(NewGame.errors.message);
            } else {
                console.log('Created game ' + gameInput.gameName);
                // Host joins game channel.
                self.socket.join(NewGame.gameSK);

                self.socket.emit('gameCreate', NewGame);
                Broadcast.refreshGameList(self.socket);
                Broadcast.refreshGameDetails(self.socket, NewGame.gameSK);
            }
        });
    }
};

// Causes the current socket to join the specified game as a player.
const join = function(gameInput) {
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

    const accountSK = appVariables.onlineUsers[self.socket.id].accountSK;

    sqlQueries.joinGame(accountSK, gameInput.gameSK, gameInput.password, 'Player', function (data) {
        if (data && data.hasOwnProperty('errors')) {
            console.log(data.errors.message);
        } else {
            console.log('Player joined a game.');
            // Joins game's socket.io channel.
            self.socket.join(gameInput.gameSK);

            self.socket.emit('gameJoin', {gameSK: gameInput.gameSK});
            Broadcast.refreshGameList(self.socket);
            Broadcast.refreshGameDetails(self.socket, gameInput.gameSK);
        }
    });
};

const spectate = function(gameInput) {
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

    const accountSK = appVariables.onlineUsers[self.socket.id].accountSK;

    sqlQueries.joinGame(accountSK, gameInput.gameSK, gameInput.password, 'Spectator', function (data) {
        if (data && data.hasOwnProperty('errors')) {
            self.socket.emit('gameSpectate', {errors: data.errors.message});
            console.log(data.errors.message);
        } else {
            console.log('Spectator joined game.');
            // Joins game's socket.io channel.
            self.socket.join(gameInput.gameSK);

            self.socket.emit('gameSpectate', {gameSK: gameInput.gameSK});

            Broadcast.refreshGameList(self.socket);
            Broadcast.refreshGameDetails(self.socket, gameInput.gameSK);
        }
    });
};

const start = function() {
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

    const accountSK = appVariables.onlineUsers[self.socket.id].accountSK;

    sqlQueries.startGame(accountSK, function(data) {
        if (data && data.hasOwnProperty('errors')) {
            console.log(data.errors.message);
        } else {
            Broadcast.refreshGameDetails(self.socket, data.gameSK);
        }
    });
};

// Causes the socket to leave the game they're in.
const leave = function(){
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

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
};

// Toggles the user's ready status.
const toggleReady = function() {
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

    const accountSK = appVariables.onlineUsers[self.socket.id].accountSK;

    sqlQueries.readyToggle(accountSK, function (User) {
        if (User.hasOwnProperty('errors')) {
            console.log(User.errors.message);
        } else {
            console.log(User.Username + " readied up.");
            Broadcast.refreshGameDetails(self.socket, User.currentGame);
        }
    });
};

const makeTurn = function() {
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

    const accountSK = appVariables.onlineUsers[self.socket.id].accountSK;

    sqlQueries.makeTurn(accountSK, function (User) {
        if (User.hasOwnProperty('errors')) {
            console.log(User.errors.message);
        } else {
            console.log(User.Username + " readied up.");
            Broadcast.refreshGameDetails(self.socket, User.currentGame);
        }
    });
};

module.exports = function(socket){
    this.socket = socket;

    this.handlers = {
        'gameCreate': create.bind(this),
        'gameJoin': join.bind(this),
        'gameSpectate': spectate.bind(this),
        'gameLeave': leave.bind(this),
        'gameStart': start.bind(this),
        'gameToggleReady': toggleReady.bind(this),
        'gameMakeTurn': makeTurn.bind(this)
    };
};
