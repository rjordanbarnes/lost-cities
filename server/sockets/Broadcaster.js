const sql = require('seriate');

module.exports =  class Broadcaster {

    constructor(io) {
        this.io = io;
    }

    // Broadcasts the active rooms to all sockets
    broadcastActiveRooms() {
        let self = this;

        sql.execute({
            query: sql.fromFile("../sql/GetActiveRooms")
        }).then(function (results) {
            // Converts the returned bit 0 and 1 to Boolean values.
            for (let i = 0; i < results.length; i++) {
                results[i].roomID = i;
                results[i].isPasswordProtected = Boolean(results[i].isPasswordProtected);
            }

            console.log('Broadcasting room list.');
            self.io.emit('lobby room list', {rooms: results})
        }, function (err) {
            console.error(err);
        });
    };
}