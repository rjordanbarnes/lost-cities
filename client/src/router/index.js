import Vue from 'vue'
import Router from 'vue-router'

import Login from '@/components/Login'
import Lobby from '@/components/Lobby'
import Game from '@/components/Game'
import PageNotFound from '@/components/PageNotFound'

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [
        {path: '/', redirect: '/lobby'},
        {path: '/login', name: 'Login', component: Login},
        {path: '/lobby', name: 'Lobby', component: Lobby},
        {path: '/game/:gameid', name: 'Game', component: Game},
        {path: '*', name: 'PageNotFound', component: PageNotFound}
    ]
})
