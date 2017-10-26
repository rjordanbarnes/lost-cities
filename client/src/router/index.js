import Vue from 'vue'
import Router from 'vue-router'

import Login from '@/components/Login'
import Lobby from '@/components/Lobby'
import Room from '@/components/Room'
import PageNotFound from '@/components/PageNotFound'

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [
        {path: '/', redirect: '/lobby'},
        {path: '/login', name: 'Login', component: Login},
        {path: '/lobby', name: 'Lobby', component: Lobby},
        {path: '/room/:roomid', name: 'Room', component: Room},
        {path: '*', name: 'PageNotFound', component: PageNotFound}
    ]
})
