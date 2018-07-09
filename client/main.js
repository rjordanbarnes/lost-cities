import Vue from 'vue';
import App from './App';
import store from './store';
import router from './router';
import VueSocketio from 'vue-socket.io';
import GoogleAuth from 'vue-google-oauth';
import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue);

const googleOathConfig = require('../config/googleoath.config.js');
Vue.use(VueSocketio, 'http://localhost:3379');
Vue.use(GoogleAuth, { client_id: googleOathConfig.web.client_id });
Vue.googleAuth().load();
Vue.config.productionTip = false;

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'font-awesome/css/font-awesome.css'

/* eslint-disable no-new */
new Vue({
    el: '#app',
    store,
    router,
    template: '<App/>',
    components: { App }
});
