<template>
    <b-modal ref="changeNamePrompt" title="Change Name" @shown="onShowChangeNamePrompt">
        <div class="form-group">
            <label class="form-control-label">New Name:</label>
            <input type="text" class="form-control" ref="newName" v-model="enteredNewName">
        </div>
        <div slot="modal-ok" @click="onSubmitNewName">
            Submit
        </div>
    </b-modal>
</template>

<script>
    export default {
        name: "ChangeNamePrompt",
        data() {
            return {
                enteredNewName: ''
            }
        },
        methods: {
            onShowChangeNamePrompt() {
                this.$refs.newName.focus()
            },
            onSubmitNewName() {
                this.$socket.emit('userChangeName', {newName: this.enteredNewName});
                this.enteredNewName = '';
            },
            showPrompt() {
                this.$refs.changeNamePrompt.show();
            }
        }
    }
</script>

<style scoped>

</style>
