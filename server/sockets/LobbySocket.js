const sqlQueries = require('../sqlQueries.js');
const Broadcast = require('./SocketHelpers.js').Broadcast;
const Validations = require('./SocketHelpers.js').Validations;

// Refreshes lobby for every user.
function getLobbyRefresh () {
    const self = this;

    Broadcast.lobbyRefresh(self.socket);
}

module.exports = function(socket){
    this.socket = socket;

    this.handlers = {
        'lobbyRefresh': getLobbyRefresh.bind(this)
    };
};
