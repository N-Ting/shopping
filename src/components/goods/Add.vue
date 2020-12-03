<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/goods' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 消息提示 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps
        :space="200"
        :active="activeInfo - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- tabs标签区域  v-model绑定值，选中选项卡的 name-->
        <!-- :tab-position="'left'"(设置tab栏为左右结构tab栏) -->
        <!-- before-leave切换标签之前的钩子，若返回 false 或者返回 Promise 且被 reject，则阻止切换。 -->
        <el-tabs
          v-model="activeInfo"
          :tabPosition="'left'"
          :before-leave="beforeTagLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane
            label="基本信息"
            name="0"
          >
            <el-form-item
              label="商品名称"
              prop="goods_name"
            >
              <el-input></el-input>
            </el-form-item>
            <el-form-item
              label="商品价格"
              prop="goods_price"
            >
              <el-input
                v-model="addForm.goods_price"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="商品重量"
              prop="goods_weight"
            >
              <el-input
                v-model="addForm.goods_weight"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="商品数量"
              prop="goods_number"
            >
              <el-input
                v-model="addForm.goods_number"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="商品分类"
              prop="goods_cat"
            >
              <!-- 选择商品分类的级联 -->
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane
            label="商品参数"
            name="1"
          >
            <!-- 渲染表单的item项 -->
            <!-- 循环参数数组manyTabData里的每一项，动态绑定参数名称 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="item1"
                  v-for="(item1,i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane
            label="商品属性"
            name="2"
          >
            <el-form-item
              :label="item2.attr_name"
              v-for="item2 in onlyTableData"
              :key="item2.attr_id"
            >
              <el-input v-model="item2.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane
            label="商品图片"
            name="3"
          > </el-tab-pane>
          <el-tab-pane
            label="商品内容"
            name="4"
          > </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

  </div>
</template>

<script>
export default {
  data () {
    return {
      //保存步骤条激活项索引
      activeInfo: '0',
      //   保存表单数据的对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        //级联选择器的选中项保存的数组
        goods_cat: []
      },
      //   校验规则对象
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ]
      },
      //用来保存分类数据的数组
      cateList: [],
      //配置级联菜单中数据如何展示
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      //动态参数保存的数组
      manyTableData: [],
      //静态属性列表数据
      onlyTableData: []
    }
  },
  created () {
    //快速获取到商品分类数据
    this.getCateList()
  },
  methods: {
    //获取商品分类数据的列表函数
    async getCateList () {
      //发送get请求
      const { data: res } = await this.$http.get('categories')
      //如果请求失败
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      //发送成功就将数据保存到data里的 cateList数组里
      this.cateList = res.data
    },
    //当级联选项发生变化时，触发的函数
    handleChange () {
      //如果用户选择的不是三级分类，则这次选择无效，因为必须选择三级
      //console.log(this.addForm.goods_cat);
      //通过判断保存分类列表的数组长度是否等于3
      if (this.addForm.goods_cat.length !== 3) {
        //不等于3就清空保存分类列表的id数组
        this.addForm.goods_cat = []
        //并且返回
        return
      }

    },
    //监听切换的事件 activeName表示即将进入的标签页，oldActiveName表示即将离开的标签页
    beforeTagLeave (activeName, oldActiveName) {
      //   console.log(activeName, oldActiveName);
      //   //阻止标签页的切换
      //   return false
      //判断oldActiveName是否等于0，并且商品分类选择的时第3项
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    //tab标签页发生切换时的事件
    async tabClicked () {
      //等于1的话证明访问的是动态参数面板
      if (this.activeInfo === '1') {
        //发送获取参数列表的请求
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        })
        //如果请求失败
        if (res.meta.status !== 200) return this.$message.error('获取动态参数失败')
        //循环数组
        res.data.forEach(item => {
          //判断是否等于0，等于就返回一个空数组
          //否则将数组里每一项的attr_vals以空格进行分割
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')

        })
        // console.log(res.data);
        //将数据保存到data里的manyTabData数组里
        this.manyTableData = res.data
        // console.log(this.manyTabData);
      } else if (this.activeInfo === '2') {
        // 等于2的话证明访问的是静态属性
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' }
        })
        //如果请求失败
        if (res.meta.status !== 200) return this.$message.error('获取静态属性失败')
        //成功就将数据保存到data里的onlyData数组里
        this.onlyTableData = res.data
        console.log(this.onlyTableData);
      }

    },

  },
  //计算属性
  computed: {
    cateId () {
      //如果数组的长度等于3表示选中的是3级分类，把数组中的最后一个元素返回
      if (this.addForm.goods_cat.length === 3) return this.addForm.goods_cat[2]
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
</style>