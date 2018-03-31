const sqlQueries = require('../sqlQueries.js');
const Broadcast = require('./SocketHelpers.js').Broadcast;
const Validations = require('./SocketHelpers.js').Validations;
const appVariables = require('../appVariables.js');

const message = function(data) {
    const self = this;

    if (!Validations.isAuthenticated(self.socket) || data.message.trim().length < 1 || data.message.trim().length > 500)
        return;

    if (data.gameSK) {
        // Send chat to user's game.
        // TODO: Make sure user is in the room/channel before sending the message.
        self.socket.server.in(data.gameSK).emit('chatMessage', {
            gameSK: data.gameSK,
            chatUsername: appVariables.onlineUsers[self.socket.id].username,
            chatMessage: data.message
        });
    } else {
        // Send chat to lobby if game not specified.
        console.log("Sending message.");
        self.socket.server.emit('chatMessage', {
            chatUsername: appVariables.onlineUsers[self.socket.id].username,
            chatMessage: data.message
        });
    }
};

module.exports = function(socket){
    this.socket = socket;

    this.handlers = {
        'chatMessage': message.bind(this)
    };
};
