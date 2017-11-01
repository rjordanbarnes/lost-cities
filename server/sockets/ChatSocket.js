const sqlQueries = require('../sqlQueries.js');
const Broadcast = require('./SocketHelpers.js').Broadcast;
const Validations = require('./SocketHelpers.js').Validations;

const message = function(data) {
    const self = this;

    // TODO: Sanitize data.message?

    if (!Validations.isAuthenticated(self.socket) || data.message.trim().length < 1)
        return;

    if (data.roomId) {
        // Send chat to user's room.
        sqlQueries.getUser(self.app.onlineUsers[self.socket.id].username, function(User) {
            if (data.roomId === User.CurrentRoom) {
                self.socket.server.in(User.CurrentRoom).emit('chatMessage', {
                    roomId: User.CurrentRoom,
                    chatUsername: self.app.onlineUsers[self.socket.id].username,
                    chatMessage: data.message
                });
            }
        });
    } else {
        // Send chat to lobby if room not specified.
        console.log("Sending message.");
        self.socket.server.emit('chatMessage', {
            chatUsername: self.app.onlineUsers[self.socket.id].username,
            chatMessage: data.message
        });
    }
};

module.exports = function(app, socket){
    this.app = app;
    this.socket = socket;

    this.handlers = {
        'chatMessage': message.bind(this)
    };
};
