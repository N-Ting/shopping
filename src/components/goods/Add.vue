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
              <el-input v-model="addForm.goods_name"></el-input>
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
          >
            <!-- 图片上传区域 -->
            <!-- action要上传到那个地址的那个后台接口 -->
            <!-- on-preview点击名称时处理预览的事件 -->
            <!-- on-remove移出文件时触发的事件 -->
            <!-- list-type文件列表呈现的方式 -->
            <!-- headers设置上传的请求头 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success='handleSuccess'
            >
              <el-button
                size="small"
                type="primary"
              >点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane
            label="商品内容"
            name="4"
          >
            <!-- 副文本编译器组件 v-model将里面的内容双向绑定到data中-->
            <quill-editor v-model="addForm.goods_introduce">
            </quill-editor>
            <el-button
              type="primary"
              class="btnAdd"
              @click="addGood"
            >添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="50%"
    >
      <img
        :src="previewPath"
        alt=""
        class="previewImg"
      >
    </el-dialog>
  </div>
</template>

<script>
//在行为之前导入lodash
import _ from 'lodash'

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
        goods_cat: [],
        //图片临时路径
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        //包含动态参数和静态属性的数组
        attrs: []
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
      onlyTableData: [],
      //上传图片的地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      //图片上传请求头组件的对象
      headerObj: {
        //添加token验证的Authorization字段
        Authorization: window.sessionStorage.getItem("token")
      },
      //保存图片真实的url地址
      previewPath: '',
      //图片预览对话框默认不显示
      previewVisible: false
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
        //提示要选择商品分类
        this.$message.error('请先选择商品分类')
        //并且返回false，阻止切换
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
        // console.log(this.onlyTableData);
      }

    },
    //处理图片预览效果的事件
    handlePreview (file) {
      // console.log(file);
      this.previewPath = file.response.data.url
      // console.log(this.previewPath);
      //点击图片名称时显示对话框
      this.previewVisible = true
    },
    //处理图片移除事件，可以得到要删除的那个文件列表的信息
    handleRemove (file) {
      // console.log(file);
      //获取将要删除图片的临时路径
      const filePath = file.response.data.tmp_path
      //从pics数组找到这个图片对应的索引值
      const index = this.addForm.pics.findIndex(item => item.pic === filePath)
      //调用数组的splice方法，把图片信息对象从pics数组删除
      this.addForm.pics.splice(index, 1)
      // console.log(this.addForm);
    },
    //监听图片上传成功的事件,可以拿到服务器返回的数据
    handleSuccess (response) {
      // console.log(response);
      //拼接一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      //将返回来的数据push到data里的addForm里的pics数组里
      this.addForm.pics.push(picInfo)
      // console.log(this.addForm);
    },
    // 点击添加商品时触发的函数
    addGood () {
      // console.log(this.addForm);
      // 对表单数据进行预校验
      this.$refs.addFormRef.validate(async valid => {
        // 数据不合法，valid=false，返回
        if (!valid) return this.$message.error('请填写必要的表单项！')
        //因为后台需要的goods_cat是以,分割的字符串,而这里的goods_cat是一个数组
        // 直接进行join的话会报错，因为级联的双向绑定是数组
        //先需要对addForm表单进行深拷贝
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')

        //处理动态参数
        // 循环遍历数组中的每一项，并且以一个对象的形式存储需要的attr_id和attr_value
        //因为attr_value需要的是一个字符串，而attr_vals是一个数组，所以需要join
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          //将newInfo添加进addForm上的attrs数组上
          this.addForm.attrs.push(newInfo)
        })

        //处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          //将newInfo添加进addForm上的attrs数组上
          this.addForm.attrs.push(newInfo)
        })
        //因为我们向后台传递的是form对象，所以需要将addForm上的attrs数组赋值给form上的attrs数组
        form.attrs = this.addForm.attrs
        // console.log(form);

        //发送post请求添加商品
        const { data: res } = await this.$http.post('goods', form)
        //如果发送请求失败
        if (res.meta.status !== 201) return this.$message.error('添加商品失败！')

        this.$message.success('添加商品成功！')
        // console.log(res.data);
        //通过编程式导航跳转到商品列表页面
        this.$router.push('/goods')
      })
    }
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
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>