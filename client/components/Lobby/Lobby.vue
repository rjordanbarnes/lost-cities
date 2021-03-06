<template>
    <div id="lobby" class="container">
        <div class="row">
            <div class="col p-0">
                <b-btn id="create-game-button" class="btn" variant="success" v-show="$store.getters.authenticated" @click="$refs.createGamePrompt.show()">Create Game</b-btn>
                <div id="game-list" class="list-group" v-if="games.length > 0">
                    <game-list-item
                        v-for="game in games"
                        :key="game.gameSK"
                        :game-s-k="game.gameSK"
                        :game-name="game.gameName"
                        :game-host="game.gameHost"
                        :game-player-count="game.gamePlayerCount"
                        :is-password-protected="game.isPasswordProtected" />
                </div>
                <div id="no-active-games" class="display-4 text-muted" v-else>No Active Games</div>
            </div>

            <div class="col-4">
                <online-players id="lobby-online-players" :online-players="onlinePlayers" />
                <chat-box id="lobby-chat" class="mt-2" />
            </div>

        </div>

        <b-modal ref="createGamePrompt" id="create-game-prompt" title="Create Game" @shown="onShowCreateGameWindow">
            <div class="form-group">
                <label class="form-control-label">Game Name:</label>
                <input type="text" class="form-control" ref="createGameName" v-model="enteredGameName" @keyup.enter="onCreateGame">
            </div>
            <div class="form-group">
                <label for="create-game-password" class="form-control-label">Game Password:</label>
                <input type="text" class="form-control" id="create-game-password" v-model="enteredGamePassword" @keyup.enter="onCreateGame">
            </div>
            <div slot="modal-footer">
                <b-btn id="submitButton" class="float-right" variant="primary" @click="onCreateGame">
                    Create
                </b-btn>
                <b-btn class="float-right" variant="secondary" @click="$refs.createGamePrompt.hide()">
                    Cancel
                </b-btn>
            </div>
        </b-modal>
    </div>
</template>

<script>
    import GameListItem from '@/components/Lobby/GameListItem'
    import ChatBox from '@/components/ChatBox'
    import OnlinePlayers from "@/components/Lobby/OnlinePlayers";

    export default {
        name: "Lobby",
        data() {
            return {
                onlinePlayers: [],
                games: [],
                enteredGameName: '',
                enteredGamePassword: ''
            }
        },
        mounted() {
            if (this.games.length === 0) {
                this.$socket.emit('lobbyRefresh');
            }
        },
        sockets: {
            lobbyRefresh(data) {
                this.games = data.games;
                this.onlinePlayers = data.onlinePlayers;
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
            OnlinePlayers,
            GameListItem,
            ChatBox
        }
    }
</script>

<style scoped>
    #lobby-chat {
        height: 50vh;
    }
    #create-game-button {
        margin-top: 10px;
    }
    #no-active-games {
        padding-left: 0;
        height: 546px;
        line-height: 546px;
        text-align: center;
        font-size: 2rem;
    }
    #submitButton {
        margin-left: .5rem;
    }
</style>
