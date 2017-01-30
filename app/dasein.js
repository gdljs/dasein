import Vue from 'vue';
import VueRouter from 'vue-router';

import AuthService from './services/auth';

import LoginComponent from './components/login';
import WelcomeComponent from './components/welcome';
import PostsComponent from './components/posts';

/* global window */

const internals = {};

export default internals.Dasein = {

  start() {

    this._setupVue();

    internals.authService = new AuthService();

    this.vm = new Vue({
      router: this._setupRouter(),
      el: '#dasein',
      components: {
        login: LoginComponent,
        welcome: WelcomeComponent
      },
      data: {
        message: 'Hello Vue!'
      },
      methods: {
        authenticated() {

          return internals.authService.authenticated;
        }
      }
    });

  },

  // Initializes vue options

  _setupVue() {

    Vue.use(VueRouter);
  },

  // Sets up the routes

  _setupRouter() {

    const routes = [
      {
        path: '/login',
        component: WelcomeComponent
      },
      {
        path: '/',
        component: PostsComponent
      },
      {
        path: '/login-callback',
        component: LoginComponent,
        props: (route) => {

          return {
            oAuthToken: route.query.oauth_token,
            oAuthVerifier: route.query.oauth_verifier
          };
        }
      }
    ];

    const router = new VueRouter({
      mode: 'history',
      routes
    });

    return router;
  }
};


internals.run = function () {

  internals.Dasein.start();
};

window.addEventListener('load', internals.run);
