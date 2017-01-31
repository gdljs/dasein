import Vue from 'vue';

const internals = {};

export default internals.UsertimeFilter = Vue.filter('usertime', (timestamp) => {

  const date = new Date(parseInt(timestamp));

  const dateString = date.toISOString();

  const dateComponents = dateString.split('T');
  const dateFragment = dateComponents[0];
  const timeComponents = dateComponents[1].split(':');

  const hourFragment = timeComponents[0];
  const minuteFragment = timeComponents[1];

  return `${dateFragment} ${hourFragment}:${minuteFragment}`;
});

