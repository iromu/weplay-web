/* eslint-disable */
var path = require('path')
var webpack = require('webpack')
module.exports = {
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
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader', // 'babel-loader' is also a valid name to reference
        query: {
          presets: ['es2015', 'react']
        }
      },
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  }
}
