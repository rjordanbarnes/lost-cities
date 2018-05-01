// External Modules
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const sql = require('seriate');

// My Modules
const UserSocket = require('./sockets/UserSocket.js');
const LobbySocket = require('./sockets/LobbySocket.js');
const GameSocket = require('./sockets/GameSocket.js');
const ChatSocket = require('./sockets/ChatSocket.js');
const sqlQueries = require('./sqlQueries.js');

// SQL
const sqlConfig = require('../config/sql.config.js');
sql.setDefaultConfig(sqlConfig);


// Shuts down all active rooms on server start.
sqlQueries.shutdownAllGames(function() {
    io.on('connection', function(socket) {
        console.log('Socket connected.');

        socket.user = {
            accountSK: null,
            username: null
        };

        const socketHandlers = {
            'user': new UserSocket(socket),
            'lobby': new LobbySocket(socket),
            'game' : new GameSocket(socket),
            'chat': new ChatSocket(socket)
        };

        for (let category in socketHandlers) {
            let handler = socketHandlers[category].handlers;
            for (let event in handler) {
                if (handler.hasOwnProperty(event)) {
                    socket.on(event, handler[event]);
                }
            }
        }

        socket.emit('userRequestToken');
    });

    http.listen(3379, function() {
        console.log('Listening on *:3379');
    });
});
