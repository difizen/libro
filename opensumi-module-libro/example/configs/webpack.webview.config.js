const path = require('path');

const webpack = require('webpack');

const entry = require.resolve(
  '@opensumi/ide-webview/lib/webview-host/web-preload.js',
);
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NodePolyfillPlugin = require('@bytemain/node-polyfill-webpack-plugin');

const tsConfigPath = path.join(__dirname, '..', '..', 'tsconfig.json');
const distDir = path.join(__dirname, '..', 'dist');
const port = 8899;

/** @type { import('webpack').Configuration } */
module.exports = {
  entry,
  output: {
    filename: 'webview.js',
    path: distDir,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.mjs', '.json', '.less'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: tsConfigPath,
      }),
    ],
    fallback: {
      net: false,
      path: false,
      os: false,
      crypto: false,
      child_process: false,
      url: false,
      fs: false,
    },
  },
  bail: true,
  mode: 'development',
  devtool: 'source-map',
  module: {
    // https://github.com/webpack/webpack/issues/196#issuecomment-397606728
    exprContextCritical: false,
    rules: [
      {
        test: /\.tsx?$/,
        loader: require.resolve('ts-loader'),
        options: {
          happyPackMode: true,
          transpileOnly: true,
          configFile: tsConfigPath,
        },
      },
    ],
  },
  resolveLoader: {
    modules: [
      path.join(__dirname, '../../../node_modules'),
      path.join(__dirname, '../node_modules'),
      path.resolve('node_modules'),
    ],
    extensions: ['.ts', '.tsx', '.js', '.json', '.less'],
    mainFields: ['loader', 'main'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.dirname(entry) + '/webview.html',
    }),
    new NodePolyfillPlugin({
      includeAliases: ['process', 'Buffer'],
    }),
    !process.env.CI && new webpack.ProgressPlugin(),
  ].filter(Boolean),
  devServer: {
    static: {
      directory: distDir + '/public',
    },
    allowedHosts: 'all',
    port,
    host: '0.0.0.0',
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: false,
      },
    },
    open: false,
    hot: true,
  },
};
