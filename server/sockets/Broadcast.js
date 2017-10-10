const sqlQueries = require('../sqlQueries.js');

module.exports = {
    refreshRoomList(socket) {
        // Updates room list for all sockets.
        sqlQueries.getActiveRooms(function (results) {
            console.log('Broadcasting room list.');
            socket.server.emit('lobby active rooms', {rooms: results});
        });
    },

    refreshRoomDetails(socket, roomInfo) {
        // Refresh an individual room's details for all users in the room.
        sqlQueries.getRoomDetails(roomInfo, function (results) {
            socket.server.in(roomInfo.roomId).emit('room update', results);
        });
    }
};