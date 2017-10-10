const sqlQueries = require('../sqlQueries.js');
const Broadcast = require('./Broadcast.js');

// Authenticates if username is in SQL database.
const loginRequest = function(userInfo){
    let self = this;

    sqlQueries.loginRequest(userInfo, function(results) {
        self.socket.authenticated = results.length > 0;

        if (self.socket.authenticated) {
            self.app.onlineUsers[self.socket.id] = results[0].UserId;
            console.log(userInfo.username + " logged in.");
            self.socket.emit('user login success');
        } else {
            self.socket.emit('server error', {error: 'Unable to login as ' + userInfo.username + '.'});
        }
    });
};

const disconnectUser = function() {
    let self = this;

    console.log('Socket disconnected.');

    // If the user is authenticated, handle disconnecting user.
    if (self.socket.authenticated) {
        let userInfo = {userId: self.app.onlineUsers[self.socket.id]};

        sqlQueries.leaveRoom(userInfo, function(results) {
            Broadcast.refreshRoomList(self.socket);

            // If the user was in a room, properly shutdowns their rooms and games.
            if (results[0]) {
                let roomInfo = {roomId: results[0].CurrentRoom};

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
            }
        });

        delete self.app.onlineUsers[self.socket.id];
    }


    // Removes connected socket.
    let socketIndex = self.app.connectedSockets.indexOf(self.socket);
    if (socketIndex >= 0)
        self.app.connectedSockets.splice(socketIndex, 1);
};

module.exports = function(app, socket){
    this.app = app;
    this.socket = socket;

    this.handlers = {
        'user login request': loginRequest.bind(this),
        'disconnect': disconnectUser.bind(this)
    };
};