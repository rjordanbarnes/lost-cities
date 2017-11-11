<template>
    <div>
        <div v-if="loading">Loading</div>
        <game-lobby :game-details="gameDetails"></game-lobby>
    </div>
</template>

<script>
    import GameLobby from '@/components/GameLobby'

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
            }
        },
        methods: {
            getGameDetails() {
                this.$socket.emit('gameGetDetails', this.$route.params.gameid);
            },
        },
        components: {
            GameLobby
        }
    }
</script>

<style scoped>

</style>
