const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
module.exports = {
  plugins: [
    // new CleanWebpackPlugin(),
    // new HtmlWebpackPlugin({
    //     template: TEMPLATE_FILE,
    //     filename: BUILD_PATH.concat('/index.html'),
    //     alwaysWriteToDisk: true
    // }),
    // new webpack.ProvidePlugin({
    //     $: 'jquery',
    //     jQuery: 'jquery',
    //     jquery: 'jquery',
    //     'window.jQuery': 'jquery'
    // }),
    // new MiniCssExtractPlugin(),
    // new Dotenv({
    //     path: `${ENV_PATH}/.env${env ? `.${env}` : ''}`
    // }),
],
  module: {
    rules: [
      // {
      //   test: /\.(css|sass|scss)$/,
      //   use: [
      //       { loader: MiniCssExtractPlugin.loader },
      //       { loader: 'css-loader' },
      //       {
      //           loader: 'postcss-loader',
      //           options: {
      //               postcssOptions: {
      //                   plugins: [
      //                       [
      //                           "postcss-preset-env",
      //                           {
      //                               // Options
      //                           },
      //                       ],
      //                   ],
      //               },
      //           }
      //       },
      //       {
      //           loader: 'sass-loader',
      //           options: {
      //              // Prefer `dart-sass`
      //              implementation: require("sass"),
      //           },
      //        }
      //   ],
      // },
      {
        test: /\.html$/,
        use: {
            loader: 'html-loader'
        }
      },
      { test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: 'asset/resource' },
      { test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, type: 'asset/inline' },
    ]
  }
}
