const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// Set up webpack for front-end code
// Babel is all we need for our back-end
module.exports = {
  entry: {
    client: path.join(__dirname, 'public', 'src', 'js', 'client.js'),
    data: path.join(__dirname, 'public', 'src', 'js', 'data.js')
  },
  output: {
    path: path.join(__dirname, 'public', 'dist'),
    filename: '[name]-bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        },
        include: path.join(__dirname, 'public', 'src', 'js')
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
          publicPath: path.join('public', 'dist')
        }),
        include: path.join(__dirname, 'public', 'src', 'css')
      },
      {
        test: /\.(scss|sass)$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader'],
          publicPath: path.join('public', 'dist')
        })
        // include: path.join(__dirname, 'public', 'src', 'sass')
      },
      {
        test: /\.json$/,
        use: 'json-loader'
      },
      {
        test: /\.(jpe?g|png|gif|svg|eot|woff|ttf|svg|woff2)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            publicPath: ''
          }
        }
      }
      // { test: /\.svg$/, use: 'svg-url-loader' }
      // Use the imports-loader to configure `this`
      // {
      //   test: /[/\\]node_modules[/\\]some-module[/\\]index\.js$/,
      //   use: 'imports-loader?this=>window'
      // },
      // Use the imports-loader to disable AMD
      // {
      //   test: /[/\\]node_modules[/\\]some-module[/\\]index\.js$/,
      //   use: 'imports-loader?define=>false'
      // }
    ]
  },
  plugins: [
    // Don't bring in locales with moment
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // Take compiled SASS & CSS and save to file
    new ExtractTextPlugin({
      filename: '[name]-styles.css',
      disable: false,
      allChunks: true
    })
    // set globals for jquery (Use the ProvidePlugin to inject implicit globals)
    // new webpack.ProvidePlugin({
    //   $: 'jquery',
    //   jQuery: 'jquery'
    // })
  ],
  resolve: {
    alias: {
      // make sure webpack gets the source version, not the dist (Prefer
      // unminified CommonJS/AMD over dist)
      jquery: 'jquery/src/jquery'
    }
  }
};

// Notes on bringing in JQuery properly are from this StackOverflow thread:
// https://stackoverflow.com/questions/28969861/managing-jquery-plugin-dependency-in-webpack
