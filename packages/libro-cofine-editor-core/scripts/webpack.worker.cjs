const path = require('path');

const webpack = require('webpack');

module.exports = {
  stats: 'errors-only',
  entry: './src/editor.worker.ts',
  output: {
    path: path.resolve(__dirname, '../dist', 'worker'),
    filename: 'editor.worker.min.js',
    globalObject: 'self',
  },
  target: 'webworker',
  optimization: {
    sideEffects: true,
  },
  devtool: 'source-map',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [{ loader: 'source-map-loader' }],
        enforce: 'pre',
      },
      {
        test: /\.tsx?$/,
        use: [
          // { loader: 'babel-loader' },
          {
            loader: 'ts-loader',
            options: { transpileOnly: true, compilerOptions: { target: 'es2018' } },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.ttf$/,
        use: [{ loader: 'file-loader' }],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  plugins: [
    // Merge chunks for UMD bundle
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    // Ignore require() calls in vs/language/typescript/lib/typescriptServices.js
    new webpack.IgnorePlugin({
      contextRegExp: /^((fs)|(path)|(os)|(crypto)|(source-map-support))$/,
      resourceRegExp: /vs\/language\/typescript\/lib/,
    }),
    // Fix webpack warning https://github.com/Microsoft/monaco-editor-webpack-plugin/issues/13#issuecomment-390806320
    new webpack.ContextReplacementPlugin(
      /@difizen\/monaco-editor-core(\\|\/)esm(\\|\/)vs(\\|\/)editor(\\|\/)common(\\|\/)services/,
      __dirname,
    ),
  ],
};
