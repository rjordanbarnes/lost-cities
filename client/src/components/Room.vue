<template>
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
                <div>Spectators: {{ currentRoom.spectators.length }}</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                currentRoom: {players: [{isHost: true, isReady: false, username: ""}, {isHost: false, isReady: false, username: ""}],
                              spectators: []},
                isReady: false
            }
        },
        created() {
            // TODO: Check to make sure user isn't already joining room as a player
            this.$socket.emit('roomSpectate', this.$route.params.roomid);
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
        sockets: {
            roomUpdate(data) {
                this.currentRoom = data;
            },
            roomShutdown() {
                this.$router.push('../lobby');
            }
        },
        methods: {
            onQuitRoom() {
                this.$socket.emit('roomLeave');
                this.$router.push('../lobby');
            },
            onReadyToggle() {
                this.$socket.emit('roomToggleReady');
                this.isReady = !this.isReady;
            }
        }
    }
</script>

<style scoped>
    #ready-room-button {
        width: 95px;
    }

    #room {
        max-width: 790px;
    }

    #room-chat {
        border-style: solid;
    }
</style>
