const sqlQueries = require('../sqlQueries.js');
const Broadcast = require('./SocketHelpers.js').Broadcast;
const Validations = require('./SocketHelpers.js').Validations;

// Causes the socket to leave the room they're in.
const leaveRoom = function(){
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

    const userId = self.app.onlineUsers[self.socket.id];

    sqlQueries.leaveRoom(userId, function (User) {
        Broadcast.refreshRoomList(self.socket);

        if (User.IsHost) {
            // Shutdown the room if the user was the host of the room.
            sqlQueries.shutdownRoom(User.CurrentRoom, function () {
                self.socket.broadcast.to(User.CurrentRoom).emit('server error', {error: 'The host left.'});
                self.socket.broadcast.to(User.CurrentRoom).emit('room shutdown');

                Broadcast.refreshRoomList(self.socket);
            });
        } else if (User.CurrentRoom) {
            // Let the other clients know if the user was in their room.
            Broadcast.refreshRoomDetails(self.socket, User.CurrentRoom);
        }
    });
};

// Toggles the user's ready status.
const readyToggle = function() {
    const self = this;

    if (!Validations.isAuthenticated(self.socket))
        return;

    const userId = self.app.onlineUsers[self.socket.id];

    sqlQueries.readyToggle(userId, function (User) {
        Broadcast.refreshRoomDetails(self.socket, User.CurrentRoom);
    });
};

module.exports = function(app, socket){
    this.app = app;
    this.socket = socket;

    this.handlers = {
        'leave room': leaveRoom.bind(this),
        'ready toggle': readyToggle.bind(this)
    };
};