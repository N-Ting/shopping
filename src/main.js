import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式
import './assets/css/global.css'
//导入axios
import axios from 'axios'
//导入第三方插件vue-table-with-tree-gird
import TableTree from 'vue-table-with-tree-grid'
// 初始化全局url
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//请求在到达服务器之前,先会调用use中的这个回调函数来添加请求头信息
axios.interceptors.request.use((config) => {
  //为请求头对象,添加token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem("token")
  return config
})
//无效token的处理
axios.interceptors.response.use(res => {
  // 当提示信息为无效token或者状态为400
  if (res.data.meta.msg === '无效token' && res.data.meta.status === 400) {
    //跳转到登录页面
    localStorage.href = '/#/login'
  }
  return res
})

Vue.prototype.$http = axios

Vue.config.productionTip = false
//注册为全局组件
Vue.component('tree-table', TableTree)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
