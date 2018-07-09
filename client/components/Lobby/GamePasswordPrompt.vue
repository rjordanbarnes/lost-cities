<template>
    <b-modal ref="gamePasswordPrompt" title="Enter Password" @shown="onShowGamePasswordPrompt">
        <div class="form-group">
            <label class="form-control-label">Password:</label>
            <input type="text" class="form-control" ref="joinGamePassword" v-model="enteredPassword">
        </div>
        <div slot="modal-ok" @click="onSubmitPassword">
            Submit
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

</style>
