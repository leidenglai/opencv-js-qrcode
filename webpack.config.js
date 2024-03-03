// webpack.config.ts
const devConfig = require("./config/webpack.dev.js");
const prdConfig = require("./config/webpack.prod.js");

module.exports = (env, argv) => {
  // 开发环境 argv会获取package.json中设置--mode的值
  if (argv.mode === "development") {
    return devConfig;
  }
  return prdConfig;
};
