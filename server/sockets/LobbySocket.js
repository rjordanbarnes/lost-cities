const sql = require('seriate');

// Sends the list of rooms back to the socket.
const getActiveRooms = function(){
    let self = this;

    sql.execute({
        query: sql.fromFile("../sql/getActiveRooms")
    }).then(function(results) {
        // Converts the returned bit 0 and 1 to Boolean values.
        for (let i = 0; i < results.length; i++) {
            results[i].isPasswordProtected = Boolean(results[i].isPasswordProtected);
        }

        console.log('Sending room list to ' + self.app.onlineUsers[self.socket.id] + '.');
        self.socket.emit('lobby room list', { rooms : results})
    }, function(err) {
        console.error(err);
    });
};

module.exports = function(app, socket){
    this.app = app;
    this.socket = socket;

    this.handlers = {
        'lobby get active rooms': getActiveRooms.bind(this)
    };
};