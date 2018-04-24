<template>
    <div id="login" class="container">
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
        name: "Login",
        data() {
            return {
                enteredUsername: ''
            }
        },
        sockets: {
            userLoginSuccess() {
                this.$router.push('lobby');
            }
        },
        methods: {
            onLogin() {
                this.$socket.emit('userRequestLogin', this.enteredUsername);
            }
        }
    }
</script>

<style scoped>
    #login {
        margin-top: 200px;
    }
</style>
