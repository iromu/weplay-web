/* eslint-disable */
var path = require('path')
var webpack = require('webpack')


var config = {
  devtool: 'source-map',
  entry: {
    app: './client/index.js'
  },
  cache: true,
  output: {
    path: path.join(__dirname, '/public/'),
    publicPath: '/',
    filename: 'main.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader']
      }

    ]
  }
}
module.exports = config
