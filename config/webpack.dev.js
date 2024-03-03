const path = require("path");
const { merge } = require("webpack-merge");
const HtmlWebpackPlguin = require("html-webpack-plugin");
const webpackCommon = require("./webpack.common");

const devConfig = merge(webpackCommon, {
  entry: {
    app: path.join(__dirname, "../example/index.ts"),
  },
  devtool: "inline-source-map",
  devServer: {
    hot: true,
  },
  plugins: [
    new HtmlWebpackPlguin({
      inject: true,
      filename: "index.html",
      template: path.resolve(__dirname, "../example/index.html"),
      title: "example",
    }),
  ],
});
module.exports = devConfig;
