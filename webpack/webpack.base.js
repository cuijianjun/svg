const path = require('path');
const glob = require('glob');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const chalk = require('chalk');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const devMode = process.env.NODE_ENV !== 'production'; // 判断当前环境是开发环境还是 部署环境，主要是 mode属性的设置值。

const seen = new Set();
const nameLength = 4;

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

function getEntry(globPath) {
  let files = glob.sync(globPath);
  let entries = {}, entry, tempname, entryname;

  for (let i = 0; i < files.length; i++) {
    entry = files[i];
    tempname = (entry + globPath).replace(/(.+)(.+)\1/, '$2\n').split('\n')[0].split('/');
    tempname.splice(tempname.length - 1, 1);
    entryname = tempname.join('/');
    entries[entryname] = ['./' + entry, '@babel/polyfill'];
  }
  return entries;
}

let entries = getEntry('src/**/app.js');

function setHtmlBundle() {
  let pages = Object.keys(getEntry('src/**/app.html'));
  let tempArr = [];
  pages.forEach(pathname => {
    let name = pathname.split('/')[pathname.split('/').length - 1];
    let conf = {
      filename: `view/${name}.html`,
      template: `src/${pathname}/app.html`,
      inject: false,
      minify: {
        collapseWhitespace: true,
        removeComments: true, // 是否移除注释
        removeAttributeQuotes: false // 移除属性的引号
      }
    };
    if (pathname in getEntry('src/**/app.js')) {
      conf.favicon = resolve('favicon.ico');
      conf.inject = 'body';
      conf.chunks = ['vendor', pathname, 'common', 'manifest'];
      conf.hash = devMode;
    }
    tempArr.push(new HtmlWebpackPlugin(conf));
  });
  return tempArr;
}

module.exports = {
  mode: devMode ? 'development' : 'production',
  entry: entries,
  resolve: {
    extensions: ['.js', '.json', '.vue'],
    alias: {
      'src': resolve('src'),
      'app': resolve('src/app'),
      'common': resolve('src/pages/common_style'),
      'lib': resolve('src/lib'),
      'assets': resolve('src/assets'),
    }
  },
  output: {
    path: resolve('dist'),
    filename: devMode ? 'js/[name].js' : 'js/[name].[chunkhash].js',
    publicPath: '/dist/'
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: '/node_modules/',
        include: resolve('src'),
        loader: 'happypack/loader?id=eslint',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        include: resolve('src'),
        loader: 'happypack/loader?id=happy-babel-js',
      },
      {
        test: /\.html$/,
        use: 'happypack/loader?id=html'
      },
      {
        test: /\.json$/i,
        type: 'javascript/auto',
        use: ['json-loader']
      },
      {
        test: /\.(le|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'happypack/loader?id=less'
        ]
      },
      {
        test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        include: [
          // resolve('node_modules/webscore/dist/fonts/Maestro.ttf')
        ],
        use: {
          loader: 'url-loader',
          options: {
            name: 'fonts/[name].[ext]'
          },
        }
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        exclude: [
          resolve('src/lib/svgGraffiti/temp.svg')
        ],
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'image/[hash].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(csv|tsv)$/,
        use: ['csv-loader']
      },
      {
        test: /\.xml$/,
        use: ['xml-loader']
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: devMode ? 'css/[name].css' : 'css/[name].[contenthash].css'
    }),
    new HappyPack({
      id: 'eslint',
      loaders: [{
        loader: 'eslint-loader',
        options: {
          fix: true
        }
      }],
      threadPool: happyThreadPool
    }),
    new HappyPack({
      id: 'happy-babel-js',
      loaders: ['babel-loader?cacheDirectory=true'],
      threadPool: happyThreadPool
    }),
    new HappyPack({
      id: 'less',
      loaders: ['css-loader', 'less-loader'],
      threadPool: happyThreadPool
    }),
    new HappyPack({
      id: 'html',
      loaders: [
        {
          loader: 'html-loader',
          options: {
            attrs: [':data-src', 'img:src']
          }
        }
      ],
      threadPool: happyThreadPool
    }),
    new webpack.ProvidePlugin({ // 提供全局变量
      '$': 'jquery'
    }),
    new ProgressBarPlugin({
      format: 'build [:bar]' + chalk.green.bold(':percent') + ' (:elapsed seconds)'
    }),

    new CopyWebpackPlugin([
      {
        from: resolve('node_modules/@theone/webscore/dist/fonts/Maestro.ttf'),
        to: resolve('dist/fonts')
      }
    ]),

    // new webpack.NamedChunksPlugin(chunk => {
    //   // 固定chunk id
    //   if (chunk.name) {
    //     return chunk.name;
    //   }
    //   const modules = Array.from(chunk.modulesIterable);
    //   if (modules.length > 1) {
    //     const hash = require('hash-sum');
    //     const joinedHash = hash(modules.map(m => m.id).join('_'));
    //     let len = nameLength;
    //     while (seen.has(joinedHash.substr(0, len))) len++;
    //     seen.add(joinedHash.substr(0, len));
    //     return `chunk-${joinedHash.substr(0, len)}`;
    //   } else {
    //     return modules[0].id;
    //   }
    // }),
  ].concat(setHtmlBundle()).concat(
    // TODO
    // 注意一定要在HtmlWebpackPlugin之后引用
    // inline 的name 和你 runtimeChunk 的 name保持一致
    new InlineManifestWebpackPlugin('manifest')
  ),
  optimization: {// 包清单
    moduleIds: 'hashed', // 使用文件路径的作为 id，并将它 hash 之后作为 moduleId。
    minimizer: [
      new OptimizeCSSAssetsPlugin({})// 压缩css
    ],
    namedModules: true,
    runtimeChunk: {
      name: 'manifest'
    },
    // 拆分公共包
    splitChunks: {
      cacheGroups: {// 项目公共组件
        common: {
          test: resolve('src/lib'),
          chunks: 'initial', // 只打包初始时依赖的第三方
          name: 'common',
          minChunks: 3,
          priority: 5,
          reuseExistingChunk: true
        },
        // 第三方组件
        vendor: {
          test: /[\\/]node_modules[\\/](jquery|bootstrap|underscore|promise-decode-audio-data|event-emitter-es6|whatwg-fetch|@theone\/webscore|core-js|vconsole|@babel\/polyfill)[\\/]/,
          chunks: 'initial',
          name: 'vendor',
          minChunks: 3,
          priority: 10,
          enforce: true // 优先处理
        }
      }
    }
  },
};

