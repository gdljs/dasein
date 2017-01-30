import Axios from 'axios';
import Vue from 'vue';
import AuthService from '../services/auth';

const internals = {};

internals.kPostsRoute = '/api/posts';

export default internals.PostFormComponent = Vue.component('post-form', {
  template: '<div class="post-form-container">' +
      '<h1>sup.</h1>' +
      '<textarea :disabled="submitting" v-model="content" class="post-content-input" placeholder="tell us something" maxlength=255></textarea>' +
      '<p v-show="message" class="post-form-error">{{message}}</p>' +
      '<button :disabled="submitting" class="post-submit" v-on:click="submit">Go.</button>' +
      '</div>',

  data() {

    return {
      content: '',
      message: '',
      submitting: false,
      authService: new AuthService()
    };
  },

  methods: {
    submit() {

      this.submitting = true;

      return Axios({
        method: 'post',
        headers: {
          Authorization: `Bearer ${this.authService.token}`
        },
        data: {
          content: this.content
        },
        url: internals.kPostsRoute
      }).then((response) => {

        this.$emit('post-submitted', response.data);
        this.content = '';
        this.message = '';
        this.submitting = false;
      }).catch((err) => {

        console.error(err.stack);
        this.submitting = false;
        this.message = 'Error while creating the post...';
      });
    }
  }
});


