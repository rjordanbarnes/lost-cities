<template>
    <div>
        <div v-if="loading">Loading</div>
        <game-lobby :game-details="gameDetails" v-if="gameDetails.gameState === 'Lobby'"></game-lobby>
        <gameplay :game-details="gameDetails" v-if="gameDetails.gameState === 'Gameplay'"></gameplay>
    </div>
</template>

<script>
    import GameLobby from '@/components/GameLobby'
    import Gameplay from '@/components/Gameplay'

    export default {
        data() {
            return {
                loading: true,
                gameDetails: null
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
