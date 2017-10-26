// External Modules
const express = require('express');
const expressApp = express();
const http = require('http').Server(expressApp);
const io = require('socket.io')(http);
const sql = require('seriate');

// My Modules
const UserSocket = require('./sockets/UserSocket.js');
const LobbySocket = require('./sockets/LobbySocket.js');
const RoomSocket = require('./sockets/RoomSocket.js');
const GameSocket = require('./sockets/GameSocket.js');
const sqlQueries = require('./sqlQueries.js');

// SQL
const sqlConfig = require('../config/sql.config.js');
sql.setDefaultConfig(sqlConfig);


// App variables
const app = {
    connectedSockets: [], // Sockets
    onlineUsers: {}       // socket.id, sql.UserId
};

// Shuts down all active rooms on server start.
sqlQueries.shutdownAllRooms(function() {
    io.on('connection', function(socket) {
        console.log('Socket connected.');
        app.connectedSockets.push(socket);
        socket.authenticated = false;


        const socketHandlers = {
            'user': new UserSocket(app, socket),
            'lobby': new LobbySocket(app, socket),
            'room' : new RoomSocket(app, socket),
            'game' : new GameSocket(app, socket)
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

    http.listen(8889, function() {
        console.log('Listening on *:8889');
    });
});