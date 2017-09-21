// External Modules
const express = require('express');
const expressApp = express();
const http = require('http').Server(expressApp);
const io = require('socket.io')(http);
const path = require('path');
const sql = require('seriate');

// My Modules
const UserSocket = require('./sockets/UserSocket.js');
const LobbySocket = require('./sockets/LobbySocket.js');
const RoomSocket = require('./sockets/RoomSocket.js');
const GameSocket = require('./sockets/GameSocket.js');


// SQL
const sqlConfig = {
    'host': '127.0.0.1',
    'user': 'sa',
    'password': 'testing',
    'database': 'LostCities',
};
sql.setDefaultConfig(sqlConfig);

// Tells Express to serve everything in the client folder as static content (html, js, css, etc)
expressApp.use(express.static(path.resolve(__dirname + '/../' + 'client')));

// App variables
const app = {
    connectedSockets: [], // Sockets
    onlineUsers: {},      // socket.id, sql.UserID
    activeRooms: {}       // sql.RoomID, socket.id host
};

io.on('connection', function(socket) {
    console.log('Socket connected.')
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

    socket.on('disconnect',function(){
        console.log('Socket disconnected.');

        // Removes connected socket.
        let socketIndex = app.connectedSockets.indexOf(socket);
        if (socketIndex >= 0)
            app.connectedSockets.splice(socketIndex, 1);

        // Removes online user if associated with the socket.
        if (app.onlineUsers.hasOwnProperty(socket.id))
            delete app.onlineUsers[socket.id];

    });
});

http.listen(8889, function() {
    console.log('Listening on *:8889');
});