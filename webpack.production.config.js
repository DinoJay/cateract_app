const webpack = require('webpack');
const path = require('path');
const loaders = require('./webpack.loaders');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const WebpackCleanupPlugin = require('webpack-cleanup-plugin');

// global css
loaders.push({
  test: /\.css$/,
  exclude: /[\/\\]src[\/\\]/,
  // include: /[\/\\](globalStyles)[\/\\]/,
  loaders: ['style?sourceMap', 'css']
});

// global scss
loaders.push({
  test: /\.scss$/,
  // exclude: /[\/\\]src[\/\\]/,
  include: /[\/\\](global_styles)[\/\\]/,
  loaders: ['style?sourceMap', 'css', 'sass']
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

// loaders.push({
//   loader: 'script-loader'
// });

module.exports = {
  entry: [
    './src/index.js' // your app's entry point
  ],
  output: {
    path: path.join(__dirname, 'cordova/platforms/browser/platform_www/'),
    filename: '[chunkhash].js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
    // alias: {
    // }
  },
  module: {
    loaders
  },

  node: {
    child_process: 'empty',
    fs: 'empty'
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
      template: './template.html',
      title: 'EyeRad'
    }),
    new webpack.optimize.DedupePlugin()
  ]
};
