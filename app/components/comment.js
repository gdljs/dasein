import Vue from 'vue';

const internals = {};

export default internals.CommentComponent = Vue.component('comment', {
  template: '<article class="comment">' +
      '<aside class="comment-meta">' +
      '<img :src="comment.userImage" v-bind:alt="\'Avatar for @\' + comment.userId">' +
      '<a v-bind:href="\'https://twitter.com/\' + comment.userId">{{comment.userName}}</a> said on ' +
      '<time v-bind:datetime="comment.timestamp | datetime">{{comment.timestamp | usertime}}</time>' +
      '</aside>' +
      '<div class="comment-content">{{comment.content}}</div>' +
      '</article>',

  props: ['comment']
});

