<template>
    <div class="list-group-item list-group-item-action flex-column align-items-start">
        <div class="d-flex w-100 justify-content-end">
            <div class="mr-auto">
                <h3 class="mt-1">{{ gameName }}</h3>
                <h5 class="mb-1">{{ gameHost }}</h5>
            </div>

            <h3 class="my-0 mx-4 align-self-center">{{ gamePlayerCount }}/2</h3>
            <button class="open-game-button my-1 btn btn-lg" :class="openGameButtonColor" v-on:click="onOpenGame(gameId)"><i class="fa fa-lock" v-if="isPasswordProtected"></i> {{ openGameButtonText }}</button>
        </div>
        <div class="modal fade" id="password-prompt" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-sm" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Enter Password</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="create-game-name" class="form-control-label">Password:</label>
                            <input type="text" class="form-control" id="create-game-name" v-model="enteredPassword">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" data-dismiss="modal" @click="onSubmitPassword">Submit</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['gameId', 'gameName', 'gameHost', 'gamePlayerCount', 'isPasswordProtected'],
        data() {
            return {
                enteredPassword: ''
            }
        },
        computed: {
            isGameFull() {
                return this.gamePlayerCount >= 2;
            },
            openGameButtonText() {
                return (this.isGameFull ? 'View' : 'Join');
            },
            openGameButtonColor() {
                return (this.isGameFull ? 'btn-outline-info' : 'btn-outline-primary');
            }
        },
        methods: {
            onOpenGame(gameId){
                if (this.isPasswordProtected) {
                    $('#password-prompt').modal('show');
                } else {
                    this.$router.push('game/' + gameId);
                }
            },
            onSubmitPassword() {
                if (this.isGameFull) {
                    this.$socket.emit('gameSpectate', {gameId: this.gameId, password: this.enteredPassword});
                } else {
                    this.$socket.emit('gameJoin', {gameId: this.gameId, password: this.enteredPassword});
                }

                this.enteredPassword = '';
            }
        }

    }
</script>

<style scoped>
    .list-group-item {
        margin: 10px 0;
    }

    .open-game-button {
        width: 90px;
    }
</style>
