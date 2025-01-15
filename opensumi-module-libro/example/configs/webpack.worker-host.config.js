const path = require('path');

const NodePolyfillPlugin = require('@bytemain/node-polyfill-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require('webpack');

const tsConfigPath = path.join(__dirname, '..', '..', 'tsconfig.json');
const distDir = path.join(__dirname, '..', 'dist');

/** @type { import('webpack').Configuration } */
module.exports = {
  entry: require.resolve('@opensumi/ide-extension/lib/hosted/worker.host.js'),
  output: {
    filename: 'worker-host.js',
    path: distDir,
  },
  target: 'webworker',
  devtool: false,
  mode: 'production',
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
    },
  },
  module: {
    exprContextCritical: false,
    rules: [
      {
        test: /\.tsx?$/,
        loader: require.resolve('ts-loader'),
        options: {
          configFile: tsConfigPath,
        },
      },
      { test: /\.css$/, loader: require.resolve('null-loader') },
      { test: /\.less$/, loader: require.resolve('null-loader') },
    ],
  },
  resolveLoader: {
    modules: [path.join(__dirname, '../node_modules')],
    extensions: ['.ts', '.tsx', '.js', '.json', '.less'],
    mainFields: ['loader', 'main'],
  },
  plugins: [
    !process.env.CI && new webpack.ProgressPlugin(),
    new NodePolyfillPlugin({
      includeAliases: ['process', 'Buffer'],
    }),
  ].filter(Boolean),
};
