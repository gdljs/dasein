import Axios from 'axios';
import Vue from 'vue';
import AuthService from '../services/auth';

import CommentFormComponent from './comment_form';
import CommentComponent from './comment';
import DatetimeFilter from '../filters/datetime';
import UsertimeFilter from '../filters/usertime';

const internals = {};

internals.kPostsRoute = '/api/posts';
internals.kCommentsRoute = '/comments';
internals.kPollFrequency = 2000;

export default internals.CommentsComponent = Vue.component('comments', {
  template: '<div class="comments-container">' +
      '<p v-show="message" class="comments-error">{{message}}</p>' +
      '<comment v-for="comment in comments" v-bind:comment="comment" :key="comment.uuid"></comment>' +
      '<comment-form v-bind:postUuid="postUuid" v-on:comment-submitted="addComment"></comment-form>' +
      '</div>',

  props: ['postUuid'],

  data() {

    return {
      message: '',
      poller: null,
      authService: new AuthService(),
      comments: []
    };
  },

  methods: {
    fetchComments() {

      const route = `${internals.kPostsRoute}/${this.postUuid}${internals.kCommentsRoute}`;

      return Axios({
        method: 'get',
        headers: {
          Authorization: `Bearer ${this.authService.token}`
        },
        url: route
      }).then((response) => {

        this.comments = response.data;
        if (!this._isBeingDestroyed) {
          setTimeout(this.fetchComments.bind(this), internals.kPollFrequency);
        }
      }).catch((err) => {

        console.error(err.stack);
        this.message = 'Error while loading the comments...';
      });
    },

    addComment(comment) {

      this.comments.push(comment);
    }
  },

  components: {
    commentForm: CommentFormComponent,
    comment: CommentComponent,
    datetime: DatetimeFilter,
    usertime: UsertimeFilter
  },

  mounted() {

    this.fetchComments();
  }
});
