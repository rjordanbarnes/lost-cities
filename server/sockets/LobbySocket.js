const sqlQueries = require('../sqlQueries.js');

const broadcastActiveRooms = function() {
    let self = this;

    sqlQueries.getActiveRooms(function(results) {
        console.log('Broadcasting room list.');
        self.socket.server.emit('lobby active rooms', {rooms: results})
    });
};

// Creates a new room.
const createRoom = function(roomInfo) {
    let self = this;

    // Builds info about user for the SQL query.
    let userInfo = {userId: self.app.onlineUsers[self.socket.id]};

    if(roomInfo.roomPassword.trim().length < 1) {
        roomInfo.roomPassword = 'NULL'
    }

    if (roomInfo.roomName.trim().length < 1) {
        // Error, names too short.
    } else {
        // Creates room in SQL
        sqlQueries.createRoom(userInfo, roomInfo, function (results) {
            // Host joins room channel.
            self.socket.join(results[0].roomId);
            console.log('Created room ' + results[0].roomId);

            // Updates room list for all sockets.
            sqlQueries.getActiveRooms(function (results) {
                console.log('Broadcasting room list.');
                self.socket.server.emit('lobby active rooms', {rooms: results})
            });

            sqlQueries.getRoomDetails(results[0], function (results) {
                self.socket.server.in(results.roomId).emit('room update', results);
            });
        });
    }
};

const joinRoom = function(roomInfo) {
    let self = this;

    // Builds info about user for the SQL query.
    let userInfo = {userId: self.app.onlineUsers[self.socket.id]};

    sqlQueries.getRoomDetails(roomInfo, function(results) {

        if (results.players.length > 1) {
            // Room's full
        } else {
            // Joins room in SQL.
            sqlQueries.joinRoom(userInfo, roomInfo, function () {
                // Joins room's socket.io channel.
                self.socket.join(roomInfo.roomId);

                // Updates room list for all sockets.
                sqlQueries.getActiveRooms(function (results) {
                    console.log('Broadcasting room list.');
                    self.socket.server.emit('lobby active rooms', {rooms: results});
                });

                // Gets the room's players and other room info to broadcast to channel.
                sqlQueries.getRoomDetails(roomInfo, function (results) {
                    self.socket.server.in(roomInfo.roomId).emit('room update', results);
                });
            });
        }
    });
};

module.exports = function(app, socket){
    this.app = app;
    this.socket = socket;

    this.handlers = {
        'lobby get active rooms': broadcastActiveRooms.bind(this),
        'lobby create room': createRoom.bind(this),
        'lobby join room': joinRoom.bind(this)
    };
};