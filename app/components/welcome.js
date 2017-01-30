import Vue from 'vue';
import AuthService from '../services/auth';

const internals = {};

export default internals.WelcomeComponent = Vue.component('welcome', {
  template: '<div class="welcome-container">' +
      '<p>{{message}}</p>' +
      '<a href="#" v-on:click=initiateLogin v-if=!loggingIn>Login</a>' +
      '</div>',

  data() {

    return {
      message: 'Welcome to Dasein, a social network with posts that disappear when the conversation stops',
      loggingIn: false,
      authService: new AuthService()
    };
  },

  methods: {
    initiateLogin() {

      this.message = 'Logging you in...';
      this.loggingIn = true;

      this.authService.initiateLogin().then((authData) => {

        window.location.href = authData.loginUrl;
      }).catch((err) => {

        console.error(err);
        this.message = 'Oh no! There was a problem logging you in.';
      });
    }
  }
});
