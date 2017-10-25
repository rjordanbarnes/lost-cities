<template>
    <div id ="login" class="container">
        <h1>Lost Cities</h1>
        <form id="login-form" @submit.prevent="onLogin">
            <div class="form-group">
                <label>Username</label>
                <input id="username-box" class="form-control" placeholder="Enter username" v-model="enteredUsername">
            </div>
            <button type="submit">Submit</button>
        </form>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                enteredUsername: ''
            }
        },
        methods: {
            onLogin() {
                socket.emit('user login request', this.enteredUsername);
            },
            created() {
                socket.on('user login success', () => {
                    this.$router.push('lobby');
                })
            }
        }
    }
</script>

<style>

</style>