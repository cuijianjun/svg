process.env.NODE_ENV = 'production';
const merge = require('webpack-merge');
const base = require('./webpack.base');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const path = require('path');
function resolve (dir) {
  return path.join(__dirname, '..', dir);
}

let prodConfig = merge(base, {
  mode: 'production',
  optimization: {
    minimizer: [
      new ParallelUglifyPlugin({
        workerCount: 4,
        sourceMap: true,
        cacheDir: '.cache/',
        uglifyES: {
          output: {
            beautify: false, // 不需要格式化
            comments: false // 保留注释
          },
          compress: { // 压缩
            warnings: false, // 删除无用代码时不输出警告
            drop_console: false, // 删除console语句
            collapse_vars: true, // 内嵌定义了但是只有用到一次的变量
            reduce_vars: true // 提取出出现多次但是没有定义成变量去引用的静态值
          }
        }

      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  plugins: [
    new webpack.HashedModuleIdsPlugin(),
    new CleanWebpackPlugin([resolve('dist')], {
      root: path.resolve(__dirname, '..'),
      allowExternal: true
    })
  ]
});
if (process.env.npm_config_report) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  prodConfig.plugins.push(new BundleAnalyzerPlugin());
}

if (process.env.build_for_prod) {
  const ReleasePlugin = new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.HOMEWORK_BASE_URL': JSON.stringify('https://alphard.xiaoyezi.com'),
    'process.env.SENTRY_DSN': JSON.stringify('https://cf39ceab55614a08835c09a323cf54ce@sentry.xiaoyezi.com/39'),
    'process.env.HIDE_CONSOLE': JSON.stringify('1')
  });
  prodConfig.plugins.push(ReleasePlugin);
}

module.exports = prodConfig;
