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
            callback({errors: err});
        });
    },


    //// User ////


    // Returns User information and whether the user Exists
    signinGoogleAccount(userData, callback){
        sql.execute({
            query: sql.fromFile("./sql/SigninGoogleAccount"),
            params: {
                googleID: {
                    val: userData.id
                },
                avatarURL: {
                    val: userData.image.url
                },
                googleUsername: {
                    val: userData.name.givenName
                }
            }
        }).then(function(results) {
            // If there were no results found, set exists to false.
            (0 in results) ? results[0].exists = true : results[0] = {exists: false};

            callback(results[0]);
        }, function(err) {
            callback({errors: err});
        });
    },

    // Verifies that the User ID that was in the token exists.
    verifyToken(accountSK, callback) {
        sql.execute({
            query: sql.fromFile("./sql/VerifyToken"),
            params: {
                accountSK: {
                    val: accountSK
                }
            }
        }).then(function(results) {
            // If there were no results found, set Exists to false.
            (0 in results) ? results[0].exists = true : results[0] = {exists: false};

            callback(results[0]);
        }, function(err) {
            callback({errors: err});
        });
    },

    // Changes the given account's username
    changeUsername(accountSK, newUsername, callback) {
        sql.execute({
            query: sql.fromFile("./sql/ChangeUsername"),
            params: {
                accountSK: {
                    val: accountSK
                },
                newUsername: {
                    val: newUsername
                }
            }
        }).then(function(results) {
            callback(results[0]);
        }, function(err) {
            callback({errors: err});
        });
    },


    //// Lobby ////


    // Creates a game in SQL using the supplied Game Info, making the supplied user the host.
    // Returns the new game's ID.
    createGame(accountSK, gameName, gamePassword, callback) {
        sql.execute({
            query: sql.fromFile("./sql/CreateGame"),
            params: {
                gameName: {
                    val: gameName
                },
                gamePassword: {
                    val: gamePassword
                },
                gameHostSK: {
                    val: accountSK
                }
            }
        }).then(function (results) {
            callback(results[0]);
        }, function (err) {
            callback({errors: err});
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
            callback({errors: err});
        });
    },

    // Returns detailed information about the specified game.
    getGameDetails(gameSK, callback) {
        sql.execute({
            query: sql.fromFile("./sql/GetGameDetails"),
            params: {
                gameSK: {
                    val: gameSK
                }
            }
        }).then(function (results) {
            let players = [];
            let spectators = [];

            // Place game players into an array.
            for (let i = 0; i < results.length; i++) {
                if (results[i].gameMemberType === 'Player') {
                    players.push({
                        gameMemberSK: results[i].gameMemberSK,
                        accountSK: results[i].accountSK,
                        username: results[i].username,
                        skillRating: results[i].skillRating,
                        isHost: results[i].isHost,
                        isReady: results[i].isReady,
                        isTurn: results[i].isTurn,
                        hand: [],
                        scorePiles: {}})
                } else {
                    spectators.push({
                        gameMemberSK: results[i].gameMemberSK,
                        accountSK: results[i].accountSK,
                        username: results[i].username,
                        isHost: results[i].isHost})
                }
            }

            // Structure the results
            const gameDetails = {gameSK: gameSK,
                                 gameName: results[0].gameName,
                                 gameState: results[0].gameState,
                                 turnState: results[0].turnState,
                                 isPasswordProtected: results[0].isPasswordProtected === 1,
                                 deckSize: results[0].deckSize,
                                 deckSK: results[0].deckSK,
                                 discardPiles: {},
                                 players: players,
                                 spectators: spectators};

            sql.execute({
                query: sql.fromFile("./sql/GetDiscardPiles"),
                params: {
                    gameSK: {
                        val: gameSK
                    }
                }
            }).then(function (results) {
                // Create discard pile arrays for each discard pile
                for (let i = 0; i < results.length; i++) {
                    // Create the discard pile if not yet created.
                    if (gameDetails.discardPiles[results[i].DiscardPileColor.toLowerCase()] === undefined)
                        gameDetails.discardPiles[results[i].DiscardPileColor.toLowerCase()] = {[results[i].DiscardPileSK]: []};

                    // Add card to discard pile array. This will put cards in ascending order so top-most card is at end of the array.
                    if (results[i].CardSK !== null)
                        gameDetails.discardPiles[results[i].DiscardPileColor.toLowerCase()][results[i].DiscardPileSK].push({CardSK: results[i].CardSK, CardColor: results[i].CardColor.toLowerCase(), CardValue: results[i].CardValue})
                }

                sql.execute({
                    query: sql.fromFile("./sql/GetScorePiles"),
                    params: {
                        gameSK: {
                            val: gameSK
                        }
                    }
                }).then(function (results) {
                    // For each player, fill their scorePiles object with an array of cards for each of their score piles.
                    for (let i = 0; i < gameDetails.players.length; i++) {

                        for (let j = 0; j < results.length; j++) {
                            if (results[j].GameMemberSK === gameDetails.players[i].gameMemberSK) {
                                // Creates a missing score pile
                                if (gameDetails.players[i].scorePiles[results[j].ScorePileColor.toLowerCase()] === undefined)
                                    gameDetails.players[i].scorePiles[results[j].ScorePileColor.toLowerCase()] = {[results[j].ScorePileSK]: []};

                                // Fills the score piles
                                if (results[j].CardSK !== null)
                                    gameDetails.players[i].scorePiles[results[j].ScorePileColor.toLowerCase()][results[j].ScorePileSK].push({CardSK: results[j].CardSK, CardColor: results[j].CardColor.toLowerCase(), CardValue: results[j].CardValue});

                            }
                        }
                    }

                    sql.execute({
                        query: sql.fromFile("./sql/GetPlayerHands"),
                        params: {
                            gameSK: {
                                val: gameSK
                            }
                        }
                    }).then(function (results) {

                        // Goes through each player and adds cards to their hand from the results
                        for (let i = 0; i < gameDetails.players.length; i++) {
                            for (let j = 0; j < results.length; j++) {
                                if (gameDetails.players[i].gameMemberSK === results[j].PlayerSK) {
                                    gameDetails.players[i].hand.push({CardSK: results[j].CardSK, CardColor: results[j].CardColor.toLowerCase(), CardValue: results[j].CardValue})
                                }
                            }
                        }

                        callback(gameDetails);
                    });
                });
            });
        }, function (err) {
            callback({errors: err});
        });
    },


    //// Game ////

    // Makes the user join the given game as the supplied gameMemberType (Player or Spectator).
    joinGame(accountSK, gameSK, password, gameMemberType, callback) {
        sql.execute({
            query: sql.fromFile("./sql/JoinGame"),
            params: {
                accountSK: {
                    val: accountSK
                },
                gameSK: {
                    val: gameSK
                },
                password: {
                    val: password
                },
                gameMemberType: {
                    val: gameMemberType
                }
            }
        }).then(function () {
            callback();
        }, function (err) {
            callback({errors: err});
        });
    },

    // Starts the game that the supplied user is in if they're the host.
    startGame(accountSK, callback) {
        sql.execute({
            query: sql.fromFile("./sql/StartGame"),
            params: {
                accountSK: {
                    val: accountSK
                }
            }
        }).then(function (results) {
            callback(results[0]);
        }, function (err) {
            callback({errors: err});
        });
    },

    // Specified user leaves whatever game they're currently in.
    // Returns the user's name, the game they were in, and if they were the host.
    leaveGame(accountSK, callback) {
        sql.execute({
            query: sql.fromFile("./sql/LeaveGame"),
            params: {
                accountSK: {
                    val: accountSK
                }
            }
        }).then(function (results) {
            if (!results[0].currentGame)
                results[0].currentGame = false;

            callback(results[0]);
        }, function (err) {
            callback({errors: err});
        });
    },

    // Toggles the user's ready state.
    // Returns the game that the user is in and the user's Username.
    readyToggle(accountSK, callback) {
        sql.execute({
            query: sql.fromFile("./sql/ReadyToggle"),
            params: {
                accountSK: {
                    val: accountSK
                }
            }
        }).then(function (results) {
            callback(results[0]);
        }, function (err) {
            callback({errors: err});
        });
    },

    // Makes a turn
    //
    placeCard(accountSK, playedCardSK, playedCardLocationType, playedCardLocationSK, callback) {
        sql.execute({
            query: sql.fromFile("./sql/PlaceCard"),
            params: {
                accountSK: {
                    val: accountSK
                },
                playedCardSK: {
                    val: playedCardSK
                },
                playedCardLocationType: {
                    val: playedCardLocationType
                },
                playedCardLocationSK: {
                    val: playedCardLocationSK
                }
            }
        }).then(function (results) {
            callback(results[0]);
        }, function (err) {
            callback({errors: err});
        });
    },

    // Makes a turn
    //
    drawCard(accountSK, drawCardLocationType, drawCardLocationSK, callback) {
        sql.execute({
            query: sql.fromFile("./sql/DrawCard"),
            params: {
                accountSK: {
                    val: accountSK
                },
                drawCardLocationType: {
                    val: drawCardLocationType
                },
                drawCardLocationSK: {
                    val: drawCardLocationSK
                }
            }
        }).then(function (results) {
            callback(results[0]);
        }, function (err) {
            callback({errors: err});
        });
    }
};
