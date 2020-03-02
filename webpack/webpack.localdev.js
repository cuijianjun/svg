process.env.NODE_ENV = 'development';
const merge = require('webpack-merge');
const base = require('./webpack.base');
const webpack = require('webpack');
module.exports = merge(base, {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    contentBase: false, // 告诉服务器从哪里提供内容， 默认情况下，将使用当前工作目录作为提供内容的目录
    clientLogLevel: 'warning',
    hot: true,
    https: true,
    compress: true, // 一切服务都启用gzip 压缩
    host: '0.0.0.0',
    port: 64529,
    open: false,
    overlay: {
      warnings: true,
      errors: true
    },
    // watchOptions: { // 监视文件相关的控制选项
    //   poll: true, // webhomework/recordpack 使用文件系统(file system)获取文件改动的通知。在某些情况下，不会正常工作。例如，当使用 Network File System (NFS) 时。Vagrant 也有很多问题。在这些情况下，请使用轮询. poll: true。当然 poll也可以设置成毫秒数，比如：  poll: 1000
    //   ignored: /node_modules/, // 忽略监控的文件夹，正则
    //   aggregateTimeout: 300 // 默认值，当第一个文件更改，会在重新构建前增加延迟
    // },
    proxy: {
      '/res/**': {
        target: 'http://music-score-dev.oss-cn-beijing.aliyuncs.com/',
        changeOrigin: true,
        pathRewrite: { '^/res': '' },
        secure: false,
      },
      '/api/**': {
        // target: 'http://10.60.19.163:20000/',
        target: 'https://musvg-dev.1tai.com/',
        changeOrigin: true,
        secure: false,
      },
      '/student_app/**': {
        target: 'https://dss-dev.xiongmaopeilian.com/',
        changeOrigin: true,
        secure: false,
      },
      '/org_web/**': {
        target: 'https://dss-dev.xiongmaopeilian.com/',
        changeOrigin: true,
        secure: false,
      },
      '/teacher_app/**': {
        target: 'http://app-dev.xiongmaopeilian.com/',
        changeOrigin: true,
        secure: false,
      },
      '/wechat/**': {
        target: 'http://app-dev.xiongmaopeilian.com/',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development'),
        'HOMEWORK_BASE_URL': JSON.stringify('https://alphard-dev.xiaoyezi.com'),
        'SENTRY_DSN': JSON.stringify('https://d8c73bb5b1c84b46bb2d6d2ce36a58fe@sentry.xiaoyezi.com/20')
      }
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ]
});
