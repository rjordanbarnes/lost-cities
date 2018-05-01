<template>
    <header class="container-fluid p-0 mb-2 bg-dark">
        <b-navbar toggleable="md" type="dark" variant="dark" class="container">

            <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

            <b-navbar-brand to="/lobby">Lost Cities</b-navbar-brand>

            <b-collapse is-nav id="nav_collapse">

                <b-navbar-nav>
                    <b-nav-item href="#">Link</b-nav-item>
                    <b-nav-item href="#" disabled>Disabled</b-nav-item>
                </b-navbar-nav>

                <!-- Right aligned nav items -->
                <b-navbar-nav class="ml-auto">

                    <b-nav-form>
                        <b-form-input size="sm" class="mr-sm-2" type="text" placeholder="Search"/>
                        <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
                    </b-nav-form>

                    <b-nav-item-dropdown text="Lang" right>
                        <b-dropdown-item href="#">EN</b-dropdown-item>
                        <b-dropdown-item href="#">ES</b-dropdown-item>
                        <b-dropdown-item href="#">RU</b-dropdown-item>
                        <b-dropdown-item href="#">FA</b-dropdown-item>
                    </b-nav-item-dropdown>

                    <b-nav-item-dropdown right v-if="$store.getters.authenticated">
                        <!-- Using button-content slot -->
                        <template slot="button-content">
                            {{ username }}
                        </template>
                        <b-dropdown-item href="#">Profile</b-dropdown-item>
                        <b-dropdown-item v-on:click="onSignout">Sign out</b-dropdown-item>
                    </b-nav-item-dropdown>
                    <b-nav-item right v-else v-on:click="onSignin">
                        <i class="fa fa-google-plus-official"></i> Sign In
                    </b-nav-item>
                </b-navbar-nav>

            </b-collapse>
        </b-navbar>
    </header>
</template>

<script>
    import Vue from 'vue';

    export default {
        name: "NavBar",
        data() {
            return {
            }
        },
        sockets: {
            userSigninSuccess() {
                this.$router.push('lobby');
            }
        },
        computed: {
            username() {
                return this.$store.getters.username
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
                this.$socket.emit('userGoogleSignoutSuccess');
                this.$store.commit('authenticated', false);
                this.$store.commit('accountSK', null);
                this.$store.commit('username', null);
                localStorage.removeItem('token');
            },
            onSignoutError: function (error) {
                console.log('GOOGLE SERVER - SIGN OUT ERROR', error)
            }
        }
    }
</script>

<style scoped>

</style>
