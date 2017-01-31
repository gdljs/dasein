import Axios from 'axios';
import Vue from 'vue';
import AuthService from '../services/auth';

import PostFormComponent from './post_form';
import PostComponent from './post';
import DatetimeFilter from '../filters/datetime';
import UsertimeFilter from '../filters/usertime';

const internals = {};

internals.kPostsRoute = '/api/posts';
internals.kPollFrequency = 1000;

export default internals.PostsComponent = Vue.component('posts', {
  template: '<div v-if="authService.authenticated" class="posts-container">' +
      '<post-form v-on:post-submitted="addPost"></post-form>' +
      '<h1>Posts.</h1>' +
      '<p v-show="message" class="posts-error">{{message}}</p>' +
      '<post v-for="post in posts" v-bind:post="post" :key="post.uuid"></post>' +
      '</div>',

  data() {

    return {
      message: '',
      authService: new AuthService(),
      posts: []
    };
  },

  methods: {
    fetchPosts() {

      return Axios({
        method: 'get',
        headers: {
          Authorization: `Bearer ${this.authService.token}`
        },
        url: internals.kPostsRoute
      }).then((response) => {

        this.posts = response.data;
      }).catch((err) => {

        console.error(err.stack);
        this.message = 'Error while loading the posts...';
      });
    },

    addPost(post) {

      this.posts.unshift(post);
    }
  },

  components: {
    postForm: PostFormComponent,
    post: PostComponent,
    datetime: DatetimeFilter,
    usertime: UsertimeFilter
  },

  mounted() {

    if (!this.authService.authenticated) {
      return this.$router.push('/login');
    }

    this.fetchPosts();

    setInterval(this.fetchPosts.bind(this), internals.kPollFrequency);
  }
});

