const webpack = require('webpack');
const path = require('path');
// For writing CSS to files (not include with bundle.js)
const ExtractTextPlugin = require('extract-text-webpack-plugin');

// Uglify & Minify. This adds to build time with no real difference
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

// Set up webpack for front-end code
// Babel is all we need for our back-end
module.exports = {
  entry: {
    client: ['babel-polyfill', path.join(__dirname, 'public', 'src', 'js', 'client.js')],
    // If we don't want to use babel-polyfill
    // client: path.join(__dirname, 'public', 'src', 'js', 'client.js'),
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
            presets: [
              [
                'env',
                {
                  targets: {
                    browsers: 'last 2 versions'
                  },
                  useBuiltIns: true,
                  loose: true,
                  modules: false
                }
              ]
            ],
            plugins: ['babel-plugin-inline-import']
          }
        },
        include: path.join(__dirname, 'public', 'src', 'js')
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: { loader: 'css-loader', options: { minimize: true } }
        }),
        include: path.join(__dirname, 'public', 'src', 'css')
      },
      {
        test: /\.(scss|sass)$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [{ loader: 'css-loader', options: { minimize: true } }, 'sass-loader']
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
            name: '[name].[ext]'
          }
        }
      }
      // { test: /\.svg$/, use: 'svg-url-loader' }
      // Use the imports-loader to configure `this`
      // {
      //   test: /[/\\]node_modules[/\\]jquery[/\\]src[/\\]jquery\.js$/,
      //   use: 'imports-loader?this=>window'
      // }
      // Use the imports-loader to disable AMD
      // {
      //   test: /[/\\]node_modules[/\\]jquery[/\\]src[/\\]jquery\.js$/,
      //   use: 'imports-loader?define=>false'
      // }
    ]
  },
  plugins: [
    // Don't bring in locales with moment
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // Fix critical dependency bug:
    // https://github.com/kadirahq/lokka-transport-http/issues/7
    // new webpack.IgnorePlugin(/\/iconv-loader$/),
    // new webpack.IgnorePlugin(/\/node-fetch$/),
    // https://github.com/kadirahq/lokka-transport-http/issues/22
    // Don't build node-fetch because we don't need them!
    // new webpack.NormalModuleReplacementPlugin(/\/iconv-loader$/, 'node-noop'),
    // new webpack.NormalModuleReplacementPlugin(/\/node-fetch$/, 'node-noop'),
    // Take compiled SASS & CSS and save to file
    new ExtractTextPlugin({
      filename: '[name]-styles.css',
      disable: false,
      allChunks: true
    }),
    // set globals for jquery (Use the ProvidePlugin to inject implicit globals)
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    }),
    // Mangle & minify
    new webpack.optimize.UglifyJsPlugin()
    // Set node ENV to production!
    // new webpack.DefinePlugin({
    //   'process.env.NODE_ENV': '"production"'
    // })
  ],
  resolve: {
    mainFields: ['module', 'browser', 'main'],
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      // make sure webpack gets the source version, not the dist (Prefer
      // unminified CommonJS/AMD over dist)
      jquery: 'jquery/src/jquery',
      // Don't use node-fetch!
      // https://github.com/kadirahq/lokka/issues/32
      'node-fetch': 'whatwg-fetch',
      d3: 'd3/index'
    }
  },
  stats: {
    colors: true,
    reasons: true,
    chunks: true
  }
};

// Notes on bringing in JQuery properly are from this StackOverflow thread:
// https://stackoverflow.com/questions/28969861/managing-jquery-plugin-dependency-in-webpack
