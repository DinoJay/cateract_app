module.exports = [
  {
    test: /\.jsx?$/,
    exclude: /(node_modules|bower_components|public)/,
    loader: 'babel'
  },
  {
    test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
    // exclude: /(node_modules|bower_components)/,
    loader: 'file'
  },
  {
    test: /\.(woff|woff2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    // exclude: /(node_modules|bower_components)/,
    loader: 'url?prefix=font/&limit=5000'
  },
  {
    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
    // exclude: /(node_modules|bower_components)/,
    loader: 'url?limit=10000&mimetype=application/octet-stream'
  },
  {
    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url?limit=10000&mimetype=image/svg+xml'
  },
  {
    test: /\.gif/,
    exclude: /(node_modules|bower_components)/,
    loader: 'url-loader?limit=10000&mimetype=image/gif'
  },
  {
    test: /\.jpg/,
    loader: 'url-loader?limit=10000&mimetype=image/jpg'
  },
  {
    test: /\.png/,
    loader: 'url-loader?limit=10000&mimetype=image/png'
  },
  {
    test: /\.csv/,
    loader: 'dsv-loader'
  },
  {
    test: /\.json/,
    exclude: /(node_modules|bower_components)/,
    loader: 'json-loader'
  }
];
