$(function() {

    //// Vue ////


    Vue.component('room', {
        props: ['roomId', 'roomName', 'roomHost', 'roomUserCount', 'isPasswordProtected'],
        template: `<div class="room-container list-group-item list-group-item-action flex-column align-items-start">
                       <div class="d-flex w-100 justify-content-end">
                           <div class="mr-auto">
                               <h3 class="mt-1">{{ roomName }}</h3>
                               <h5 class="mb-1">{{ roomHost }}</h5>
                           </div>
        
                           <h3 class="my-0 mx-4 align-self-center">{{ roomUserCount }}/2</h3>
                           <button class="join-button my-1 btn btn-outline-primary btn-lg"><i class="fa fa-lock" v-if="isPasswordProtected"></i> Join</button>
                       </div>
                   </div>`
    });

    let vm = new Vue({
        el: '#app',
        data: {
            rooms: [],
            currentScreen: 'login'
        }
    });


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


    //// Socket.io ////

    const socket = io();

    //// Socket Event Emitters ////

    // Sends an authenticate request.
    $('#login-form').submit(function () {
        socket.emit('user login request', {username: $('#username-box').val()});
        return false;
    });

    // Sends a request to create a new room.
    $(document).on('click', '#create-room-button', function(){
        socket.emit('lobby create room', {roomName: $('#create-room-name').val(),
                                          roomPassword: $('#create-room-password').val()});

        return false;
    });


    //// Socket Event Handlers ////

    socket.on('user login success', function () {
        socket.emit('lobby get active rooms');
        vm.currentScreen = 'lobby';
    });

    socket.on('user login failed', function (data) {
        displayAlert('danger', data.error);
    });

    socket.on('lobby room list', function(data) {
        console.log(data.rooms);
        vm.rooms = data.rooms;
    });
});