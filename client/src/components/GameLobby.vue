<template>
    <div id="game" class="container">
        <div v-if="loading">Loading</div>
        <div v-if="error">Error</div>
        <div v-if="currentGame">
            <h1 class="text-center my-4">{{ currentGame.gameName }}</h1>
            <div class="row">
                <div class="col-4">
                    <chat-box></chat-box>
                </div>
                <div class="col-8">
                    <ul class="game-player-list list-group">
                        <li class="list-group-item" v-if="currentGame.players.length <= 0">
                            <h2 class="text-muted d-flex justify-content-between">Empty <button type="button" class="btn btn-primary float-right" @click="onFillSlot">Fill Slot</button></h2>
                        </li>
                        <li class="list-group-item" v-bind:class="{ 'list-group-item-success': currentGame.players[0].isReady }"  v-else>
                            <h2 class="d-flex justify-content-between">{{ currentGame.players[0].username }}<span v-if="currentGame.players[0].isReady">Ready</span></h2>
                        </li>

                        <li class="list-group-item" v-if="currentGame.players.length <= 1">
                            <h2 class="text-muted d-flex justify-content-between">Empty <button type="button" class="btn btn-primary" @click="onFillSlot" v-if="currentGame.players.length > 0 && userIsSpectator">Fill Slot</button></h2>
                        </li>
                        <li class="list-group-item" v-bind:class="{ 'list-group-item-success': currentGame.players[1].isReady }" v-else>
                            <h2 class="d-flex justify-content-between">{{ currentGame.players[1].username }}<span v-if="currentGame.players[1].isReady">Ready</span></h2>
                        </li>
                    </ul>
                    <div class="d-flex justify-content-end mt-4">
                        <button type="button" id="quit-game-button" class="btn btn-secondary" @click="onQuitGame">Quit</button>
                        <button type="button" id="spectate-game-button" class="btn btn-secondary ml-2" @click="onSpectateGame" v-if="userIsPlayer">Spectate</button>
                        <button type="button" id="ready-game-button" class="btn btn-success ml-2" :class="readyButtonColor" @click="onReadyToggle" v-if="userIsPlayer">{{ readyButtonText }}</button>
                    </div>
                    <div>Spectators: {{ currentGame.spectators.length }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import ChatBox from '@/components/ChatBox'

    export default {
        data() {
            return {
                loading: true,
                error: null,
                currentGame: null,
                isReady: false
            }
        },
        created() {
            // Get the game's details after we make sure the token state is correct. If we don't wait, then the
            // token response from the server might come in after we've loaded the page.
            if (this.$store.getters.tokenResponseReceived) {
                this.getGameDetails();
            } else {
                this.$store.watch(
                    (state) => {
                        return this.$store.getters.tokenResponseReceived
                    },
                    (value) => {
                        this.getGameDetails();
                    },
                    {
                        deep: true
                    }
                );
            }
        },
        computed: {
            userIsPlayer() {
                return this.currentGame.players.filter(player => (player.userId === this.$store.getters.userId)).length > 0;
            },
            userIsSpectator() {
                return this.currentGame.spectators.filter(spectator => (spectator.userId === this.$store.getters.userId)).length > 0;
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
            gameUpdate(data) {
                if (data.errors) {
                    this.error = data.errors;
                } else {
                    this.currentGame = data;
                }

                if (this.loading) {
                    this.loading = false;

                    if (this.currentGame.players.length < 2 && this.$store.getters.authenticated) {
                        this.$socket.emit('gameJoin', this.$route.params.gameid);
                    } else {
                        this.$socket.emit('gameSpectate', this.$route.params.gameid);
                    }
                }

            },
            gameShutdown() {
                this.$router.push('../lobby');
            }
        },
        methods: {
            getGameDetails() {
                this.$socket.emit('gameGetDetails', this.$route.params.gameid);
            },
            onQuitGame() {
                this.$socket.emit('gameLeave');
                this.$router.push('../lobby');
            },
            onReadyToggle() {
                this.$socket.emit('gameToggleReady');
                this.isReady = !this.isReady;
            },
            onSpectateGame() {
                this.$socket.emit('gameSpectate', this.$route.params.gameid);
            },
            onFillSlot() {
                this.$socket.emit('gameJoin', this.$route.params.gameid);
            }
        },
        components: {
            ChatBox
        }
    }
</script>

<style scoped>
    #ready-game-button {
        width: 95px;
    }
    #game {
        max-width: 790px;
    }
    #chat-box {
        height: 250px;
    }
</style>
