// webpack.common.ts
const path = require("path");

const configCommon = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["babel-loader"],
        exclude: /(node_modules|libs)/,
      },
      {
        test: /\.ts(x?)$/,
        use: [
          {
            loader: "babel-loader",
          },
          "ts-loader",
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.prototxt$/,
        type: "asset/source",
      },
    ],
  },
  resolve: {
    alias: {},
    extensions: [".ts", ".js"],
    fallback: {
      fs: false,
      tls: false,
      net: false,
      path: false,
      zlib: false,
      http: false,
      https: false,
      stream: false,
      crypto: false,
    },
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "../example"), // 修改默认静态服务访问public目录
    },
  },
  plugins: [],
};
module.exports = configCommon;
