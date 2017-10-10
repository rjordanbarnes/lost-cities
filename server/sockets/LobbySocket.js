const sqlQueries = require('../sqlQueries.js');
const Broadcast = require('./Broadcast.js');

const broadcastActiveRooms = function() {
    let self = this;

    Broadcast.refreshRoomList(self.socket);
};

// Creates a new room.
const createRoom = function(roomInfo) {
    let self = this;

    roomInfo.roomName = roomInfo.roomName.trim();

    if(roomInfo.roomPassword.trim().length < 1) {
        roomInfo.roomPassword = 'NULL'
    }

    if (!self.socket.authenticated) {
        self.socket.emit('server error', {error: 'Must be logged in.'});
    } else if (roomInfo.roomName.length < 4 || roomInfo.roomName.length > 20) {
        self.socket.emit('server error', {error: 'Room name must be between 4 and 20 characters.'});
    } else {
        let userInfo = {userId: self.app.onlineUsers[self.socket.id]};

        // Creates room in SQL
        sqlQueries.createRoom(userInfo, roomInfo, function (results) {
            // Host joins room channel.
            self.socket.join(results[0].roomId);
            console.log('Created room ' + results[0].roomId);

            Broadcast.refreshRoomList(self.socket);
            Broadcast.refreshRoomDetails(self.socket, results[0]);
        });
    }
};

const joinRoom = function(roomInfo) {
    let self = this;

    if (!self.socket.authenticated) {
        self.socket.emit('server error', {error: 'Must be logged in.'});
    } else {
        // Builds info about user for the SQL query.
        let userInfo = {userId: self.app.onlineUsers[self.socket.id]};

        sqlQueries.getRoomDetails(roomInfo, function(results) {

            if (results.players.length > 1) {
                self.socket.emit('server error', {error: 'Room is full.'});
            } else {
                // Joins room in SQL.
                sqlQueries.joinRoom(userInfo, roomInfo, function () {
                    // Joins room's socket.io channel.
                    self.socket.join(roomInfo.roomId);

                    Broadcast.refreshRoomList(self.socket);
                    Broadcast.refreshRoomDetails(self.socket, roomInfo);
                });
            }
        });
    }
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