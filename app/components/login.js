import Vue from 'vue';
import AuthService from '../services/auth';

const internals = {};

export default internals.LoginComponent = Vue.component('login', {
  template: '<div class="login-container">' +
      '<p>{{message}}</p>' +
      '</div>',

  props: ['oAuthToken', 'oAuthVerifier'],

  data() {

    return {
      message: 'Logging you in... Wait a sec.',
      authService: new AuthService()
    };
  },
  methods: {
    login() {

      if (this.authService.authenticated) {
        return this.$router.push('/');
      }

      return this.authService.getUserObject(this.oAuthToken, this.oAuthVerifier).then((response) => {

        console.log(response);

        return this.authService.login(response.user, response.token, response.expiresAt);
      }).then(() => {

        this.$router.push('/');
      }).catch((err) => {

        console.error(err);
        this.message = 'Oh no! There was a problem logging you in.';
      });
    }
  },
  mounted: function mounted() {

    this.login();
  }
});
