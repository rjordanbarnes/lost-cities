<template>
    <div id="lobby" class="container">
        <div class="row">
            <div class="col-3">
                <b-btn class="btn-block" variant="success" v-b-modal.create-game-prompt>Create Game</b-btn>
                <chat-box class="mt-2"></chat-box>
            </div>
            <div id="game-list" class="list-group col-9">
                <game-list-item
                    v-for="game in games"
                    :key="game.gameSK"
                    :game-s-k="game.gameSK"
                    :game-name="game.gameName"
                    :game-host="game.gameHost"
                    :game-player-count="game.gamePlayerCount"
                    :is-password-protected="game.isPasswordProtected" />
            </div>
        </div>

        <b-modal id="create-game-prompt" title="Create Game" @shown="onShowCreateGameWindow">
            <div class="form-group">
                <label class="form-control-label">Game Name:</label>
                <input type="text" class="form-control" ref="createGameName" v-model="enteredGameName">
            </div>
            <div class="form-group">
                <label for="create-game-password" class="form-control-label">Game Password:</label>
                <input type="text" class="form-control" id="create-game-password"
                       v-model="enteredGamePassword">
            </div>
            <div slot="modal-ok" @click="onCreateGame">
                Create
            </div>
        </b-modal>
    </div>
</template>

<script>
    import GameListItem from '@/components/Lobby/GameListItem'
    import ChatBox from '@/components/ChatBox'

    export default {
        name: "Lobby",
        data() {
            return {
                games: [],
                enteredGameName: '',
                enteredGamePassword: ''
            }
        },
        mounted() {
            if (this.games.length === 0) {
                this.$socket.emit('lobbyGetGames');
            }
        },
        sockets: {
            lobbyGameList(data) {
                this.games = data.games;
            },
            gameCreate(data) {
                if (data.errors) {
                    console.log(data.errors);
                } else {
                    this.$router.push('game/' + data.gameSK);
                }
            },
            gameJoin(data) {
                if (data.errors) {
                    console.log(data.errors);
                } else {
                    this.$router.push('game/' + data.gameSK);
                }
            },
            gameSpectate(data) {
                if (data.errors) {
                    console.log(data.errors);
                } else {
                    this.$router.push('game/' + data.gameSK);
                }
            }
        },
        methods: {
            onShowCreateGameWindow() {
                this.$refs.createGameName.focus()
            },
            onCreateGame() {
                this.$socket.emit('gameCreate',
                    {gameName: this.enteredGameName,
                        gamePassword: this.enteredGamePassword});
            }
        },
        components: {
            GameListItem,
            ChatBox
        }
    }
</script>

<style scoped>
    #chat-box {
        height: 500px;
    }
    #create-game-button {
        margin-top: 10px
    }
</style>
