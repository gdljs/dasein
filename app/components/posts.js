import Axios from 'axios';
import Vue from 'vue';
import AuthService from '../services/auth';

import PostFormComponent from './post_form';
import DatetimeFilter from '../filters/datetime';
import UsertimeFilter from '../filters/usertime';

const internals = {};

internals.kPostsRoute = '/api/posts';

export default internals.PostsComponent = Vue.component('posts', {
  template: '<div class="posts-container">' +
      '<post-form v-on:post-submitted="addPost"></post-form>' +
      '<h1>Posts.</h1>' +
      '<p v-show="message" class="posts-error">{{message}}</p>' +
      '<article class="post" v-for="post in posts">' +
      '<aside class="post-meta">' +
      '<img :src="post.userImage" v-bind:alt="\'Avatar for @\' + post.userId">' +
      '<a v-bind:href="\'https://twitter.com/\' + post.userId">{{post.userName}}</a> said on ' +
      '<time v-bind:datetime="post.timestamp | datetime">{{post.timestamp | usertime}}</time>' +
      '</aside>' +
      '<div class="post-content">{{post.content}}</div>' +
      '</article>' +
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

        console.err(err.stack);
        this.message = 'Error while loading the posts...';
      });
    },

    addPost(post) {

      this.posts.unshift(post);
    }
  },

  components: {
    postForm: PostFormComponent,
    datetime: DatetimeFilter,
    usertime: UsertimeFilter
  },

  mounted: function mounted() {

    if (!this.authService.authenticated) {
      return this.$router.push('/login');
    }

    return this.fetchPosts();
  }
});

