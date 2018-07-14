const sqlQueries = require('../sqlQueries.js');
const Broadcast = require('./SocketHelpers.js').Broadcast;
const Validations = require('./SocketHelpers.js').Validations;

// Creates a new game with the current socket as the host.
const create = function(gameInput) {
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

    gameInput.gameName = gameInput.gameName.trim();

    if (gameInput.gamePassword.trim().length < 1) {
        gameInput.gamePassword = 'NULL'
    }

    if (gameInput.gameName.length < 4 || gameInput.gameName.length > 20) {
        self.socket.emit('generalError', {error: 'Game name must be between 4 and 20 characters.'});
    } else {

        sqlQueries.createGame(self.socket.user.accountSK, gameInput.gameName, gameInput.gamePassword, function (NewGame) {
            if (NewGame && NewGame.hasOwnProperty('errors')) {
                console.log(NewGame.errors.message);
            } else {
                console.log(self.socket.user.username + ' created game ' + gameInput.gameName + ".");
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

    sqlQueries.joinGame(self.socket.user.accountSK, gameInput.gameSK, gameInput.password, 'Player', function (data) {
        if (data && data.hasOwnProperty('errors')) {
            console.log(data.errors.message);
        } else {
            console.log(self.socket.user.username + ' joined a game as a player.');
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

    sqlQueries.joinGame(self.socket.user.accountSK, gameInput.gameSK, gameInput.password, 'Spectator', function (data) {
        if (data && data.hasOwnProperty('errors')) {
            self.socket.emit('gameSpectate', {errors: data.errors.message});
            console.log(data.errors.message);
        } else {
            console.log(self.socket.user.username + ' joined a game as a spectator.');
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

    sqlQueries.startGame(self.socket.user.accountSK, function(data) {
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

    sqlQueries.leaveGame(self.socket.user.accountSK, function (data) {
        if (data.hasOwnProperty('errors')) {
            console.log(data.errors.message);
        } else {
            console.log(self.socket.user.username + ' left game.');

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

    sqlQueries.readyToggle(self.socket.user.accountSK, function (User) {
        if (User.hasOwnProperty('errors')) {
            console.log(User.errors.message);
        } else {
            console.log(self.socket.user.username + ' readied up.');
            Broadcast.refreshGameDetails(self.socket, User.currentGame);
        }
    });
};

const placeCard = function(turnInput) {
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

    sqlQueries.placeCard(self.socket.user.accountSK, turnInput.placedCardSK, turnInput.placedCardLocationType, turnInput.placedCardLocationSK, function (data) {
        if (data.hasOwnProperty('errors')) {
            console.log(data.errors.message);
        } else {
            console.log(self.socket.user.username + ' placed a card.');
            Broadcast.refreshGameDetails(self.socket, data.game);
        }
    });
};

const drawCard = function(turnInput) {
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

    sqlQueries.drawCard(self.socket.user.accountSK, turnInput.drawCardLocationType, turnInput.drawCardLocationSK, function (drawCardData) {
        if (drawCardData.hasOwnProperty('errors')) {
            console.log(drawCardData.errors.message);
        } else {
            console.log(self.socket.user.username + ' drew a card.');

            const winnerSK = determineWinner(drawCardData);

            if (drawCardData[0].isGameOver) {
                const winnerSK = determineWinner(drawCardData);

                sqlQueries.endGame(drawCardData[0].game, winnerSK, function(endGameData) {
                    console.log("Game ended.");
                    self.socket.server.in(drawCardData[0].game).emit('gameEnd', {winner: endGameData.winner});
                    Broadcast.refreshGameDetails(self.socket, drawCardData[0].game);
                });
            }

            Broadcast.refreshGameDetails(self.socket, drawCardData[0].game);
        }
    });
};

// Determines which player won given a set of card data.
const determineWinner = function(cardData) {
    const account1 = cardData[0].AccountSK;
    const account2 = cardData[cardData.length - 1].AccountSK;
    const accounts = {  [account1]: { totalScore: 0,
                                    ScorePiles: {
                                        'Red': {score: -20, investments: 0, numberOfCards: 0},
                                        'White': {score: -20, investments: 0, numberOfCards: 0},
                                        'Blue': {score: -20, investments: 0, numberOfCards: 0},
                                        'Yellow': {score: -20, investments: 0, numberOfCards: 0},
                                        'Green': {score: -20, investments: 0, numberOfCards: 0}
                                    }},
                        [account2]: { totalScore: 0,
                                    ScorePiles: {
                                        'Red': {score: -20, investments: 0, numberOfCards: 0},
                                        'White': {score: -20, investments: 0, numberOfCards: 0},
                                        'Blue': {score: -20, investments: 0, numberOfCards: 0},
                                        'Yellow': {score: -20, investments: 0, numberOfCards: 0},
                                        'Green': {score: -20, investments: 0, numberOfCards: 0}
                                    }}};

    cardData.forEach(function(Card) {
        if (Card.CardValue === null) {
            accounts[Card.AccountSK].ScorePiles[Card.ScorePileColor].score = 0;
        } else {
            if (Card.CardValue !== 1) {
                accounts[Card.AccountSK].ScorePiles[Card.ScorePileColor].score += Card.CardValue;
            } else {
                accounts[Card.AccountSK].ScorePiles[Card.ScorePileColor].investments++;
            }
            accounts[Card.AccountSK].ScorePiles[Card.ScorePileColor].numberOfCards++;
        }
    });

    for (let account in accounts) {
        for (let scorePile in accounts[account].ScorePiles) {
            accounts[account].ScorePiles[scorePile].score *= accounts[account].ScorePiles[scorePile].investments + 1;
            if (accounts[account].ScorePiles[scorePile].numberOfCards >= 8)
                accounts[account].ScorePiles[scorePile].score += 20;

            accounts[account].totalScore += accounts[account].ScorePiles[scorePile].score;
        }
    }

    if (accounts[account1].totalScore > accounts[account2].totalScore) {
        return account1;
    } else if (accounts[account1].totalScore < accounts[account2].totalScore) {
        return account2;
    }

    return 0;
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
        'gamePlaceCard': placeCard.bind(this),
        'gameDrawCard': drawCard.bind(this)
    };
};
