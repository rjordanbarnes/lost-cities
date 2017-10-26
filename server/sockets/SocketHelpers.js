const sqlQueries = require('../sqlQueries.js');

module.exports.Broadcast = {
    // Updates room list for all sockets.
    refreshRoomList(socket) {
        sqlQueries.getActiveRooms(function (RoomList) {
            console.log('Broadcasted room list.');
            socket.server.emit('lobbyRoomList', {rooms: RoomList});
        });
    },

    // Refresh an individual room's details for all users in the room.
    refreshRoomDetails(socket, roomId) {
        sqlQueries.getRoomDetails(roomId, function (Room) {
            console.log('Sent room details for ' + Room.roomName);
            socket.server.in(roomId).emit('roomUpdate', Room);
        });
    }
};

module.exports.Validations = {
    // Returns whether the given socket is authenticated and sends an error to the user if not.
    isAuthenticated(socket) {
        if (!socket.authenticated) {
            console.log('Unauthenticated socket request.');
            socket.emit('generalError', {error: 'Must be logged in.'});
        }

        return socket.authenticated;
    }
};
