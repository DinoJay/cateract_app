const webpack = require('webpack');
const path = require('path');
const loaders = require('./webpack.loaders');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CordovaPlugin = require('webpack-cordova-plugin');


const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || '8888';

// global css
loaders.push({
  test: /\.css$/,
  exclude: /[\/\\]src[\/\\]/,
  // include: /[\/\\](globalStyles)[\/\\]/,
  loaders: [
    'style?sourceMap',
    'css'
  ]
});


// global scss
loaders.push({
  test: /\.scss$/,
  // exclude: /[\/\\]src[\/\\]/,
  include: /[\/\\](global_styles)[\/\\]/,
  loaders: [
    'style?sourceMap',
    'css',
    'sass'
  ]
});

// local scss modules
loaders.push({
  test: /\.scss$/,
  // exclude: /[\/\\](node_modules|bower_components|public|globalStyles)[\/\\]/,
  include: /[\/\\](components)[\/\\]/,
  loaders: [
    'style?sourceMap',
    'css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
    'postcss',
    'sass'
  ]
});

loaders.push({
  test: /cordova(\.js)?$/,
  loader: 'script-loader'
});


// local css modules
// loaders.push({
//   test: /\.css$/,
//   exclude: /[\/\\](node_modules|bower_components|public)[\/\\]/,
//   loaders: [
//     'style?sourceMap',
//     'css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]'
//   ]
// });

module.exports = {
  entry: [
    'react-hot-loader/patch',
    './src/index.js' // your app's entry point
  ],
  devtool: process.env.WEBPACK_DEVTOOL || 'cheap-module-source-map',
  output: {
    path: path.join(__dirname, 'cordova/platforms/browser/platform_www/'),
    filename: 'bundle.js'
  },
  // externals: {
  //   cordova: path.join(__dirname, '/cordova/platforms/browser/platform_www/cordova.js')
  // },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      cordova: path.join(__dirname, 'cordova/platforms/browser/platform_www/cordova.js')
    }
  },
  module: {
    loaders
  },
  devServer: {
    contentBase: './cordova/platforms/browser/platform_www/',
    // do not print bundle build stats
    noInfo: true,
    // enable HMR
    hot: true,
    // embed the webpack-dev-server runtime into the bundle
    inline: true,
    // serve index.html in place of 404 responses to allow HTML5 history
    historyApiFallback: true,
    port: PORT,
    host: HOST
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: './cordova/template.html'
    })
  ]
};
