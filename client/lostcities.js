$(function() {
    const socket = io();

    //// Vue ////


    Vue.component('room-container', {
        props: ['roomId', 'roomName', 'roomHost', 'roomUserCount', 'isPasswordProtected'],
        template: `<div class="room-container list-group-item list-group-item-action flex-column align-items-start">
                       <div class="d-flex w-100 justify-content-end">
                           <div class="mr-auto">
                               <h3 class="mt-1">{{ roomName }}</h3>
                               <h5 class="mb-1">{{ roomHost }}</h5>
                           </div>
        
                           <h3 class="my-0 mx-4 align-self-center">{{ roomUserCount }}/2</h3>
                           <button class="join-room-button my-1 btn btn-outline-primary btn-lg" v-on:click="joinRoom(roomId)"><i class="fa fa-lock" v-if="isPasswordProtected"></i> Join</button>
                       </div>
                   </div>`,
        methods: {
            joinRoom: function(roomId){
                socket.emit('lobby join room', {roomId: roomId});
            }
        }
    });

    Vue.component('room', {
        props: ['currentRoom'],
        template: `<div>
                        <h1 class="text-center my-4">{{ currentRoom.roomName }}</h1>
                        <div class="row">
                            <div id="room-chat" class="col-4">
                                Chat Box Here
                            </div>
                            <div class="col-8">
                                <ul class="room-player-list list-group">
                                    <li class="list-group-item" v-bind:class="{ 'list-group-item-success': currentRoom.players[0].isReady }">
                                        <h2 class="d-flex justify-content-between">{{ currentRoom.players[0].username }}<span v-if="currentRoom.players[0].isReady">Ready</span></h2>
                                    </li>
                                    
                                    <li class="list-group-item" v-if="currentRoom.players.length <= 1">
                                        <h2 class="text-muted">Empty</h2>
                                    </li>
                                    <li class="list-group-item" v-bind:class="{ 'list-group-item-success': currentRoom.players[1].isReady }" v-else>
                                        <h2 class="d-flex justify-content-between">{{ currentRoom.players[1].username }}<span v-if="currentRoom.players[1].isReady">Ready</span></h2>
                                    </li>
                                </ul>
                                <div class="d-flex justify-content-end mt-4">
                                    <button type="button" id="quit-room-button" class="btn btn-secondary">Quit</button>
                                    <button type="button" id="ready-room-button" class="btn btn-success ml-2">Ready Up</button>
                                </div>
                            </div>
                        </div>
                   </div>`
    });

    let vm = new Vue({
        el: '#app',
        data: {
            rooms: [],
            currentScreen: 'login',
            currentRoom:{}
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

    // Leaves the current room.
    $(document).on('click', '#quit-room-button', function(){
        socket.emit('leave room');
        vm.currentRoom = {};
        vm.currentScreen = 'lobby';

        return false;
    });

    // Used to toggle the user's ready status.
    $(document).on('click', '#ready-room-button', function(){
        socket.emit('ready toggle');

        // Set the proper text for the Ready Button
        let readyButton = $('#ready-room-button');
        readyButton.text((readyButton.text() === 'Ready Up' ? 'Unready' : 'Ready Up'));
        readyButton.toggleClass('btn-success btn-danger');

        return false;
    });


    //// Socket Event Handlers ////

    socket.on('user login success', function () {
        socket.emit('lobby get active rooms');
        vm.currentScreen = 'lobby';
    });

    socket.on('server error', function (data) {
        displayAlert('danger', data.error);
    });

    socket.on('lobby active rooms', function(data) {
        vm.rooms = data.rooms;
    });

    socket.on('room update', function(data) {
        vm.currentRoom = data;
        vm.currentScreen = 'room';
    });

    socket.on('room shutdown', function() {
        vm.currentRoom = {};
        vm.currentScreen = 'lobby';
    });
});