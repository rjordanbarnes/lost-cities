const sql = require('seriate');

module.exports = {

    //// Maintenance ////

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
    joinRoom(userId, roomId) {
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
        }, function (err) {
            console.error(err);
        });
    },

    // Gets the currently active rooms.
    getActiveRooms(callback) {
        sql.execute({
            query: sql.fromFile("./sql/GetActiveRooms")
        }).then(function (results) {
            // Converts the returned bit 0 and 1 to Boolean values.
            for (let i = 0; i < results.length; i++) {
                results[i].isPasswordProtected = results[i].isPasswordProtected === 1;
            }

            callback(results);
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
            // Restructure results into JS object
            let players = [];

            for (let i = 0; i < results.length; i++) {
                players[i] = {userId: results[i].userId,
                    username: results[i].username,
                    isHost: results[i].isHost,
                    isReady: results[i].isReady}
            }

            let structuredResults = {roomId: results[0].roomId,
                roomName: results[0].roomName,
                isPasswordProtected: results[0].isPasswordProtected === 1,
                players: players};

            callback(structuredResults);
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
    shutdownRoom(roomId) {
        sql.execute({
            query: sql.fromFile("./sql/ShutdownRoom"),
            params: {
                roomId: {
                    val: roomId
                }
            }
        }).then(function () {
        }, function (err) {
            console.error(err);
        });
    },

    // Toggles the user's ready state.
    // Returns the room that the user is in.
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