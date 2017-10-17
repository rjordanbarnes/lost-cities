$(function() {
    const socket = io();

    //// Vue ////

    // The Login screen
    const Login = {
        template: `
            <div id ="login" class="container">
                <h1>Lost Cities</h1>
                <form id="login-form" @submit.prevent="onLogin">
                    <div class="form-group">
                        <label>Username</label>
                        <input id="username-box" class="form-control" placeholder="Enter username" v-model="enteredUsername">
                    </div>
                    <button type="submit">Submit</button>
                </form>
             </div>`,
        data() {
            return {
                enteredUsername: ''
            }
        },
        methods: {
            onLogin() {
                socket.emit('user login request', this.enteredUsername);
            }
        },
        created() {
            socket.on('user login success', () => {
                this.$router.push('lobby');
            });
        }
    };

    // The Lobby
    const Lobby = {
        template: `
            <div id="lobby" class="container">
                <div class="row">
                    <div class="col-3">
                        <button id="createRoom" type="button" data-toggle="modal" data-target="#create-room" >Create Room</button>
                    </div>
                    <div id="room-list" class="list-group col-9">
                        <room-container
                                v-for="room in rooms"
                                :key="room.roomId"
                                :room-id="room.roomId"
                                :room-name="room.roomName"
                                :room-host="room.roomHost"
                                :room-user-count="room.roomUserCount"
                                :is-password-protected="room.isPasswordProtected">
                        </room-container>
                    </div>
                </div>
                <div class="modal fade" id="create-room" tabindex="-1" role="dialog">
                    <div class="modal-dialog modal-sm" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Create Room</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <div class="form-group">
                                    <label for="create-room-name" class="form-control-label">Room Name:</label>
                                    <input type="text" class="form-control" id="create-room-name" v-model="enteredRoomName">
                                </div>
                                <div class="form-group">
                                    <label for="create-room-password" class="form-control-label">Room Password:</label>
                                    <input type="text" class="form-control" id="create-room-password" v-model="enteredRoomPassword">
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                <button type="button" id="create-room-button" class="btn btn-primary" data-dismiss="modal" @click="onCreateRoom">Create</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`,
        data() {
            return {
                rooms: [],
                enteredRoomName: '',
                enteredRoomPassword: ''
            }
        },
        methods: {
            onCreateRoom() {
                socket.emit('lobby create room', {roomName: this.enteredRoomName,
                                                  roomPassword: this.enteredRoomPassword});
            }
        },
        created() {
            socket.on('lobby active rooms', (data) => {
                this.rooms = data.rooms;
            });

            socket.emit('lobby get active rooms');
        }
    };

    // The current Room
    const Room = {
        template: `
            <div id="room" class="container" >
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
                            <button type="button" id="quit-room-button" class="btn btn-secondary" @click="onQuitRoom">Quit</button>
                            <button type="button" id="ready-room-button" class="btn btn-success ml-2" :class="readyButtonColor" @click="onReadyToggle">{{ readyButtonText }}</button>
                        </div>
                    </div>
                </div>
           </div>
        `,
        data() {
            return {
                currentRoom: {},
                isReady: false
            }
        },
        computed: {
            readyButtonText() {
                return (this.isReady ? 'Unready' : 'Ready Up');
            },
            readyButtonColor() {
                return {
                    'btn-success': !this.isReady,
                    'btn-danger' : this.isReady
                }
            }
        },
        methods: {
            onQuitRoom() {
                socket.emit('leave room');
                this.$router.push('../lobby');
            },
            onReadyToggle() {
                socket.emit('ready toggle');
                this.isReady = !this.isReady;

                let readyButton = $('#ready-room-button');
                readyButton.text();
            }
        },
        created() {
            socket.on('room update', (data) => {
                this.currentRoom = data;
            });

            socket.on('room shutdown', () => {
                this.$router.push('../lobby');
            });

            socket.emit('lobby join room', this.$route.params.roomid);
        }
    };

    // Page Not Found
    const PageNotFound = {
        template: `<h1>Page not found</h1>`
    };


    const routes = [
        {path: '/', redirect: '/lobby'},
        {path: '/login', component: Login},
        {path: '/lobby', component: Lobby},
        {path: '/room/:roomid', component: Room},
        {path: '*', component: PageNotFound}
    ];

    const router = new VueRouter({
        routes,
        mode: 'history'
    });


    Vue.component('room-container', {
        props: ['roomId', 'roomName', 'roomHost', 'roomUserCount', 'isPasswordProtected'],
        template: `
            <div class="room-container list-group-item list-group-item-action flex-column align-items-start">
               <div class="d-flex w-100 justify-content-end">
                   <div class="mr-auto">
                       <h3 class="mt-1">{{ roomName }}</h3>
                       <h5 class="mb-1">{{ roomHost }}</h5>
                   </div>

                   <h3 class="my-0 mx-4 align-self-center">{{ roomUserCount }}/2</h3>
                   <button class="join-room-button my-1 btn btn-outline-primary btn-lg" v-on:click="onJoinRoom(roomId)"><i class="fa fa-lock" v-if="isPasswordProtected"></i> Join</button>
               </div>
           </div>`,

        methods: {
            onJoinRoom(roomId){
                router.push('room/' + roomId);
            }
        }
    });

    const vm = new Vue({
        router
    }).$mount('#app');



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

    //// Socket Event Handlers ////

    socket.on('new jwt token', function(data) {
        localStorage.setItem('token', data.token);
    });

    socket.on('token request', function() {
        socket.emit('token auth request', localStorage.getItem('token'));
    });

    socket.on('server error', function (data) {
        displayAlert('danger', data.error);
    });

    socket.on('user unauthenticated', function() {
        router.push('login');
    });
});