const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  publicPath: '/30DayMapChallenge-28_Black/',
  transpileDependencies: true,
  devServer: {
    port: 8080,
    host: 'localhost',
  },
});
