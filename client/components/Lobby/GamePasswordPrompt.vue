<template>
    <b-modal ref="gamePasswordPrompt" title="Enter Password" @shown="onShowGamePasswordPrompt">
        <div class="form-group">
            <label class="form-control-label">Password:</label>
            <input type="text" class="form-control" ref="joinGamePassword" v-model="enteredPassword">
        </div>
        <div slot="modal-footer">
            <b-btn id="submitButton" class="float-right" variant="primary" @click="onSubmitPassword">
                Submit
            </b-btn>
            <b-btn class="float-right" variant="secondary" @click="$refs.gamePasswordPrompt.hide()">
                Cancel
            </b-btn>
        </div>
    </b-modal>
</template>

<script>
    export default {
        name: "GamePasswordPrompt",
        props: ['gameSK', 'isGameFull'],
        data() {
            return {
                enteredPassword: ''
            }
        },
        methods: {
            onShowGamePasswordPrompt() {
                this.$refs.joinGamePassword.focus()
            },
            onSubmitPassword() {
                if (this.isGameFull) {
                    this.$socket.emit('gameSpectate', {gameSK: this.gameSK, password: this.enteredPassword});
                } else {
                    this.$socket.emit('gameJoin', {gameSK: this.gameSK, password: this.enteredPassword});
                }

                this.enteredPassword = '';
            },
            showPrompt() {
                this.$refs.gamePasswordPrompt.show();
            }
        }
    }
</script>

<style scoped>
    #submitButton {
        margin-left: .5rem;
    }
</style>
