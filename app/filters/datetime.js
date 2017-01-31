import Vue from 'vue';

const internals = {};

export default internals.DatetimeFilter = Vue.filter('datetime', (timestamp) => {

  const date = new Date(parseInt(timestamp));

  return date.toISOString();
});
