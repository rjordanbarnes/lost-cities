<template>
    <div class="modal fade" role="dialog">
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
                        <label for="join-password-room-input" class="form-control-label">Password:</label>
                        <input type="text" class="form-control" v-model="enteredPassword" id="join-password-room-input">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" data-dismiss="modal" @click="onSubmitPassword">Submit</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "GamePasswordPrompt",
        data() {
            return {
                enteredPassword: '',
                gameSK : '',
                isGameFull: false
            }
        },
        mounted() {
            this.$root.$on('join-password-room', data => {
                this.gameSK = data.gameSK;
                this.isGameFull = data.isGameFull;
                $('#join-game-password-prompt').modal('show');
            });

            $('#join-game-password-prompt').on('shown.bs.modal', function() {
                $('#join-password-room-input').focus();
            });
        },
        methods: {
            onSubmitPassword() {
                if (this.isGameFull) {
                    this.$socket.emit('gameSpectate', {gameSK: this.gameSK, password: this.enteredPassword});
                } else {
                    this.$socket.emit('gameJoin', {gameSK: this.gameSK, password: this.enteredPassword});
                }

                this.enteredPassword = '';
            }
        }
    }
</script>

<style scoped>

</style>
