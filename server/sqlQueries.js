const sql = require('seriate');

module.exports = {

    //// Maintenance ////

    // Shuts down all currently active games.
    shutdownAllGames(callback) {
        sql.execute({
            query: sql.fromFile("./sql/ShutdownAllGames")
        }).then(function(results) {
            callback(results);
        }, function(err) {
            console.error(err);
        });
    },


    //// Login ////


    // Returns User information and whether the user Exists
    loginUser(username, callback){
        sql.execute({
            query: sql.fromFile("./sql/LoginUser"),
            params: {
                username: {
                    val: username
                }
            }
        }).then(function(results) {
            // If there were no results found, set Exists to false.
            (0 in results) ? results[0].Exists = true : results[0] = {Exists: false};

            callback(results[0]);
        }, function(err) {
            console.error(err);
        });
    },

    // Verifies that the User ID that was in the token exists.
    verifyToken(userId, callback) {
        sql.execute({
            query: sql.fromFile("./sql/VerifyToken"),
            params: {
                userId: {
                    val: userId
                }
            }
        }).then(function(results) {
            // If there were no results found, set Exists to false.
            (0 in results) ? results[0].Exists = true : results[0] = {Exists: false};

            callback(results[0]);
        }, function(err) {
            console.error(err);
        });
    },


    //// Lobby ////


    // Creates a game in SQL using the supplied Game Info, making the supplied user the host.
    // Returns the new game's ID.
    createGame(userId, gameName, gamePassword, callback) {
        sql.execute({
            query: sql.fromFile("./sql/CreateGame"),
            params: {
                gameName: {
                    val: gameName
                },
                gamePassword: {
                    val: gamePassword
                },
                gameHostId: {
                    val: userId
                }
            }
        }).then(function (results) {
            callback(results[0]);
        }, function (err) {
            console.error(err);
        });
    },

    // Makes the user join the given game.
    joinGame(userId, gameId, callback) {
        sql.execute({
            query: sql.fromFile("./sql/JoinGame"),
            params: {
                userId: {
                    val: userId
                },
                gameId: {
                    val: gameId
                }
            }
        }).then(function () {
            callback();
        }, function (err) {
            console.error(err);
        });
    },

    // Makes the user join the given game.
    spectateGame(userId, gameId, callback) {
        sql.execute({
            query: sql.fromFile("./sql/SpectateGame"),
            params: {
                userId: {
                    val: userId
                },
                gameId: {
                    val: gameId
                }
            }
        }).then(function () {
            callback();
        }, function (err) {
            console.error(err);
        });
    },

    // Gets the currently active games.
    // Returns the game IDs, Names, Hosts, User Counts, and whether the game is password protected.
    getGames(callback) {
        sql.execute({
            query: sql.fromFile("./sql/GetGames")
        }).then(function (Games) {
            // Converts the returned bit 0 and 1 to Boolean values.
            for (let i = 0; i < Games.length; i++) {
                Games[i].isPasswordProtected = Games[i].isPasswordProtected === 1;
            }

            callback(Games);
        }, function (err) {
            console.error(err);
        });
    },

    // Returns detailed information about the specified game.
    // Returns the Players in the game, gameId, gameName, and whether the game is password protected.
    getGameDetails(gameId, callback) {
        sql.execute({
            query: sql.fromFile("./sql/GetGameDetails"),
            params: {
                gameId: {
                    val: gameId
                }
            }
        }).then(function (results) {
            let players = [];
            let spectators = [];

            // Place game players into an array.
            for (let i = 0; i < results.length; i++) {
                if (results[i].type === 'Player') {
                    players.push({
                        participantId: results[i].participantId,
                        userId: results[i].userId,
                        username: results[i].username,
                        isHost: results[i].isHost,
                        isReady: results[i].isReady})
                } else {
                    spectators.push({
                        participantId: results[i].participantId,
                        userId: results[i].userId,
                        username: results[i].username,
                        isHost: results[i].isHost})
                }
            }

            // Structure the results
            const gameDetails = {gameId: gameId,
                                 gameName: results[0].gameName,
                                 isPasswordProtected: results[0].isPasswordProtected === 1,
                                 players: players,
                                 spectators: spectators};

            callback(gameDetails);
        }, function (err) {
            console.error(err);
        });
    },


    //// Game ////


    // Specified user leaves whatever game they're currently in.
    // Returns the user's name, the game they were in, and if they were the host.
    leaveGame(userId, callback) {
        sql.execute({
            query: sql.fromFile("./sql/LeaveGame"),
            params: {
                userId: {
                    val: userId
                }
            }
        }).then(function (results) {
            if (!results[0].currentGame)
                results[0].currentGame = false;

            callback(results[0]);
        }, function (err) {
            console.error(err);
        });
    },

    // Shuts a certain game down.
    shutdownGame(gameId, callback) {
        sql.execute({
            query: sql.fromFile("./sql/ShutdownGame"),
            params: {
                gameId: {
                    val: gameId
                }
            }
        }).then(function () {
            callback();
        }, function (err) {
            console.error(err);
        });
    },

    // Toggles the user's ready state.
    // Returns the game that the user is in and the user's Username.
    readyToggle(userId, callback) {
        sql.execute({
            query: sql.fromFile("./sql/ReadyToggle"),
            params: {
                userId: {
                    val: userId
                }
            }
        }).then(function (results) {
            callback(results[0]);
        }, function (err) {
            console.error(err);
        });
    },
};
