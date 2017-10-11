const sqlQueries = require('../sqlQueries.js');
const Broadcast = require('./SocketHelpers.js').Broadcast;
const Validations = require('./SocketHelpers.js').Validations;

// Broadcasts the active rooms to all users.
const broadcastActiveRooms = function() {
    const self = this;

    Broadcast.refreshRoomList(self.socket);
};

// Creates a new room with the current socket as the host.
const createRoom = function(roomInfo) {
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

    roomInfo.roomName = roomInfo.roomName.trim();

    if(roomInfo.roomPassword.trim().length < 1) {
        roomInfo.roomPassword = 'NULL'
    }

    if (roomInfo.roomName.length < 4 || roomInfo.roomName.length > 20) {
        self.socket.emit('server error', {error: 'Room name must be between 4 and 20 characters.'});
    } else {
        const userId = self.app.onlineUsers[self.socket.id];

        sqlQueries.createRoom(userId, roomInfo.roomName, roomInfo.roomPassword, function (Room) {
            // Host joins room channel.
            self.socket.join(Room.roomId);
            console.log('Created room ' + Room.roomName);

            Broadcast.refreshRoomList(self.socket);
            Broadcast.refreshRoomDetails(self.socket, Room.roomId);
        });
    }
};

// Causes the current socket to join the specified room.
const joinRoom = function(roomId) {
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

    const userId = self.app.onlineUsers[self.socket.id];

    sqlQueries.getRoomDetails(roomId, function(Room) {

        if (Room.players.length > 1) {
            self.socket.emit('server error', {error: 'Room is full.'});
        } else {
            sqlQueries.joinRoom(userId, roomId, function () {
                // Joins room's socket.io channel.
                self.socket.join(roomId);

                Broadcast.refreshRoomList(self.socket);
                Broadcast.refreshRoomDetails(self.socket, roomId);
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