import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        authenticated: false,
        tokenResponseReceived: false,
        accountSK: null,
        username: null,
        avatarURL: null
    },
    mutations: {
        authenticated(state, authenticated) {
            state.authenticated = authenticated;
        },
        tokenResponseReceived(state, received) {
            state.tokenResponseReceived = received;
        },
        accountSK(state, accountSK) {
            state.accountSK = accountSK;
        },
        username(state, username) {
            state.username = username;
        },
        avatarURL(state, avatarURL) {
            state.avatarURL = avatarURL;
        }
    },
    getters: {
        authenticated(state, getters) {
            return state.authenticated;
        },
        tokenResponseReceived(state, getters) {
            return state.tokenResponseReceived;
        },
        accountSK(state, getters) {
            return state.accountSK;
        },
        username(state, getters) {
            return state.username;
        },
        avatarURL(state, getters) {
            return state.avatarURL;
        }
    }
})
