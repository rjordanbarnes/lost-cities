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
        props: ['gameDetails'],
        data() {
            return {
                error: null,
                isReady: false
            }
        },
        computed: {
            userIsPlayer() {
                return this.gameDetails.players.filter(player => (player.userId === this.$store.getters.userId)).length > 0;
            },
            userIsSpectator() {
                return this.gameDetails.spectators.filter(spectator => (spectator.userId === this.$store.getters.userId)).length > 0;
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
        methods: {
            onQuitGame() {
                this.$socket.emit('gameLeave');
                this.$router.push('../lobby');
            },
            onReadyToggle() {
                this.$socket.emit('gameToggleReady');
                this.isReady = !this.isReady;
            },
            onSpectateGame() {
                this.$socket.emit('gameSpectate', {gameId: this.$route.params.gameid});
            },
            onFillSlot() {
                this.$socket.emit('gameJoin', {gameId: this.$route.params.gameid});
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
