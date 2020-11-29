<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img
          src="../assets/heima.png"
          alt=""
        >
        <span>电商后台管理系统</span>
      </div>
      <el-button
        type="info"
        @click="logout"
      >退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 宽度根据是否折叠进行设置-->
      <el-aside :width="isCollapse?'64px':'200px'">
        <!-- 伸缩侧边栏按钮 -->
        <div
          class="toggle-button"
          @click="toggleCollapse"
        >|||</div>
        <!-- 侧边栏菜单，:collapse='isCollapse'(设置折叠菜单为绑定的isCollapse值) :collapse-transition="false"(关闭默认的折叠动画) 将侧边栏二级菜单改造成子级路由链接，只需要将router属性设置为true-->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="ativePath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id+''"
            v-for="item in menuList"
            :key="item.id"
          >
            <!-- 一级菜单模板 这里的slot是填坑-->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>

              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级子菜单 -->
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/'+subItem.path)"
            >
              <!-- 二级菜单模板 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  //私有数据
  data () {
    return {
      //左侧菜单数据
      menuList: [],
      //子菜单的字体图标
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      ativePath: ''
    }
  },
  created () {
    //在created阶段就可以请求左侧菜单数据
    this.getMenuList()
    // 刷新的时候去sessionStorage里面取
    this.ativePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout () {
      //点击logout,清除token
      window.sessionStorage.clear()
      //控制路由跳转到登录页面
      this.$router.push('/login')
    },
    async getMenuList () {
      //发送请求获取左侧菜单数据
      const { data: res } = await this.$http.get('menus')
      // console.log(res);
      //   状态不等于200就返回错误信息
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      //   请求成功, 就将请求回来的数据赋值给menuList
      this.menuList = res.data
    },
    toggleCollapse () {
      // 点击三条线时取反
      this.isCollapse = !this.isCollapse
    },
    saveNavState (path) {
      //点击二级菜单时保存被点击的二级菜单信息
      window.sessionStorage.setItem('activePath', path)
      this.ativePath = path
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #373d41;
  padding-left: 0;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
.el-menu {
  border-right: 0;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>