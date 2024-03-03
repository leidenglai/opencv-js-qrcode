// webpack.prod.ts
const path = require("path");
const { merge } = require("webpack-merge");
const commonConfig = require("./webpack.common");

const prodConfig = merge(commonConfig, {
  entry: {
    app: path.join(__dirname, "../src/OpencvQr.ts"),
  },
  output: {
    library: {
      name: "OpencvQr",
      type: "umd",
      export: "default",
    },
    filename: 'OpencvQr.js',
    globalObject: "this",
  },
  mode: "production",
});
module.exports = prodConfig;
