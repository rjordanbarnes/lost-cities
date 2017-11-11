<template>
    <div class="modal fade" tabindex="-1" role="dialog">
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
                        <label for="entered-password-input" class="form-control-label">Password:</label>
                        <input type="text" class="form-control" id="entered-password-input" v-model="enteredPassword">
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
        props: ['gameId', 'isGameFull'],
        data() {
            return {
                enteredPassword: ''
            }
        },
        mounted() {
            $('#password-prompt').on('shown.bs.modal', function() {
                $('#entered-password-input').focus();
            });

            $('#entered-password-input').focus();
        },
        methods: {
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

</style>
