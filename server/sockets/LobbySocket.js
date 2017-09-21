const sql = require('seriate');

// Sends the list of rooms back to the socket.
const getActiveRooms = function(){
    let self = this;

    sql.execute({
        query: sql.fromFile("../sql/getActiveRooms")
    }).then(function(results) {
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