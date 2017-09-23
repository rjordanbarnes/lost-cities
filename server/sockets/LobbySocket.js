const sql = require('seriate');

const getActiveRooms = function(roomInfo) {
    let self = this;

    sql.execute({
        query: sql.fromFile("../sql/GetActiveRooms")
    }).then(function (results) {
        // Converts the returned bit 0 and 1 to Boolean values.
        for (let i = 0; i < results.length; i++) {
            results[i].roomID = i;
            results[i].isPasswordProtected = Boolean(results[i].isPasswordProtected);
        }

        console.log('Broadcasting room list.');
        self.socket.server.emit('lobby room list', {rooms: results})
    }, function (err) {
        console.error(err);
    });
};

// Creates a new room.
const createRoom = function(roomInfo) {
    let self = this;

    if(roomInfo.roomPassword.trim().length < 1) {
        roomInfo.roomPassword = 'NULL'
    }

    if (roomInfo.roomName.trim().length < 1) {
        // Error, names too short.
    } else {
        sql.execute({
            query: sql.fromFile("../sql/CreateRoom"),
            params: {
                roomName: {
                    val: roomInfo.roomName
                },
                roomPassword: {
                    val: roomInfo.roomPassword
                },
                roomHostID: {
                    val: self.app.onlineUsers[self.socket.id]
                }
            }
        }).then(function (results) {
            self.socket.join(results.roomId)
            self.broadcaster.broadcastActiveRooms();
        }, function (err) {
            console.error(err);
        });
    }
};

module.exports = function(app, socket){
    this.app = app;
    this.socket = socket;

    this.handlers = {
        'lobby get active rooms': getActiveRooms.bind(this),
        'lobby create room': createRoom.bind(this)
    };
};