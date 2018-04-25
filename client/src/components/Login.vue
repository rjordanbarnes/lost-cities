<template>
    <div id="login" class="container">
        <h1>Lost Cities</h1>
        <a id="signin-button" v-on:click="onLogin">
            <i class="fa fa-google-plus-official fa-3x"></i>
            Sign in with Google
        </a>

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
    import Vue from 'vue'

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
                Vue.googleAuth().signIn(this.onLoginSuccess, this.onLoginError);
            },
            onLoginSuccess: function (authorizationCode) {
                this.$socket.emit('userGoogleLoginSuccess', authorizationCode);
            },
            onLoginError: function (error) {
                console.log('GOOGLE SERVER - SIGN-IN ERROR', error)
            },
        }
    }
</script>

<style scoped>
    #login {
        margin-top: 200px;
    }
</style>
