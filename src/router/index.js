import Vue from 'vue'
import Router from 'vue-router'

import Lobby from '@/components/Lobby/Lobby'
import Game from '@/components/Game'
import PageNotFound from '@/components/PageNotFound'

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [
        {path: '/', redirect: '/lobby'},
        {path: '/lobby', name: 'Lobby', component: Lobby},
        {path: '/game/:gameSK', name: 'Game', component: Game},
        {path: '*', name: 'PageNotFound', component: PageNotFound}
    ]
})
