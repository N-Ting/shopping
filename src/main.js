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
//导入副文本编译器
import VueQuillEditor from 'vue-quill-editor'
//导入编译器的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme



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
//将副文本编译器注册为全局可用的组件
Vue.use(VueQuillEditor)
//注册一个全局时间过滤器,传入一个时间参数
Vue.filter('dateFormat', function (originVal) {
  //根据给定的时间创建一个时间对象
  const dt = new Date(originVal)
  //拿到完整的四位年份
  const y = dt.getFullYear()
  //得到月份
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  //时分秒
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d}  ${hh}:${mm}:${ss}`
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
