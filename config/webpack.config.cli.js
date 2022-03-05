const paths = require('./paths');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: paths.cliEntryPoint,
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            targets: {
              node: 'current'
            }
          }
        }
      }
    ]
  },
  target: 'node',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true
        }
      })
    ]
  },
  output: {
    filename: 'timing71.js',
    path: paths.cliBuild,
  }
};
