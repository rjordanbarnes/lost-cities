<template>
    <div id="game-lobby" class="container">
        <div v-if="error">Error</div>
        <div v-if="gameDetails">
            <h1 class="text-center my-4">{{ gameDetails.gameName }}</h1>
            <div class="row">
                <div class="col-4">
                    <chat-box></chat-box>
                </div>
                <div class="col-8">
                    <ul class="game-player-list list-group">
                        <li class="list-group-item" v-if="gameDetails.players.length <= 0">
                            <h2 class="text-muted d-flex justify-content-between">Empty <button type="button" class="btn btn-primary float-right" @click="onFillSlot">Fill Slot</button></h2>
                        </li>
                        <li class="list-group-item" v-bind:class="{ 'list-group-item-success': gameDetails.players[0].isReady }"  v-else>
                            <h2 class="d-flex justify-content-between">{{ gameDetails.players[0].username }}<span v-if="gameDetails.players[0].isReady">Ready</span></h2>
                        </li>

                        <li class="list-group-item" v-if="gameDetails.players.length <= 1">
                            <h2 class="text-muted d-flex justify-content-between">Empty <button type="button" class="btn btn-primary" @click="onFillSlot" v-if="gameDetails.players.length > 0 && userIsSpectator">Fill Slot</button></h2>
                        </li>
                        <li class="list-group-item" v-bind:class="{ 'list-group-item-success': gameDetails.players[1].isReady }" v-else>
                            <h2 class="d-flex justify-content-between">{{ gameDetails.players[1].username }}<span v-if="gameDetails.players[1].isReady">Ready</span></h2>
                        </li>
                    </ul>
                    <div class="d-flex justify-content-end mt-4">
                        <button type="button" id="quit-game-button" class="btn btn-secondary" @click="onQuitGame">Quit</button>
                        <button type="button" id="spectate-game-button" class="btn btn-secondary ml-2" @click="onSpectateGame" v-if="userIsPlayer">Spectate</button>
                        <button type="button" id="ready-game-button" class="btn btn-success ml-2" :class="readyButtonColor" @click="onReadyToggle" v-if="userIsPlayer">{{ readyButtonText }}</button>
                        <button type="button" id="start-game-button" class="btn btn-success ml-2" @click="onStartGame" v-if="startActive">Start Game</button>
                    </div>
                    <div>Spectators: {{ gameDetails.spectators.length }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import ChatBox from '@/components/ChatBox'

    export default {
        name: "GameLobby",
        props: ['gameDetails'],
        data() {
            return {
                error: null
            }
        },
        computed: {
            userIsPlayer() {
                return this.gameDetails.players.filter(player => (player.accountSK === this.$store.getters.accountSK)).length > 0;
            },
            userIsSpectator() {
                return this.gameDetails.spectators.filter(spectator => (spectator.accountSK === this.$store.getters.accountSK)).length > 0;
            },
            userIsHost() {
                if (this.userIsPlayer)
                    return this.gameDetails.players.filter(player => (player.accountSK === this.$store.getters.accountSK))[0].isHost === 1;
                else
                    return false
            },
            userIsReady() {
                if (this.userIsPlayer)
                    return this.gameDetails.players.filter(player => (player.accountSK === this.$store.getters.accountSK))[0].isReady;
                else
                    return false
            },
            readyButtonText() {
                return (this.userIsReady ? 'Unready' : 'Ready Up');
            },
            readyButtonColor() {
                return {
                    'btn-success': !this.userIsReady,
                    'btn-danger' : this.userIsReady
                }
            },
            startActive() {
                if (this.gameDetails.players.length === 2) {
                    return this.userIsHost && this.gameDetails.players[0].isReady && this.gameDetails.players[1].isReady
                }
                return false;
            }
        },
        methods: {
            onQuitGame() {
                this.$router.push('../lobby');
            },
            onReadyToggle() {
                this.$socket.emit('gameToggleReady');
            },
            onSpectateGame() {
                this.$socket.emit('gameSpectate', {gameSK: this.$route.params.gameSK});
            },
            onFillSlot() {
                this.$socket.emit('gameJoin', {gameSK: this.$route.params.gameSK});
            },
            onStartGame() {
                this.$socket.emit('gameStart');
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
    #game-lobby {
        max-width: 790px;
    }
    #chat-box {
        height: 250px;
    }
</style>
