<template>
    <div id="room" class="container">
        <div v-if="loading">Loading</div>
        <div v-if="error">Error</div>
        <div v-if="currentRoom">
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
                        <button type="button" id="spectate-room-button" class="btn btn-secondary ml-2" @click="onSpectateRoom" v-if="userIsPlayer">Spectate</button>
                        <button type="button" id="ready-room-button" class="btn btn-success ml-2" :class="readyButtonColor" @click="onReadyToggle" v-if="userIsPlayer">{{ readyButtonText }}</button>
                    </div>
                    <div>Spectators: {{ currentRoom.spectators.length }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                loading: true,
                error: null,
                currentRoom: null,
                isReady: false
            }
        },
        created() {
            // Get the room's details after we make sure the token state is correct. If we don't wait, then the
            // token response from the server might come in after we've loaded the page.
            if (this.$store.getters.tokenResponseReceived) {
                this.getRoomDetails();
            } else {
                this.$store.watch(
                    (state) => {
                        return this.$store.getters.tokenResponseReceived
                    },
                    (value) => {
                        this.getRoomDetails();
                    },
                    {
                        deep: true
                    }
                );
            }
        },
        computed: {
            userIsPlayer() {
                return this.currentRoom.players.filter(player => (player.userId === this.$store.getters.userId)).length > 0;
            },
            userIsSpectator() {
                return this.currentRoom.spectators.filter(spectator => (spectator.userId === this.$store.getters.userId)).length > 0;
            },
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
                if (data.errors) {
                    this.error = data.errors;
                } else {
                    this.currentRoom = data;
                }

                if (this.loading) {
                    this.loading = false;

                    if (this.currentRoom.players.length < 2 && this.$store.getters.authenticated) {
                        this.$socket.emit('roomJoin', this.$route.params.roomid);
                    } else {
                        this.$socket.emit('roomSpectate', this.$route.params.roomid);
                    }
                }

            },
            roomShutdown() {
                this.$router.push('../lobby');
            }
        },
        methods: {
            getRoomDetails() {
                this.$socket.emit('roomGetDetails', this.$route.params.roomid);
            },
            onQuitRoom() {
                this.$socket.emit('roomLeave');
                this.$router.push('../lobby');
            },
            onReadyToggle() {
                this.$socket.emit('roomToggleReady');
                this.isReady = !this.isReady;
            },
            onSpectateRoom() {
                this.$socket.emit('roomSpectate', this.$route.params.roomid);
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
