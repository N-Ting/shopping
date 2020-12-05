<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 为ECharts准备一个具备大小（宽高）的Dom -->
      <div
        id="main"
        style="width: 750px;height:400px;"
      ></div>
    </el-card>
  </div>
</template>

<script>

import _ from 'lodash'

export default {
  data () {
    return {
      //折线图需要合并的数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created () {

  },
  //执行到mounted函数表示页面上的元素,已经被渲染完毕了
  async mounted () {
    // const m = this.$refs.main
    // 基于准备好的dom，初始化echarts实例
    var a = document.getElementById('main')
    // console.log(a, 6666);
    var myChart = this.$echarts.init(a);
    //发起get请求,获取折线统计图的数据
    const { data: res } = await this.$http.get('reports/type/1')
    //请求失败
    if (res.meta.status !== 200) return this.$message.error('获取折线数据失败!')
    //准备数据和配置项
    // _.merge()可以合并两个对象
    const result = _.merge(res.data, this.options)
    //指定展示的数据
    myChart.setOption(result);
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>
</style>