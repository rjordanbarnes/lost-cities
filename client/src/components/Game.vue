<template>
    <div>
        <div v-if="loading">Loading</div>
        <game-lobby :game-details="gameDetails" v-if="gameDetails.gameState === 'Lobby'"></game-lobby>
        <gameplay :game-details="gameDetails" :player="player" :opponent="opponent" v-if="gameDetails.gameState === 'Gameplay'"></gameplay>
    </div>
</template>

<script>
    import { GameplayEventBus } from '../events/GameplayEventBus.js'
    import GameLobby from '@/components/Lobby/GameLobby'
    import Gameplay from '@/components/Gameplay/Gameplay'

    export default {
        name: "Game",
        data() {
            return {
                loading: true,
                gameDetails: {}
            }
        },
        computed: {
            // Returns 0 if the user is a spectator.
            playerIndex() {
                const index = this.gameDetails.players.findIndex(item => item.accountSK === this.$store.getters.accountSK);
                return (index === -1) ? 0 : index;
            },
            player() {
                return this.gameDetails.players[this.playerIndex];
            },
            // Opponent is opposite user than player
            opponent() {
                return this.gameDetails.players[1 - this.playerIndex];
            }
        },
        created() {
            // Get the game's details after we make sure the token state is correct. If we don't wait, then the
            // token response from the server might come in after we've loaded the page.
            this.$store.watch(
                (state) => {
                    return this.$store.getters.tokenResponseReceived
                },
                (value) => {
                    this.$socket.emit('gameSpectate', {gameSK: this.$route.params.gameSK});
                },
                {
                    deep: true
                }
            );
        },
        sockets: {
            gameUpdate(data) {
                if (data.errors) {
                    this.error = data.errors;
                } else {
                    console.log(data);
                    this.gameDetails = data;
                }

                if (this.loading) {
                    this.loading = false;
                }
            },
            gameShutdown() {
                this.$router.push('../lobby');
            },
            gameSpectate(data) {
                if (data.errors && data.errors.includes('Unable to spectate the game, password not supplied.')) {
                    $('#password-prompt').modal('show');
                }
            },
            gameEnd(data) {
                alert(data.winner + " won!");
            }
        },
        components: {
            GameLobby,
            Gameplay
        }
    }
</script>

<style scoped>

</style>
