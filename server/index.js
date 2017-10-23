// External Modules
const express = require('express');
const expressApp = express();
const http = require('http').Server(expressApp);
const history = require('connect-history-api-fallback');
const io = require('socket.io')(http);
const path = require('path');
const sql = require('seriate');
const webpack = require('webpack');
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackConfig = require('../config/webpack.dev.js');
const compiler = webpack(webpackConfig);

// My Modules
const UserSocket = require('./sockets/UserSocket.js');
const LobbySocket = require('./sockets/LobbySocket.js');
const RoomSocket = require('./sockets/RoomSocket.js');
const GameSocket = require('./sockets/GameSocket.js');
const sqlQueries = require('./sqlQueries.js');

// SQL
const sqlConfig = require('../config/sql.config.js');
sql.setDefaultConfig(sqlConfig);

// Redirects paths to main Index file to allow Vue Router to route
expressApp.use(history());

// Tells Express to serve everything in the client folder as static content (html, js, css, etc)
expressApp.use(express.static(path.resolve(__dirname + '/../' + 'dist')));

// Webpack
expressApp.use(webpackDevMiddleware(compiler, {
    noInfo: true, publicPath: webpackConfig.output.publicPath, stats: {colors: true}
}));
expressApp.use(require("webpack-hot-middleware")(compiler));

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

        socket.emit('token request');
    });

    http.listen(8889, function() {
        console.log('Listening on *:8889');
    });
});