const sqlQueries = require('../sqlQueries.js');
const Broadcast = require('./SocketHelpers.js').Broadcast;
const Validations = require('./SocketHelpers.js').Validations;
const appVariables = require('../appVariables.js');

// Broadcasts the active games to all users.
const getGames = function() {
    const self = this;

    sqlQueries.getGames(function (GameList) {
        console.log('Sending game list to single user.');
        self.socket.emit('lobbyGameList', {games: GameList});
    });
};

module.exports = function(socket){
    this.socket = socket;

    this.handlers = {
        'lobbyGetGames': getGames.bind(this)
    };
};
