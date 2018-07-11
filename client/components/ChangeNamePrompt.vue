<template>
    <b-modal ref="changeNamePrompt" title="Change Name" @shown="onShowChangeNamePrompt">
        <div class="form-group">
            <label class="form-control-label">New Name:</label>
            <input type="text" class="form-control" ref="newName" v-model="enteredNewName">
        </div>
        <div slot="modal-footer">
            <b-btn id="submitButton" class="float-right" variant="primary" @click="onSubmitNewName">
                Submit
            </b-btn>
            <b-btn class="float-right" variant="secondary" @click="$refs.changeNamePrompt.hide()">
                Cancel
            </b-btn>
        </div>
    </b-modal>
</template>

<script>
    export default {
        name: "ChangeNamePrompt",
        data() {
            return {
                enteredNewName: this.$store.getters.username
            }
        },
        methods: {
            onShowChangeNamePrompt() {
                this.enteredNewName = this.$store.getters.username;
                this.$refs.newName.focus()
            },
            onSubmitNewName() {
                this.$socket.emit('userChangeName', {newName: this.enteredNewName});
                this.$refs.changeNamePrompt.hide();
            },
            showPrompt() {
                this.$refs.changeNamePrompt.show();
            }
        }
    }
</script>

<style scoped>
    #submitButton {
        margin-left: .5rem;
    }
</style>
