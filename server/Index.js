// To DO:
// Use classes instead of functions?
// Make it so everything isn't available as this.whatever, maybe make them vars instead and use getters/setters. Look this up
// Continue working on the display of rooms.




// Other Modules
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

// My Modules
const Player = require('./Player.js');
const LoginController = new (require('./LoginController.js'))(io);
const RoomController = new (require('./RoomController.js'))(io);

//
io.loginController = LoginController;
io.roomController = RoomController;

// Tells Express to serve everything in the client folder as static content (html, js, css, etc)
app.use(express.static(path.resolve(__dirname + '/../' + 'client')));


io.on('connection', function(socket) {
    console.log("A socket connected.");
    socket.player = new Player("Unknown", -1);

    socket.on('login attempt', function(username) {
        LoginController.attemptLogin(socket, username);
    });

    socket.on('disconnect', function() {
        LoginController.logout(socket);
    });

});

http.listen(8889, function() {
    console.log('Listening on *:8889');
});