const sql = require('seriate');

module.exports = {

    //// Maintenance ////

    // Shuts down all currently active rooms.
    shutdownAllRooms(callback) {
        sql.execute({
            query: sql.fromFile("./sql/ShutdownAllRooms")
        }).then(function(results) {
            callback(results);
        }, function(err) {
            console.error(err);
        });
    },


    //// Login ////


    // Logs in the specified user.
    // Returns UserId and if the user Exists
    loginUser(username, callback){
        sql.execute({
            query: sql.fromFile("./sql/GetUserId"),
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


    // Creates a room in SQL using the supplied Room Info, making the supplied user the host.
    // Returns the new room's ID.
    createRoom(userId, roomName, roomPassword, callback) {
        sql.execute({
            query: sql.fromFile("./sql/CreateRoom"),
            params: {
                roomName: {
                    val: roomName
                },
                roomPassword: {
                    val: roomPassword
                },
                roomHostId: {
                    val: userId
                }
            }
        }).then(function (results) {
            callback(results[0]);
        }, function (err) {
            console.error(err);
        });
    },

    // Makes the user join the given room.
    joinRoom(userId, roomId, callback) {
        sql.execute({
            query: sql.fromFile("./sql/JoinRoom"),
            params: {
                userId: {
                    val: userId
                },
                roomId: {
                    val: roomId
                }
            }
        }).then(function () {
            callback();
        }, function (err) {
            console.error(err);
        });
    },

    // Makes the user join the given room.
    spectateRoom(userId, roomId, callback) {
        sql.execute({
            query: sql.fromFile("./sql/SpectateRoom"),
            params: {
                userId: {
                    val: userId
                },
                roomId: {
                    val: roomId
                }
            }
        }).then(function () {
            callback();
        }, function (err) {
            console.error(err);
        });
    },

    // Gets the currently active rooms.
    // Returns the room IDs, Names, Hosts, User Counts, and whether the room is password protected.
    getActiveRooms(callback) {
        sql.execute({
            query: sql.fromFile("./sql/GetActiveRooms")
        }).then(function (Rooms) {
            // Converts the returned bit 0 and 1 to Boolean values.
            for (let i = 0; i < Rooms.length; i++) {
                Rooms[i].isPasswordProtected = Rooms[i].isPasswordProtected === 1;
            }

            callback(Rooms);
        }, function (err) {
            console.error(err);
        });
    },

    // Returns detailed information about the specified room.
    // Returns the Players in the room, roomId, roomName, and whether the room is password protected.
    getRoomDetails(roomId, callback) {
        sql.execute({
            query: sql.fromFile("./sql/GetRoomDetails"),
            params: {
                roomId: {
                    val: roomId
                }
            }
        }).then(function (results) {
            let players = [];
            let spectators = [];

            // Place room players into an array.
            for (let i = 0; i < results.length; i++) {
                if (results[i].isPlayer) {
                    players.push({userId: results[i].userId,
                        username: results[i].username,
                        isHost: results[i].isHost,
                        isReady: results[i].isReady})
                } else {
                    spectators.push({userId: results[i].userId,
                        username: results[i].username,
                        isHost: results[i].isHost})
                }
            }

            // Structure the results
            const roomDetails = {roomId: results[0].roomId,
                                 roomName: results[0].roomName,
                                 isPasswordProtected: results[0].isPasswordProtected === 1,
                                 players: players,
                                 spectators: spectators};

            callback(roomDetails);
        }, function (err) {
            console.error(err);
        });
    },


    //// Room ////


    // Specified user leaves whatever room they're currently in.
    // Returns the user's name, the room they were in, and if they were the host.
    leaveRoom(userId, callback) {
        sql.execute({
            query: sql.fromFile("./sql/LeaveRoom"),
            params: {
                userId: {
                    val: userId
                }
            }
        }).then(function (results) {
            if (results[0].CurrentRoom === null)
                results[0].CurrentRoom = false;

            callback(results[0]);
        }, function (err) {
            console.error(err);
        });
    },

    // Shuts a certain room down.
    shutdownRoom(roomId, callback) {
        sql.execute({
            query: sql.fromFile("./sql/ShutdownRoom"),
            params: {
                roomId: {
                    val: roomId
                }
            }
        }).then(function () {
            callback();
        }, function (err) {
            console.error(err);
        });
    },

    // Toggles the user's ready state.
    // Returns the room that the user is in and the user's Username.
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
