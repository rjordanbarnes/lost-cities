const Room = require('./Room.js');

// Manages the game rooms
function RoomController(io) {
    this.io = io;
    this.rooms = {}; // name, Room
    this.nextRoomID = 1;

    // Creates and joins a new room with the next room ID.
    this.createRoom = function(socket){
        const newRoom = new Room(this.nextRoomID++);
        this.rooms[newRoom.name] = newRoom;
        console.log(socket.player.username + ' created room ' + newRoom.name);
        this.joinRoom(socket, newRoom.name);
    };

    // Joins a room if there's only one other person in the room and the socket isn't already in the room.
    this.joinRoom = function(socket, roomName) {
        // Room Exists
        if (this.rooms.hasOwnProperty(roomName)) {
            if (socket.rooms.hasOwnProperty(roomName)) {
                // Socket is already in Room!
            } else {
                const room = this.rooms[roomName];

                switch (Object.keys(room.getPlayers()).length) {
                    case 0:
                    case 1:
                        // Join
                        socket.join(roomName, function () {
                            room.addPlayer(socket);
                            console.log(socket.player.username + ' joined room ' + room.name);
                            socket.emit('room join granted', roomName);
                        });
                        break;
                    case 2:
                        // Full!
                        socket.emit('room join denied', roomName);
                        break;
                    default:
                        // Dunno what happened...
                        socket.emit('room join denied', roomName);
                }
            }
        } else {
            // Room doesn't exist
        }
    };
}

module.exports = RoomController;