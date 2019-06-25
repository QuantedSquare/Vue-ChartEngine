import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router);

let devRoutes = [
    // Charts
    {
        path: '/bars',
        name: 'bars',
        component: () => import('./views/charts/Bars.vue')
    },
    {
        path: '/lines',
        name: 'lines',
        component: () => import('./views/charts/Lines.vue')
    },
    {
        path: '/number',
        name: 'number',
        component: () => import('./views/charts/Number.vue')
    },
    {
        path: '/pie',
        name: 'pie',
        component: () => import('./views/charts/Pie.vue')
    },
    // Story Player
    {
        path: '/player',
        name: 'player',
        component: () => import('./views/Player.vue')
    }
];

let routes = [{
        path: '/',
        name: 'home',
        component: Home
    },
    {
        path: '/about',
        name: 'about',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import( /* webpackChunkName: "about" */ './views/About.vue')
    },
    // Real Stories
    {
        path: '/data-story/Boeing-2019',
        name: 'Boeing-2019',
        component: () => import('./views/stories/Boeing-2019.vue')
    }
]

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: process.env.NODE_ENV == 'development' ? devRoutes.concat(routes) : routes
})