# MusicSVG Web Server

基于HTML5技术的钢琴演奏练习服务，负责钢琴类产品中“曲谱页面“的所有功能，包括曲谱显示，连琴，跟灯练习，智能评测等。
该服务用客户端内嵌Web页面的方式，可被集成到具体的钢琴类产品中。

## Run dev server
```
# check out 'kommidi' project to path musvg/.. first
# cp src/config.js.default src/config.js

npm install
npm run build
npm run dev
```

## Pages

### play.html

曲谱演奏(练习)页面

URL参数
* `appId` - 应用ID，例如熊猫陪练，智能钢琴，钢琴教室
* `userId` - 用户ID，在指定应用中的用户ID
* `scoreId` - 曲谱ID
* `type` - ui类型

Example
```
https://0.0.0.0:9095/dist/view/play.html?scoreId=1&type=mb
```

### playback.html

回放演奏录音页面

URL参数
* `recordId` - 录音ID

Example
```
https://0.0.0.0:9095/dist/view/playback.html?recordId=1&type=zn
```


#### 控制台打印引入vconsole

[readme](https://github.com/Tencent/vConsole/blob/HEAD/README_CN.md)

#### webpack升级及优化

1. 建议node版本可以升级到V8.9.4或以上版本
2. webpack webpack-cli 
3. 新增mode属性
4. 生产模式下 默认开启 
    - 开启所有的优化代码
    - 更小的bundle大小
    - 去除掉只在开发阶段运行的代码
    - Scope hoisting和Tree-shaking
    - 自动启用uglifyjs对代码进行压缩
5. 废弃**commonchunk**，使用**optimization**
  - splitChunks
  - webpack.optimize.UglifyJsPlugin现在也不需要了，只需要使用optimization.minimize为true就行，production mode下面自动为true，当然如果想使用第三方的压缩插件也可以在optimization.minimizer的数组列表中进行配置
  - ExtractTextWebpackPlugin调整，建议选用新的CSS文件提取插件mini-css-extract-plugin
6. 一些插件的迭代
   NoEmitOnErrorsPlugin- > optimization.noEmitOnErrors（默认情况下处于生产模式）
   ModuleConcatenationPlugin- > optimization.concatenateModules（默认情况下处于生产模式）
   NamedModulesPlugin- > optimization.namedModules（在开发模式下默认开启）
7. hash/chunkhash/contenthash的区别及长缓存的使用（vendor,common,manifest<打包进html中>）
8. happypack开启多线程
9. **dll**文件退出，公共文件直接用**splitChunks**提取
10. **@babel/polyfill** 加入到入口文件中
11. 新增**webpack-parallel-uglify-plugin** js压缩开启多线程
12. **image-webpack-loader** 对图片进行压缩（依赖不好，npm install 时间太长，后期找相关的替换的loader）
 
13. **temp.svg** 不能进行压缩，在涂鸦的层面上需要svg提供基本的结构，而不是压缩成base64格式的
 
14. moduleId/chunkid的固定



##### package.json
1. 开发时： "@theone/webscore": "file:../../webscore",
2. 部署时 ： npm i @theone/webscore@dev -s
3. 切换源： theone - http://npm.xiaoyezi.com/
