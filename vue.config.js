const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  publicPath: './',
  transpileDependencies: true,

  // 配置路径别名
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  },
  // 开发服务器配置（包含代理）
  devServer: {
    proxy: {
      // 代理配置示例1：转发到本地后端
      '/api': {
        target: 'http://localhost:3000', // 你的后端地址
        changeOrigin: true, // 允许跨域
        pathRewrite: {
          '^/api': '' // 重写路径，去掉 /api 前缀
        }
      }
    }
  }
})