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


    loginRequest(userInfo, callback){
        sql.execute({
            query: sql.fromFile("./sql/LoginRequest"),
            params: {
                username: {
                    val: userInfo.username
                }
            }
        }).then(function(results) {
            callback(results);
        }, function(err) {
            console.error(err);
        });
    },


    //// Lobby ////


    // Creates a room in SQL using the supplied Room Info, making the supplied user the host.
    createRoom(userInfo, roomInfo, callback) {
        sql.execute({
            query: sql.fromFile("./sql/CreateRoom"),
            params: {
                roomName: {
                    val: roomInfo.roomName
                },
                roomPassword: {
                    val: roomInfo.roomPassword
                },
                roomHostId: {
                    val: userInfo.userId
                }
            }
        }).then(function (results) {
            callback(results);
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

    // Returns a the list of players in the given room.
    getRoomDetails(roomInfo, callback) {
        sql.execute({
            query: sql.fromFile("./sql/GetRoomDetails"),
            params: {
                roomId: {
                    val: roomInfo.roomId
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

    // Makes the user join the given room.
    joinRoom(userInfo, roomInfo, callback) {
        sql.execute({
            query: sql.fromFile("./sql/JoinRoom"),
            params: {
                userId: {
                    val: userInfo.userId
                },
                roomId: {
                    val: roomInfo.roomId
                }
            }
        }).then(function () {
            callback();
        }, function (err) {
            console.error(err);
        });
    },


    //// Room ////


    // Specified user leaves whatever room they're in.
    leaveRoom(userInfo, callback) {
        sql.execute({
            query: sql.fromFile("./sql/LeaveRoom"),
            params: {
                userId: {
                    val: userInfo.userId
                }
            }
        }).then(function (results) {
            // Sends the room the user left back.
            callback(results);
        }, function (err) {
            console.error(err);
        });
    },

    // Shuts a certain room down.
    shutdownRoom(roomInfo, callback) {
        sql.execute({
            query: sql.fromFile("./sql/ShutdownRoom"),
            params: {
                roomId: {
                    val: roomInfo.roomId
                }
            }
        }).then(function () {
            callback();
        }, function (err) {
            console.error(err);
        });
    },

    // Toggles the user's ready state.
    readyToggle(userInfo, callback) {
        sql.execute({
            query: sql.fromFile("./sql/ReadyToggle"),
            params: {
                userId: {
                    val: userInfo.userId
                }
            }
        }).then(function (results) {
            // Sends the room the user's in back.
            callback(results);
        }, function (err) {
            console.error(err);
        });
    },
};