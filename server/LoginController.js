const util = require('util');
const Player = require('./Player.js');

// Manages user logins
function LoginController(io) {
    this.io = io;
    this.players = {};       // id, Player
    this.onlinePlayers = {}; // playerID, Socket
    this.nextPlayerID = 1;

    // Attempts to login a socket using the supplied username.
    this.attemptLogin = function (socket, username) {
        console.log(username + " is attempting to login.");
        let playerID = this.getIDFromUsername(username);

        // If playerID wasn't found in existing users, create new user.
        if (playerID === -1) {
            // Creates a new user.
            console.log("Creating new user " + username);
            const newID = this.createNewPlayer(username);
            this.login(socket, newID);
        } else {
            const isOnline = this.onlinePlayers.hasOwnProperty(playerID);

            if (isOnline) {
                socket.emit('login denied', username + ' is already logged in.');
            } else {
                console.log("Logging in " + username);
                this.login(socket, playerID);
            }
        }
    };

    // Creates a new Player
    this.createNewPlayer = function (username) {
        const newPlayerID = this.nextPlayerID++;
        this.players[newPlayerID] = new Player(username, newPlayerID);
        return newPlayerID;
    };

    // Returns a Player when given the playerID.
    this.getPlayerFromID = function(id) {
        return players[id];
    };

    this.getIDFromUsername = function(username) {
        for (let playerID in this.players) {
            if (this.players.hasOwnProperty(playerID) && username.toLowerCase() === this.players[playerID].username.toLowerCase()) {
                return playerID;
            }
        }

        return -1;
    };

    // Associates a socket to a Player, logging the socket in as that Player.
    this.login = function (socket, playerID) {
        this.onlinePlayers[playerID] = socket;
        // Links the socket to the player upon login
        socket.player = this.players[playerID];

        // Having trouble sending the rooms.
        socket.emit('login granted', JSON.stringify(io.roomController.rooms));
        socket.on('room create', function() {
            io.roomController.createRoom(socket);
        });
    };

    // Logs the socket out.
    this.logout = function(socket) {
        console.log(socket.player.username + " disconnected");

        // If the socket was logged in as a user, remove them from the online players.
        if (socket.player.id > 0) {
            delete this.onlinePlayers[socket.player.id];
        }
    };
}

module.exports = LoginController;