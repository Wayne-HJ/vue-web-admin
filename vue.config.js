module.exports = {
  productionSourceMap: false,
  devServer: {
    port: 8081,
    // public: '0.0.0.0',
    proxy: {
      "/api": {
        target: "http://152.67.102.41:8089",
        // target: "http://localhost:8089",
        // target: "https://static.jianght.eu.org",
        changeOrigin: true,
        pathRewrite: {
          "^/api": ""
        }
      }
    },
    disableHostCheck: true
  },
  chainWebpack: config => {
    config.resolve.alias.set("@", resolve("src"));
  }
};

const path = require("path");
function resolve(dir) {
  return path.join(__dirname, dir);
}
