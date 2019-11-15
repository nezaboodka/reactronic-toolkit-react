const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  devtool: 'source-map', // enable sourcemaps for debugging webpack output
  mode: 'development', // 'production' | 'development' | 'none'
  entry: {
    vendors: ['react', 'react-dom'],
    app: [path.resolve(__dirname, 'demo', 'index.tsx')],
  },
  output: {
    path: path.resolve(__dirname, './public'),
    filename: '[name].js',
  },
  watchOptions: {
    ignored: /node_modules/,
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.css'],
    alias: {
      '@reactronic-toolkit-react': path.resolve(__dirname, 'source', 'index.ts'),
      '/app': path.resolve(__dirname, 'demo', 'app'),
      '/view': path.resolve(__dirname, 'demo', 'view'),
    },
  },

  module: {
    rules: [{
      test: /\.js$/,
      enforce: 'pre',
      loader: 'source-map-loader',
    }, {
      test: /\.tsx?$/,
      enforce: 'pre',
      loader: 'eslint-loader',
      options: {
        emitErrors: true,
      },
    }, {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      loaders: ['babel-loader'],
    }, {
      test: /\.tsx?$/,
      loaders: ['babel-loader', 'awesome-typescript-loader'],
    }, {
      test: /\.css$/,
      use: [{
        loader: 'style-loader',
      }, {
        loader: 'css-loader',
        options: {
          sourceMap: true,
        },
      }],
    }, {
      test: /\.(jpg|png|woff|eot|ttf|svg|gif)$/,
      loader: 'file-loader?name=[name].[ext]',
    }],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'demo/index.html',
    }),
  ],
}
