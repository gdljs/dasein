import Axios from 'axios';
import Vue from 'vue';
import AuthService from '../services/auth';

const internals = {};

internals.kPostsRoute = '/api/posts';
internals.kCommentsRoute = '/comments';

export default internals.CommentFormComponent = Vue.component('comment-form', {
  template: '<div class="comment-form-container">' +
      '<p v-show="!active" class="comment-form-error">' +
      '<button class="comment-activate" v-on:click="activate">Add comment.</button>' +
      '</p>' +
      '<textarea v-show="active" :disabled="submitting" v-model="content" class="comment-content-input" placeholder="tell us something" maxlength=255></textarea>' +
      '<p v-show="message" class="comment-form-error">{{message}}</p>' +
      '<button v-show="active" :disabled="submitting" class="comment-submit" v-on:click="submit">Go.</button>' +
      '</div>',

  props: ['postUuid'],

  data() {

    return {
      content: '',
      message: '',
      active: false,
      submitting: false,
      authService: new AuthService()
    };
  },

  methods: {

    // Activates the form.

    activate() {
      this.active = true;
    },

    // Creates a comment

    submit() {

      this.submitting = true;
      const route = `${internals.kPostsRoute}/${this.postUuid}${internals.kCommentsRoute}`;

      return Axios({
        method: 'post',
        headers: {
          Authorization: `Bearer ${this.authService.token}`
        },
        data: {
          content: this.content
        },
        url: route
      }).then((response) => {

        this.$emit('comment-submitted', response.data);
        this.content = '';
        this.message = '';
        this.submitting = false;
        this.active = false;
      }).catch((err) => {

        console.error(err.stack);
        this.submitting = false;
        this.message = 'Error while creating the post...';
      });
    }
  }
});
