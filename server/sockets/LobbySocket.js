const Broadcast = require('./SocketHelpers.js').Broadcast;

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
