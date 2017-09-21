$(function() {
    const socket = io();

    // Displays an alert with the given style and message.
    function displayAlert(style, msg) {
        const alert = $('#alert');
        alert.addClass('alert-' + style);
        alert.text(msg);

        if (parseInt(alert.css('opacity')) === 0) {
            alert.css('opacity', 1);
            setTimeout(function() {
                alert.css('opacity', 0);
            }, 2000);
        }
    }

    $('#createRoom').click(function() {
        socket.emit('room create');
    });

    // Sends an authenticate request to server.
    $('#loginForm').submit(function () {
        socket.emit('login request', {username: $('#usernameBox').val()});
        return false;
    });



    //// Socket Event Handlers ////

    socket.on('login success', function () {
        socket.emit('get active rooms');
        $('#loginScreen').text('Authenticated!');
        // $('#loginScreen').hide(function() {
        //     for (let roomName in rooms) {
        //         if (rooms.hasOwnProperty(roomName)) {
        //             $('#roomList').append(`<a href="#" class="list-group-item list-group-item-action flex-column align-items-start active">
        //                                 <div class="d-flex w-100 justify-content-between">
        //                                     <h5 class="mb-1">${ roomName }</h5>
        //                                     <small>3 days ago</small>
        //                                 </div>
        //                                 <p class="mb-1">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
        //                                 <small>Donec id elit non mi porta.</small>
        //                             </a>`);
        //         }
        //     }
        //
        //     $('#lobby').show();
        // });
    });

    socket.on('login failed', function (data) {
        displayAlert('danger', data.error);
    });

    socket.on('room join granted', function (roomName) {
        displayAlert('success', 'Joined ' + roomName);
    });

    socket.on('room join denied', function (roomName) {
        displayAlert('danger', 'Can\'t join ' + roomName);
    });
});