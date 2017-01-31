'use strict';

const Path = require('path');

module.exports = {
  entry: './app/dasein',

  output: {
    path: Path.resolve(__dirname, '../static/assets'),
    filename: 'bundle.js',
    publicPath: '/assets/',
    library: 'Dasein',
    libraryTarget: 'umd'
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|doc)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },

  resolve: {
    modules: [
      'node_modules',
      Path.resolve(__dirname, '../app')
    ],

    alias: {
      'vue$': 'vue/dist/vue.common.js'
    }
  },

  extensions: ['.js', '.json', '.css'],

  context: Path.resolve(__dirname, '..')
};
