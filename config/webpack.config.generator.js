const paths = require('./paths');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: paths.builderEntryPoint,
  module: {
    rules: [
      {
        test: /\.m?js$/,
        //exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            targets: {
              node: 'current'
            },
            plugins: [
              "@babel/plugin-proposal-class-properties",
              "babel-plugin-transform-import-meta"
            ],
            presets: [
              "@babel/env",
              "@babel/preset-react"
            ]
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
    filename: 'generateConfig.js',
    path: paths.cliBuild,
  }
};
