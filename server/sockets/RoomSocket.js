const sqlQueries = require('../sqlQueries.js');
const Broadcast = require('./Broadcast.js');

const leaveRoom = function(){
    let self = this;

    if (!self.socket.authenticated) {
        self.socket.emit('server error', {error: 'Must be logged in.'});
    } else {

        let userInfo = {userId: self.app.onlineUsers[self.socket.id]};

        sqlQueries.leaveRoom(userInfo, function (results) {
            let roomInfo = {roomId: results[0].CurrentRoom};
            self.socket.leave(roomInfo.roomId);

            Broadcast.refreshRoomList(self.socket);

            if (results[0].IsHost) {
                // Shutdown the room if the user was the host of the room.
                sqlQueries.shutdownRoom(roomInfo, function () {
                    self.socket.server.in(roomInfo.roomId).emit('server error', {error: 'The host left.'});
                    self.socket.server.in(roomInfo.roomId).emit('room shutdown');

                    Broadcast.refreshRoomList(self.socket);
                });
            } else {
                Broadcast.refreshRoomDetails(self.socket, roomInfo);
            }
        });
    }
};

const readyToggle = function() {
    let self = this;

    if (!self.socket.authenticated) {
        self.socket.emit('server error', {error: 'Must be logged in.'});
    } else {

        let userInfo = {userId: self.app.onlineUsers[self.socket.id]};

        sqlQueries.readyToggle(userInfo, function (results) {
            let roomInfo = {roomId: results[0].CurrentRoom};

            Broadcast.refreshRoomDetails(self.socket, roomInfo);
        });
    }
};

module.exports = function(app, socket){
    this.app = app;
    this.socket = socket;

    this.handlers = {
        'leave room': leaveRoom.bind(this),
        'ready toggle': readyToggle.bind(this)
    };
};