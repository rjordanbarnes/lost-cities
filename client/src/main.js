// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import store from './store';
import router from './router';
import VueSocketio from 'vue-socket.io';
import GoogleAuth from 'vue-google-oauth';
Vue.use(VueSocketio, 'http://localhost:3379');
Vue.use(GoogleAuth, { client_id: '211245116833-tjj7kb4foc4p17l9ua4n3c81ube2b5bi.apps.googleusercontent.com' });
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
