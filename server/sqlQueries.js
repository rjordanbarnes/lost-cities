const sql = require('seriate');

module.exports = {
    // Creates a room in SQL using the supplied Room Info, making the supplied user the host.
    createRoom(userInfo, roomInfo, callback) {
        let self = this;

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
            callback(results);
        }, function (err) {
            console.error(err);
        });
    }
};