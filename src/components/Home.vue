<template>
  <div>
    <el-container>
      <!-- 头部区域 -->
      <el-header>Header<el-button
          type="info"
          @click="logout"
        >退出</el-button>
      </el-header>
      <!-- 页面主体区域 -->
      <el-container>
        <el-aside width="200px">Aside</el-aside>
        <el-main>Main</el-main>
      </el-container>
    </el-container>

  </div>
</template>

<script>
export default {
  methods: {
    logout () {
      //点击logout,清除token
      window.sessionStorage.clear()
      //控制路由跳转到登录页面
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>
</style>