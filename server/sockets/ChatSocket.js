const Validations = require('./SocketHelpers.js').Validations;

function message(data) {
    const self = this;

    if (!Validations.isAuthenticated(self.socket) || data.message.trim().length < 1 || data.message.trim().length > 500)
        return;

    if (data.gameSK) {
        // Send chat to user's game if that user is in the game.
        if (self.socket.rooms.hasOwnProperty(data.gameSK)) {
            console.log(self.socket.user.username + ' sent a chat message to a room.');

            self.socket.server.in(data.gameSK).emit('chatMessage', {
                gameSK: data.gameSK,
                chatUsername: self.socket.user.username,
                chatMessage: data.message
            });
        }
    } else {
        // Send chat to lobby if game not specified.
        console.log(self.socket.user.username + ' sent a chat message to the lobby.');
        self.socket.server.emit('chatMessage', {
            chatUsername: self.socket.user.username,
            chatMessage: data.message
        });
    }
}

module.exports = function(socket){
    this.socket = socket;

    this.handlers = {
        'chatMessage': message.bind(this)
    };
};
