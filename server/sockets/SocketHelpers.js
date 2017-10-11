const sqlQueries = require('../sqlQueries.js');

module.exports.Broadcast = {
    // Updates room list for all sockets.
    refreshRoomList(socket) {
        sqlQueries.getActiveRooms(function (RoomList) {
            console.log('Broadcasting room list.');
            socket.server.emit('lobby active rooms', {rooms: RoomList});
        });
    },

    // Refresh an individual room's details for all users in the room.
    refreshRoomDetails(socket, roomId) {
        sqlQueries.getRoomDetails(roomId, function (Room) {
            socket.server.in(roomId).emit('room update', Room);
        });
    }
};

module.exports.Validations = {
    // Returns whether the given socket is authenticated and sends an error to the user if not.
    isAuthenticated(socket) {
        if (!socket.authenticated) {
            socket.emit('server error', {error: 'Must be logged in.'});
            socket.emit('user unauthenticated');
        }

        return socket.authenticated;
    }
};