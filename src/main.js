// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import store from './store';
import router from './router';
import VueSocketio from 'vue-socket.io';
import GoogleAuth from 'vue-google-oauth';
const googleOathConfig = require('../config/googleoath.config.js');
Vue.use(VueSocketio, 'http://localhost:3379');
Vue.use(GoogleAuth, { client_id: googleOathConfig.web.client_id });
Vue.googleAuth().load();
Vue.config.productionTip = false;

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.css'

/* eslint-disable no-new */
new Vue({
    el: '#app',
    store,
    router,
    template: '<App/>',
    components: { App }
});
