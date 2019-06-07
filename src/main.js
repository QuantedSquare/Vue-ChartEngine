import Vue from 'vue'
import Vuetify from "vuetify";
import App from './App.vue'
import Router from 'vue-router'
//import router from './router'

import "vuetify/dist/vuetify.min.css";

Vue.use(Router)
Vue.use(Vuetify);

Vue.config.productionTip = false

let router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
      {
          path: '/about',
          name: 'about',
          // route level code-splitting
          // this generates a separate chunk (about.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import( /* webpackChunkName: "about" */ './views/About.vue')
      },
      // Charts
      {
          path: '/lines',
          name: 'lines',
          component: () => import('./views/Lines.vue')
      },
      {
          path: '/bars',
          name: 'bars',
          component: () => import('./views/Bars.vue')
      },
      {
          path: '/donut',
          name: 'donut',
          component: () => import('./views/Donut.vue')
      },
      ,
      {
          path: '/assemblee',
          name: 'assemblee',
          component: () => import('./views/Assemblee.vue')
      }
  ]
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')


