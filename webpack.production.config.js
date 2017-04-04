
const webpack = require('webpack');
const path = require('path');
const loaders = require('./webpack.loaders');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');

// local css modules
loaders.push({
  test: /[\/\\]src[\/\\].*\.css/,
  exclude: /(node_modules|bower_components|public)/,
  loader: ExtractTextPlugin.extract('style', 'css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]')
});

// local scss modules
loaders.push({
  test: /[\/\\]src[\/\\].*\.scss/,
  exclude: /(node_modules|bower_components|public)/,
  loader: ExtractTextPlugin.extract('style', 'css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss!sass')
});
// global css files
loaders.push({
  test: /[\/\\](node_modules|global)[\/\\].*\.css$/,
  loader: ExtractTextPlugin.extract('style', 'css')
});

loaders.push({
  test: /cordova(\.js)?$/,
  loader: 'script-loader'
});


module.exports = {
  entry: [
    './src/index.js' // your app's entry point
  ],
  output: {
    path: path.join(__dirname, 'cordova/www'),
    filename: '[chunkhash].js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      cordova: path.join(__dirname, 'cordova/platforms/android/platform_www/cordova.js'),
      cordova_plugins: path.join(__dirname, 'cordova/platforms/android/platform_www/cordova_plugins.js')
    }
  },
  module: {
    loaders
  },
  plugins: [
    // new WebpackCleanupPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: true,
        drop_console: true,
        drop_debugger: true
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new ExtractTextPlugin('[contenthash].css', {
      allChunks: true
    }),
    new HtmlWebpackPlugin({
      template: './cordova/template.html',
      title: 'EyeRad'
    }),
    new webpack.optimize.DedupePlugin()
  ]
};
