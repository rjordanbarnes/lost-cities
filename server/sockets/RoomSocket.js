const sqlQueries = require('../sqlQueries.js');
const Broadcast = require('./SocketHelpers.js').Broadcast;
const Validations = require('./SocketHelpers.js').Validations;

// Creates a new room with the current socket as the host.
const create = function(roomInput) {
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

    roomInput.roomName = roomInput.roomName.trim();

    if(roomInput.roomPassword.trim().length < 1) {
        roomInput.roomPassword = 'NULL'
    }

    if (roomInput.roomName.length < 4 || roomInput.roomName.length > 20) {
        self.socket.emit('generalError', {error: 'Room name must be between 4 and 20 characters.'});
    } else {
        const userId = self.app.onlineUsers[self.socket.id];

        sqlQueries.createRoom(userId, roomInput.roomName, roomInput.roomPassword, function (NewRoom) {
            console.log('Created room ' + roomInput.roomName);
            // Host joins room channel.
            self.socket.join(NewRoom.roomId);

            Broadcast.refreshRoomList(self.socket);
            Broadcast.refreshRoomDetails(self.socket, NewRoom.roomId);
        });
    }
};

// Causes the current socket to join the specified room.
const join = function(roomId) {
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

    const userId = self.app.onlineUsers[self.socket.id];

    sqlQueries.getRoomDetails(roomId, function(Room) {

        if (Room.players.length > 1) {
            self.socket.emit('generalError', {error: 'Room is full.'});
        } else {
            sqlQueries.joinRoom(userId, roomId, function () {
                console.log('Player joined room ' + Room.roomName);
                // Joins room's socket.io channel.
                self.socket.join(roomId);

                Broadcast.refreshRoomList(self.socket);
                Broadcast.refreshRoomDetails(self.socket, roomId);
            });
        }
    });
};

const spectate = function(roomId) {
    const self = this;

    const userId = self.app.onlineUsers[self.socket.id];

    sqlQueries.spectateRoom(userId, roomId, function () {
        console.log('Spectator joined room.');
        // Joins room's socket.io channel.
        self.socket.join(roomId);

        Broadcast.refreshRoomList(self.socket);
        Broadcast.refreshRoomDetails(self.socket, roomId);
    });
};

// Causes the socket to leave the room they're in.
const leave = function(){
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

    const userId = self.app.onlineUsers[self.socket.id];

    sqlQueries.leaveRoom(userId, function (User) {
        console.log(User.Username + " left room.");
        self.socket.leave(User.CurrentRoom);

        if (User.IsHost) {
            // Shutdown the room if the user was the host of the room.
            sqlQueries.shutdownRoom(User.CurrentRoom, function () {
                console.log(User.Username + " shutdown room.");
                self.socket.broadcast.to(User.CurrentRoom).emit('generalError', {error: 'The host left.'});
                self.socket.broadcast.to(User.CurrentRoom).emit('roomShutdown');

                Broadcast.refreshRoomList(self.socket);
            });
        } else if (User.CurrentRoom) {
            // Let the other clients know if the user was in their room.
            Broadcast.refreshRoomDetails(self.socket, User.CurrentRoom);
            Broadcast.refreshRoomList(self.socket);
        }
    });
};

// Toggles the user's ready status.
const toggleReady = function() {
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

    const userId = self.app.onlineUsers[self.socket.id];

    sqlQueries.readyToggle(userId, function (User) {
        console.log(User.Username + " readied up.");
        Broadcast.refreshRoomDetails(self.socket, User.CurrentRoom);
    });
};

// Sends the room details to a single socket.
const getDetails = function(roomId) {
    const self = this;

    sqlQueries.getRoomDetails(roomId, function (Room) {
        console.log('Sent single user room details for ' + Room.roomName);
        self.socket.emit('roomUpdate', Room);
    });
}

module.exports = function(app, socket){
    this.app = app;
    this.socket = socket;

    this.handlers = {
        'roomCreate': create.bind(this),
        'roomJoin': join.bind(this),
        'roomLeave': leave.bind(this),
        'roomToggleReady': toggleReady.bind(this),
        'roomSpectate': spectate.bind(this),
        'roomGetDetails': spectate.bind(this)
    };
};
