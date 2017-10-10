const sqlQueries = require('../sqlQueries.js');

module.exports = {
    refreshRoomList(socket) {
        // Updates room list for all sockets.
        sqlQueries.getActiveRooms(function (results) {
            console.log('Broadcasting room list.');
            socket.server.emit('lobby active rooms', {rooms: results});
        });
    }
};