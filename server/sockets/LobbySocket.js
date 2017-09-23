const sql = require('seriate');

// Sends the list of rooms back to the socket.
const getActiveRooms = function(){
    let self = this;

    sql.execute({
        query: sql.fromFile("../sql/GetActiveRooms")
    }).then(function(results) {
        // Converts the returned bit 0 and 1 to Boolean values.
        for (let i = 0; i < results.length; i++) {
            results[i].roomID = i;
            results[i].isPasswordProtected = Boolean(results[i].isPasswordProtected);
        }

        console.log('Sending room list to ' + self.app.onlineUsers[self.socket.id] + '.');
        self.socket.emit('lobby room list', { rooms : results})
    }, function(err) {
        console.error(err);
    });
};

const createRoom = function(roomInfo) {
    let self = this;

    if(roomInfo.roomPassword.trim().length < 1) {
        roomInfo.roomPassword = 'NULL'
    }

    if (roomInfo.roomName.trim().length < 1) {
        // Error, names too short.
    } else {
        sql.execute({
            query: sql.fromFile("../sql/CreateRoom"),
            params: {
                roomName: {
                    val: roomInfo.roomName
                },
                roomPassword: {
                    val: roomInfo.password
                },
                roomHostID: {
                    val: self.app.onlineUsers[self.socket.id]
                }
            }
        }).then(function (results) {
            console.log(results);
            // self.socket.authenticated = results.length > 0
            //
            // if (self.socket.authenticated) {
            //     self.app.onlineUsers[self.socket.id] = results[0].UserID;
            //     console.log(userInfo.username + " logged in.");
            //     self.socket.emit('user login success');
            // } else {
            //     self.socket.emit('user login failed', {error: 'Unable to login as ' + userInfo.username + '.'});
            // }
        }, function (err) {
            console.error(err);
        });

    }
};

module.exports = function(app, socket){
    this.app = app;
    this.socket = socket;

    this.handlers = {
        'lobby get active rooms': getActiveRooms.bind(this),
        'lobby create room': createRoom.bind(this)
    };
};