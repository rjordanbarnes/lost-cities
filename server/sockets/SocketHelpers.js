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
            const hands = {};

            // Associate each hand to an account and initially replace all hands with 'back' cards.
            for (let i = 0; i < Game.players.length; i++) {
                hands[Game.players[i].accountSK] = Game.players[i].hand;
                Game.players[i].handSize = Game.players[i].hand.length;
                delete Game.players[i].hand;
            }

            // Update clients with everything but their hands.
            socket.server.in(gameSK).emit('gameUpdate', Game);

            // For each socket in the room, send them their hand.
            Object.keys(socket.adapter.rooms[gameSK].sockets).forEach(function(socketid) {
                const clientsocket = socket.server.sockets.connected[socketid];

                if (clientsocket.user.accountSK in hands) {
                    clientsocket.emit('gameHandUpdate', hands[clientsocket.user.accountSK]);
                }
            });

            console.log('Server sent game details for ' + Game.gameName);
        });
    }
};

module.exports.Validations = {
    // Returns whether the given socket is authenticated and sends an error to the user if not.
    isAuthenticated(socket) {
        if (!socket.user.accountSK) {
            console.log('Unauthenticated socket request.');
            socket.emit('generalError', {error: 'Must be logged in.'});
        }

        return socket.user.accountSK;
    }
};
