const sqlQueries = require('../sqlQueries.js');
const Broadcast = require('./SocketHelpers.js').Broadcast;
const Validations = require('./SocketHelpers.js').Validations;

// Broadcasts the active rooms to all users.
const getRooms = function() {
    const self = this;

    sqlQueries.getActiveRooms(function (RoomList) {
        console.log('Sending room list to single user.');
        self.socket.emit('lobbyRoomList', {rooms: RoomList});
    });
};

module.exports = function(app, socket){
    this.app = app;
    this.socket = socket;

    this.handlers = {
        'lobbyGetRooms': getRooms.bind(this)
    };
};
