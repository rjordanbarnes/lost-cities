const sqlQueries = require('../sqlQueries.js');

const getActiveRooms = function(roomInfo) {
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

    // Creates room in SQL
    sqlQueries.createRoom(userInfo, roomInfo, function(results) {
        // Host joins room channel.
        self.socket.join(results[0].roomId);
        console.log('Created room ' + results[0].roomId);

        // Updates room list for all sockets.
        sqlQueries.getActiveRooms(function(results) {
            console.log('Broadcasting room list.');
            self.socket.server.emit('lobby active rooms', {rooms: results})
        });
    });

};

module.exports = function(app, socket){
    this.app = app;
    this.socket = socket;

    this.handlers = {
        'lobby get active rooms': getActiveRooms.bind(this),
        'lobby create room': createRoom.bind(this)
    };
};