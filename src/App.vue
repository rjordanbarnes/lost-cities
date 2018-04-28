<template>
    <div id="app">
        <router-link to="/login">Login</router-link>
        <router-view/>

        <b-alert :show="dismissCountdown"
                 dismissible
                 variant="danger"
                 @dismissed="dismissCountdown=0"
                 @dismiss-countdown="countdownChanged">
            {{ message }}
        </b-alert>
    </div>
</template>

<script>
    import Alert from '@/components/Alert'
    import jwt_decode from 'jwt-decode'

    export default {
        name: 'app',
        data() {
            return {
                message: '',
                dismissSecs: 3,
                dismissCountdown: 0
            }
        },
        methods: {
            countdownChanged (dismissCountdown) {
                this.dismissCountdown = dismissCountdown;
            },
            showAlert () {
                this.dismissCountdown = this.dismissSecs;
            }
        },
        sockets: {
            userRequestToken() {
                this.$socket.emit('userVerifyToken', localStorage.getItem('token'));
            },
            userToken(data) {
                if (data.errors) {
                    console.log(data.errors);
                } else {
                    this.$store.commit('authenticated', true);
                    this.$store.commit('accountSK', jwt_decode(data.token).accountSK);
                    localStorage.setItem('token', data.token);
                }
                this.$store.commit('tokenResponseReceived', true);
            },
            generalError(data) {
                this.message = data.error;
                this.showAlert();
            }
        },
        components: {
            Alert
        }
    }
</script>

<style>
    :root {
        --score-pile-blue: #B0C0CF;
        --score-pile-green: #A4F0DC ;
        --score-pile-red: #F9C1CF ;
        --score-pile-white: #FBF9FB;
        --score-pile-yellow: #FFEEC7 ;

        --card-blue: #26547C;
        --card-green: #06D6A0;
        --card-red: #F0577C;
        --card-white: #F5F0F6;
        --card-yellow: #FFD166 ;
    }

    body {
        /*background-color: #000B14;*/
    }

    .alert {
        position: fixed;
        bottom: 0;
        width:100%;
    }

    [v-cloak] {
        display: none;
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s
    }
    .fade-enter, .fade-leave-to {
        opacity: 0
    }
</style>
