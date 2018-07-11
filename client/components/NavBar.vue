<template>
    <header class="container-fluid p-0 mb-2 bg-dark">
        <b-navbar toggleable="md" type="dark" variant="dark" class="container">

            <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

            <b-navbar-brand id="brand-text" to="/lobby">Lost Cities</b-navbar-brand>

            <b-collapse is-nav id="nav_collapse">

                <!-- Right aligned nav items -->
                <b-navbar-nav class="ml-auto">
                    <b-nav-item-dropdown right v-if="$store.getters.authenticated">
                        <template slot="button-content">
                            <b-img rounded :src="avatar" class="mr-2" />
                            {{ username }}
                        </template>
                        <b-dropdown-item @click="onChangeName">Change Name</b-dropdown-item>
                        <b-dropdown-item @click="onSignout">Sign out</b-dropdown-item>
                    </b-nav-item-dropdown>

                    <b-nav-item right v-else v-on:click="onSignin">
                        <i class="fa fa-google-plus-official"></i> Sign In
                    </b-nav-item>
                </b-navbar-nav>

            </b-collapse>
        </b-navbar>
        <change-name-prompt ref="changeNamePrompt"></change-name-prompt>
    </header>
</template>

<script>
    import Vue from 'vue';
    import ChangeNamePrompt from '@/components/ChangeNamePrompt'

    export default {
        name: "NavBar",
        data() {
            return {
            }
        },
        sockets: {
            userSigninSuccess() {
                this.$router.push('/lobby');
            }
        },
        computed: {
            username() {
                return this.$store.getters.username;
            },
            avatar() {
                return this.$store.getters.avatarURL + '?sz=30';
            }
        },
        methods: {
            onSignin() {
                Vue.googleAuth().signIn(this.onSigninSuccess, this.onSigninError);
            },
            onSigninSuccess: function (authorizationCode) {
                this.$socket.emit('userGoogleSigninSuccess', authorizationCode);
            },
            onSigninError: function (error) {
                console.log('GOOGLE SERVER - SIGN-IN ERROR', error)
            },
            onSignout() {
                Vue.googleAuth().signOut(this.onSignoutSuccess, this.onSignoutError);
            },
            onSignoutSuccess: function () {
                this.$router.push('/lobby');
                this.$socket.emit('userGoogleSignoutSuccess');
                this.$store.commit('authenticated', false);
                this.$store.commit('accountSK', null);
                this.$store.commit('username', null);
                localStorage.removeItem('token');
            },
            onSignoutError: function (error) {
                console.log('GOOGLE SERVER - SIGN OUT ERROR', error)
            },
            onChangeName: function() {
                this.$refs.changeNamePrompt.showPrompt();
            }
        },
        components: {
            ChangeNamePrompt
        }
    }
</script>

<style scoped>
    #brand-text {
        font-size: 1.75rem;
    }
</style>
