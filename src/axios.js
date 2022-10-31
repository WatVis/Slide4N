// import Axios from 'axios';
// import { Component } from 'react';
// Component.prototype.$axios = Axios; //将axios挂载到Component上，以供全局使用

// //配置过滤器请求响应（通过查npm官网，axios文档）
// Axios.interceptors.response.use(
//   function (response) {
//     return response.data; //只获取data数据
//   },
//   function (error) {
//     return Promise.reject(error);
//   }
// );

var webpack = require('webpack');
module.exports = {
  devServer: {
    proxy: {
      //配置跨域
      '/': {
        target: 'http://127.0.0.1:5000', //这里的IP地址需要根据项目上线的IP地址进行配置修改
        ws: true,
        changeOrigin: false //这里在项目上线的时候需要配置为false
      }
    },
    disableHostCheck: true
  },
  chainWebpack: config => {
    config.plugin('provide').use(webpack.ProvidePlugin, [
      {
        $: 'jquery',
        jquery: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery'
      }
    ]);
  }
};
