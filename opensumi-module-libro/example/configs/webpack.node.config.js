const path = require('path');

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const tsConfigPath = path.join(__dirname, '..', '..', 'tsconfig.json');
const srcDir = path.join(__dirname, '..', 'src', 'node');
const distDir = path.join(__dirname, '..', 'dist-node', 'server');

module.exports = {
  entry: path.join(srcDir, './index.ts'),
  target: 'node',
  output: {
    filename: 'index.js',
    path: distDir,
  },
  node: false,
  mode: 'production',
  optimization: {
    minimize: true,
  },
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
      { test: /\.css$/, loader: 'null-loader' },
      { test: /\.less$/, loader: 'null-loader' },
    ],
  },
  externals: [
    function (context, request, callback) {
      if (
        [
          'node-pty',
          'oniguruma',
          'nsfw',
          'spdlog',
          'vm2',
          'canvas',
          'vscode-ripgrep',
          'vertx',
          'keytar',
        ].indexOf(request) !== -1
      ) {
        return callback(null, `commonjs ${request}`);
      }
      callback();
    },
  ],
  resolveLoader: {
    modules: [path.join(__dirname, './node_modules')],
    extensions: ['.ts', '.tsx', '.js', '.json', '.less'],
    mainFields: ['loader', 'main'],
  },
};
