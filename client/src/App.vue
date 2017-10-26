<template>
    <div id="app">
        <router-link to="/login">Login</router-link>
        <router-view/>
        <transition name="fade">
            <alert :message="alertProperties.message" :alert-style="alertProperties.alertStyle" v-if="alertProperties.visible" />
        </transition>
    </div>
</template>

<script>
    import Alert from '@/components/Alert'

    export default {
        name: 'app',
        data() {
            return {
                alertProperties: {
                    visible: false,
                    message: '',
                    alertStyle: ''
                }
            }
        },
        sockets: {
            userRequestToken() {
                this.$socket.emit('userVerifyToken', localStorage.getItem('token'));
            },
            userNewToken(data) {
                localStorage.setItem('token', data.token);
            },
            generalError(data) {
                this.alertProperties = {
                    visible: true,
                    message: data.error,
                    alertStyle: 'danger'
                };

                setTimeout(() => {
                    this.alertProperties.visible = false;
                }, 3000);
            }
        },
        components: {
            Alert
        }
    }
</script>

<style scoped>
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
