const path = require('path');

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const exthostDir = path.join(__dirname, '..', 'src', 'extension');
const tsConfigPath = path.join(__dirname, '..', '..', 'tsconfig.json');
const distDir = path.join(__dirname, '../hosted');

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  entry: path.join(exthostDir, './ext-host.js'),
  target: 'node',
  output: {
    filename: 'ext.process.js',
    path: distDir,
  },
  devtool: false,
  mode: 'development',
  node: false,
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.mjs', '.json', '.less'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: tsConfigPath,
      }),
    ],
  },
  module: {
    // https://github.com/webpack/webpack/issues/196#issuecomment-397606728
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
  externals: [
    function ({ context, request }, callback) {
      if (
        ['node-pty', 'oniguruma', 'nsfw', 'spdlog', 'efsw', 'getmac'].indexOf(
          request,
        ) !== -1
      ) {
        return callback(null, `commonjs ${request}`);
      }
      callback();
    },
  ],
  resolveLoader: {
    modules: [path.join(__dirname, '../node_modules')],
    extensions: ['.ts', '.tsx', '.js', '.json', '.less'],
    mainFields: ['loader', 'main'],
  },
};
