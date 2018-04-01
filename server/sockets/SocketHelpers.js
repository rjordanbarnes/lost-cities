const sqlQueries = require('../sqlQueries.js');
const appVariables = require('../appVariables.js');

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

            // Send each player in the room their hand.
            Object.keys(appVariables.onlineUsers).forEach(function(socketid, index) {
                if (appVariables.onlineUsers[socketid].accountSK in hands) {
                    socket.server.sockets.connected[socketid].emit('gameHandUpdate', hands[appVariables.onlineUsers[socketid].accountSK]);
                }
            });

            console.log('Server sent game details for ' + Game.gameName);
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
