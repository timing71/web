const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

const paths = require('./paths.cjs');

const isEnvProduction = process.env.NODE_ENV === 'production';
const isEnvDevelopment = process.env.NODE_ENV === 'development';

const outputPath = path.resolve(__dirname, '../build');

const commonConfig = {
  devServer: {
    client: {
      logging: 'warn'
    },
    compress: true,
    historyApiFallback: true,
    hot: true,
    port: 3000
  },
  entry: './src/index.js',
  output: {
    path: outputPath,
    publicPath: '/',
    filename: '[name].[contenthash].js',
    chunkFilename: isEnvProduction ? 'static/js/[name].[contenthash:8].chunk.js' : isEnvDevelopment && 'static/js/[name].chunk.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
        resolve: {
          fullySpecified: false
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: require.resolve('@svgr/webpack'),
            options: {
              prettier: false,
              svgo: false,
              svgoConfig: {
                plugins: [{ removeViewBox: false }],
              },
              titleProp: true,
              ref: true,
            },
          },
          {
            loader: require.resolve('file-loader'),
            options: {
              name: 'static/media/[name].[hash].[ext]',
            },
          },
        ],
        issuer: {
          and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
        },
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10000,
          },
        },
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new webpack.ProvidePlugin({
      // Make a global `process` variable that points to the `process` package,
      // because the `util` package expects there to be a global variable named `process`.
      // Thanks to https://stackoverflow.com/a/65018686/14239942
      process: 'process/browser'
   }),
   new CopyPlugin({
     patterns: [
       {
         from: paths.appPublic,
         filter: f => f !== paths.appHtml,
         to: outputPath
       }
     ]
   })
  ],
  resolve: {
    alias: {
       process: "process/browser"
    },
    fallback: {
      "stream": require.resolve("stream-browserify")
    }
  },
  target: ['browserslist']
};

module.exports = () => {
  return {
    mode: isEnvProduction ? 'production' : 'development',
    devtool: isEnvProduction ? 'source-map' : false,
    ...commonConfig
  };
};
