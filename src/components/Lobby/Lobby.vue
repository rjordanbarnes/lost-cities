<template>
    <div id="lobby" class="container">
        <div class="row">
            <div class="col-3">
                <button id="create-game-button" class="btn btn-block btn-success" type="button" data-toggle="modal" data-target="#create-game-prompt">Create Game
                </button>
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
        <game-password-prompt id="join-game-password-prompt"></game-password-prompt>
        <div class="modal fade" id="create-game-prompt" role="dialog">
            <div class="modal-dialog modal-sm" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Create Game</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="create-game-name" class="form-control-label">Game Name:</label>
                            <input type="text" class="form-control" id="create-game-name" v-model="enteredGameName">
                        </div>
                        <div class="form-group">
                            <label for="create-game-password" class="form-control-label">Game Password:</label>
                            <input type="text" class="form-control" id="create-game-password"
                                   v-model="enteredGamePassword">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" data-dismiss="modal" @click="onCreateGame">Create</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import GameListItem from '@/components/Lobby/GameListItem'
    import ChatBox from '@/components/ChatBox'
    import GamePasswordPrompt from '@/components/Lobby/GamePasswordPrompt'

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

            $('#create-game-prompt').on('shown.bs.modal', function() {
                $('#create-game-name').focus();
            });
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
            onCreateGame() {
                this.$socket.emit('gameCreate',
                    {gameName: this.enteredGameName,
                        gamePassword: this.enteredGamePassword});
            }
        },
        components: {
            GameListItem,
            ChatBox,
            GamePasswordPrompt
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
