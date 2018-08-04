<template>
    <div id="app" class="container-fluid p-0">
        <NavBar/>
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
    import NavBar from '@/components/NavBar'
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
                    this.$store.commit('accountSK', data.accountSK);
                    this.$store.commit('username', data.username);
                    this.$store.commit('avatarURL', data.avatarURL);
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
            NavBar
        }
    }
</script>

<style>
    :root {
        --score-pile-color1: rgba(243, 176, 199, 1);
        --score-pile-color2: rgba(255, 199, 178, 1);
        --score-pile-color3: rgba(255, 231, 178, 1);
        --score-pile-color4: rgba(170, 212, 210, 1);
        --score-pile-color5: rgba(208, 169, 198, 1);

        --card-color1: rgba(229, 82, 133, 1);
        --card-color2: rgba(255, 132, 87, 1);
        --card-color3: rgba(255, 204, 87, 1);
        --card-color4: rgba(69, 162, 158, 1);
        --card-color5: rgba(152, 67, 131, 1);
    }

    html {
        height: 100%;
    }

    body {
        background-color: rgba(2, 2, 4, 0.33);
        height: 100%;
    }

    #app {
        background-color: white;
        height: 100%;
    }

    .alert {
        position: fixed;
        bottom: 0;
        width:100%;
    }

    [v-cloak] {
        display: none;
    }
</style>
