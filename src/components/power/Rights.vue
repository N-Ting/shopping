<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 表格区域 -->
      <el-table
        :data="rightsList"
        border
        stripe
      >
        <el-table-column type="index"></el-table-column>
        <el-table-column
          label="权限名称"
          prop="authName"
        ></el-table-column>
        <el-table-column
          label="路径"
          prop="path"
        ></el-table-column>
        <el-table-column
          label="权限等级"
          prop="level"
        >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级权限</el-tag>
            <el-tag
              v-else-if="scope.row.level === '1'"
              type="success"
            >二级权限</el-tag>
            <el-tag
              v-else
              type="warning"
            >三级权限</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      //权限列表数据
      rightsList: []
    }
  },
  created () {
    //页面一加载就渲染获取到的权限数据
    this.getRightsList()
  },
  methods: {
    async getRightsList () {
      //发送get请求,获取权限数据
      const { data: res } = await this.$http.get('rights/list')
      //如果返回的状态异常则提示用户获取权限列表失败
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      //如果请求成功,就将请求的数据保存到data里面的rightsList中
      this.rightsList = res.data
      console.log(res);
    }
  }
}
</script>

<style lang="less" scoped>
</style>