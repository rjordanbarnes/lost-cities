<template>
    <div>
        <div v-if="loading">Loading</div>
        <game-lobby :game-details="gameDetails"></game-lobby>
        <game-password-prompt :game-id="this.$route.params.gameid" :is-game-full="true" id="password-prompt"></game-password-prompt>
    </div>
</template>

<script>
    import GameLobby from '@/components/GameLobby'
    import GamePasswordPrompt from '@/components/GamePasswordPrompt'

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
                    this.$socket.emit('gameSpectate', {gameId: this.$route.params.gameid});
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
                if (data.errors.includes('Unable to spectate the game, password not supplied.')) {
                    $('#password-prompt').modal('show');
                }
            }
        },
        components: {
            GameLobby,
            GamePasswordPrompt
        }
    }
</script>

<style scoped>

</style>
