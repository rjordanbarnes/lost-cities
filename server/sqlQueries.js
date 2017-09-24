const sql = require('seriate');

module.exports = {


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
        if(roomInfo.roomPassword.trim().length < 1) {
            roomInfo.roomPassword = 'NULL'
        }

        if (roomInfo.roomName.trim().length < 1) {
            // Error, names too short.
        } else {
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
        }
    },

    // Gets the currently active rooms.
    getActiveRooms(callback) {
        sql.execute({
            query: sql.fromFile("./sql/GetActiveRooms")
        }).then(function (results) {
            // Converts the returned bit 0 and 1 to Boolean values.
            for (let i = 0; i < results.length; i++) {
                results[i].isPasswordProtected = Boolean(results[i].isPasswordProtected);
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
                              isHost: results[i].isHost}
            }
            let structuredResults = {roomId: results[0].roomId,
                                     roomName: results[0].roomName,
                                     isPasswordProtected: results[0].isPasswordProtected,
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
        }).then(function (results) {
            callback();
        }, function (err) {
            console.error(err);
        });
    }
};