const fs = require('fs');
const path = require('path');

const NodePolyfillPlugin = require('@bytemain/node-polyfill-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require('webpack');

const tsConfigPath = path.join(__dirname, '..', '..', 'tsconfig.json');
const srcDir = path.join(__dirname, '..', 'src', 'browser');
const distDir = path.join(__dirname, '..', 'dist');
const port = 8080;

const isDevelopment =
  process.env['NODE_ENV'] === 'development' ||
  process.env['NODE_ENV'] === 'dev';

const idePkg = JSON.parse(
  fs
    .readFileSync(
      path.join(
        __dirname,
        '..',
        '..',
        './node_modules/@opensumi/ide-core-browser/package.json',
      ),
    )
    .toString(),
);

const styleLoader =
  process.env.NODE_ENV === 'production'
    ? MiniCssExtractPlugin.loader
    : 'style-loader';

/** @type { import('webpack').Configuration } */
module.exports = {
  entry: srcDir,
  output: {
    filename: 'bundle.js',
    path: distDir,
  },
  cache: {
    type: 'filesystem',
  },
  experiments: {
    asyncWebAssembly: true,
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
      stream: false,
      wasi_snapshot_preview1: false,
      env: false,
      querystring: false,
      http: false,
      https: false,
      zlib: false,
      tls: false,
    },
    fullySpecified: false,
  },
  mode: process.env['NODE_ENV'],
  devtool: isDevelopment ? 'source-map' : false,
  module: {
    exprContextCritical: false,
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: require.resolve('ts-loader'),
            options: {
              happyPackMode: true,
              transpileOnly: true,
              configFile: tsConfigPath,
              compilerOptions: {
                target: 'es2015',
              },
            },
          },
        ],
      },
      {
        test: /\.png$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name]-[hash:8][ext][query]',
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.module.less$/,
        use: [
          styleLoader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: {
                localIdentName: '[local]___[hash:base64:5]',
              },
            },
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
      {
        test: /^((?!\.module).)*less$/,
        use: [
          styleLoader,
          {
            loader: 'css-loader',
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name]-[hash:8][ext][query]',
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name]-[hash:8][ext][query]',
        },
      },
    ],
  },
  resolveLoader: {
    modules: [path.resolve('node_modules')],
    extensions: ['.ts', '.tsx', '.js', '.json', '.less'],
    mainFields: ['loader', 'main'],
  },
  optimization: {
    nodeEnv: process.env.NODE_ENV,
    minimize: false,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '..', 'templates', 'index.html'),
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[chunkhash:8].css',
      chunkFilename: '[id].css',
    }),
    new webpack.DefinePlugin({
      'process.env.WORKSPACE_DIR': JSON.stringify(
        isDevelopment
          ? path.join(__dirname, '..', 'workspace')
          : process.env['WORKSPACE_DIR'],
      ),
      'process.env.EXTENSION_DIR': JSON.stringify(
        isDevelopment
          ? path.join(__dirname, '../..', 'extensions')
          : process.env['EXTENSION_DIR'],
      ),
      'process.env.REVERSION': JSON.stringify(idePkg.version || 'alpha'),
      'process.env.DEVELOPMENT': JSON.stringify(!!isDevelopment),
      'process.env.TEMPLATE_TYPE': JSON.stringify(
        isDevelopment ? process.env['TEMPLATE_TYPE'] : 'standard',
      ),
    }),
    !process.env.CI && new webpack.ProgressPlugin(),
    new NodePolyfillPlugin({
      includeAliases: ['Buffer', 'process', 'setImmediate'],
    }),
  ].filter(Boolean),
  devServer: {
    static: {
      directory: distDir,
    },
    port,
    host: '127.0.0.1',
    devMiddleware: {
      stats: 'errors-only',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
        'X-Requested-With, content-type, Authorization',
    },
    open: true,
    hot: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: false,
      },
    },
  },
};
