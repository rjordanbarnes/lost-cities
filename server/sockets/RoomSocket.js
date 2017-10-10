const sqlQueries = require('../sqlQueries.js');

const leaveRoom = function(){
    let self = this;

    let userInfo = {userId: self.app.onlineUsers[self.socket.id]};

    sqlQueries.leaveRoom(userInfo, function(results) {
        let roomInfo = {roomId: results[0].CurrentRoom};
        self.socket.leave(roomInfo.roomId);

        // Updates room list for all sockets.
        sqlQueries.getActiveRooms(function (results) {
            console.log('Broadcasting room list.');
            self.socket.server.emit('lobby active rooms', {rooms: results});
        });

        if (results[0].IsHost) {
            // Shutdown the room if the user was the host of the room.
            sqlQueries.shutdownRoom(roomInfo, function () {
                self.socket.server.in(roomInfo.roomId).emit('server error', {error: 'The host left.'});
                self.socket.server.in(roomInfo.roomId).emit('room shutdown');
            });
        } else {
            // Notify others in the room if someone other than the host left.
            sqlQueries.getRoomDetails(roomInfo, function (results) {
                self.socket.server.in(roomInfo.roomId).emit('room update', results);
            });
        }
    });
};

const readyToggle = function() {
    let self = this;

    let userInfo = {userId: self.app.onlineUsers[self.socket.id]};

    sqlQueries.readyToggle(userInfo, function(results) {
        let roomInfo = {roomId: results[0].CurrentRoom};

        // Notify others in the room that someone is ready.
        sqlQueries.getRoomDetails(roomInfo, function (results) {
            self.socket.server.in(roomInfo.roomId).emit('room update', results);
        });
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