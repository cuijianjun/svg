process.env.NODE_ENV = 'production';
const merge = require('webpack-merge');
const base = require('./webpack.prod');
const webpack = require('webpack');

let preConfig = merge(base, {
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
        'HOMEWORK_BASE_URL': JSON.stringify('https://alphard-pre.xiaoyezi.com'),
        'SENTRY_DSN': JSON.stringify('https://d8c73bb5b1c84b46bb2d6d2ce36a58fe@sentry.xiaoyezi.com/20'),
        'HIDE_CONSOLE': JSON.stringify('1')
      }
    })
  ]
});
module.exports = preConfig;
