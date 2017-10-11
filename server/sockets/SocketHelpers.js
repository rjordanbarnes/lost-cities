const sqlQueries = require('../sqlQueries.js');

module.exports.Broadcast = {
    refreshRoomList(socket) {
        // Updates room list for all sockets.
        sqlQueries.getActiveRooms(function (results) {
            console.log('Broadcasting room list.');
            socket.server.emit('lobby active rooms', {rooms: results});
        });
    },

    refreshRoomDetails(socket, roomId) {
        // Refresh an individual room's details for all users in the room.
        sqlQueries.getRoomDetails(roomId, function (results) {
            socket.server.in(roomId).emit('room update', results);
        });
    }
};

module.exports.Validations = {
    isAuthenticated(socket) {
        if (!socket.authenticated) {
            socket.emit('server error', {error: 'Must be logged in.'});
            socket.emit('user unauthenticated');
        }

        return socket.authenticated;
    }
};