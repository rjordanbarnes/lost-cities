import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        authenticated: false,
        tokenResponseReceived: false,
        accountSK: null
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
        }
    }
})
