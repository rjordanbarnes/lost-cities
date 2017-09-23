const sql = require('seriate');

const getActiveRooms = function(roomInfo) {
    this.broadcaster.broadcastActiveRooms();
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
            self.broadcaster.broadcastActiveRooms();
        }, function (err) {
            console.error(err);
        });
    }
};

module.exports = function(app, socket, broadcaster){
    this.app = app;
    this.socket = socket;
    this.broadcaster = broadcaster;

    this.handlers = {
        'lobby get active rooms': getActiveRooms.bind(this),
        'lobby create room': createRoom.bind(this)
    };
};