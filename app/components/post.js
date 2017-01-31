import Vue from 'vue';

import CommentsComponent from './comments';

const internals = {};

export default internals.PostComponent = Vue.component('post', {
  template: '<article class="post">' +
      '<aside class="post-meta">' +
      '<img :src="post.userImage" v-bind:alt="\'Avatar for @\' + post.userId">' +
      '<a v-bind:href="\'https://twitter.com/\' + post.userId">{{post.userName}}</a> said on ' +
      '<time v-bind:datetime="post.timestamp | datetime">{{post.timestamp | usertime}}</time>' +
      '</aside>' +
      '<div class="post-content">{{post.content}}</div>' +
      '<comments v-bind:postUuid="post.uuid"></post>' +
      '</article>',

  props: ['post'],

  components: {
    comments: CommentsComponent
  }
});
