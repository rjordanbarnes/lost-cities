const sqlQueries = require('../sqlQueries.js');

module.exports.Broadcast = {
    // Updates game list for all sockets.
    refreshGameList(socket) {
        sqlQueries.getGames(function (GameList) {
            console.log('Broadcasted game list.');
            socket.server.emit('lobbyGameList', {games: GameList});
        });
    },

    // Refresh an individual game's details for all users in the game.
    refreshGameDetails(socket, gameSK) {
        sqlQueries.getGameDetails(gameSK, function (Game) {
            console.log('Server sent game details for ' + Game.gameName);
            socket.server.in(gameSK).emit('gameUpdate', Game);
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
