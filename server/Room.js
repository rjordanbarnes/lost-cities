function Room(id) {
    this.id = id;
    this.name = 'room' + id;
    const players = {}; // Socket, Socket

    this.getPlayers = function() {
        return players;
    };

    this.addPlayer = function(socket) {
        players[socket] = socket;
    }
}

module.exports = Room;