<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 警告 -->
      <el-alert
        title="注意:只允许为第三级分类设置相关参数!"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 选择商品分类的级联 -->
          <el-cascader
            v-model="slectedKeys"
            :options="catelist"
            :props="cateProps"
            @change="parentCateChanged"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tabs页区域 -->
      <el-tabs
        v-model="activeName"
        @tab-click="handleTabClick"
      >
        <el-tab-pane
          label="动态参数"
          name="many"
        >
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisable"
            @click="addDialogVisible=true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table
            :data="manyTableData"
            border
            stripe
          >
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag
                  v-for="(item1,i1) in scope.row.attr_vals"
                  :key="i1"
                  closable
                  @close="handleClose(i1,scope.row)"
                >{{item1}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="showeditDialogVisible(scope.row.attr_id)"
                  size="mini"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane
          label="静态属性"
          name="only"
        >
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisable"
            @click="addDialogVisible=true"
          >添加属性</el-button>
          <!-- 动态参数表格 -->
          <el-table
            :data="onlyTableData"
            border
            stripe
          >
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag
                  v-for="(item1,i1) in scope.row.attr_vals"
                  :key="i1"
                  closable
                  @close="handleClose(i1,scope.row)"
                >{{item1}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showeditDialogVisible(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogclosed"
    >
      <!-- 添加参数的表格 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item
          :label="titleText"
          prop="attr_name"
        >
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框的底部区域 -->
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="addParams"
        >确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogVisibleClose"
    >
      <!-- 修改参数的表格 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item
          :label="titleText"
          prop="attr_name"
        >
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框的底部区域 -->
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="editParams"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      //定义保存商品分类数据的数组
      catelist: [],
      //指定级联配置的对象
      cateProps: {
        //指定具体选中的那个值的属性
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        //鼠标滑过显示
        expandTrigger: 'hover'
      },
      //保存选中的父级id的数组
      slectedKeys: [],
      //被激活的页签名称
      activeName: 'many',
      //动态参数的数据
      manyTableData: [],
      //静态属性的数据
      onlyTableData: [],
      //添加动态参数/静态属性的表单数据对象
      addForm: {
        attr_name: ''
      },
      //默认不显示添加参数对话框
      addDialogVisible: false,
      //校验添加参数表单的数据
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
        ]
      },
      //校验修改参数表单数据
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
        ]
      },
      //修改参数的表单数据对象
      editForm: {
      },
      //默认不显示修改参数对话框
      editDialogVisible: false,
    }
  },
  created () {
    //调用获取商品分类的函数
    this.getCateList()
  },
  computed: {
    //如果按钮需要被禁用则返回true负责就是false
    isBtnDisable () {
      //判断slectedKeys长度是否等于3
      if (this.slectedKeys.length !== 3) return true
      return false
    },
    //当前选中的3级分类的ID
    cateId () {
      //如果数组的长度等于3,就返回数组中最后一个元素
      if (this.slectedKeys.length === 3) return this.slectedKeys[2]
      //否则的话就返回空
      return null
    },
    // 计算是否为添加
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    },

  },
  methods: {
    //获取所有的商品分类列表
    async getCateList () {
      //发送get请求
      const { data: res } = await this.$http.get('categories')
      //请求失败
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      //请求成功就将数据保存到catelist数组中
      this.catelist = res.data
    },
    //级联选中项变化会触发的函数
    parentCateChanged () {
      //级联发生变化时,页需要获取参数列表
      this.getParamsData()
    },

    //tab页签点击事件处理函数
    handleTabClick () {
      //点击tab切换时,调用函数获取列表
      this.getParamsData()
    },
    //获取参数列表
    async getParamsData () {
      //   如果slectedKeys数组的长度不等于3就表示选中的不是三级分类
      if (this.slectedKeys.length !== 3) {
        //清空保存父级id的数组
        this.slectedKeys = []
        //清空动态参数的数组
        this.manyTableData = []
        //清空静态参数的数组
        this.onlyTableData = []
        return

      }
      //表示选中的是三级分类,发送get请求,获取参数列表
      //console.log(this.slectedKeys);
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      })
      //如果请求失败
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
      //   console.log(res.data);
      //遍历每一个参数列表数据
      res.data.forEach(item => {
        //判断item.attr_vals是否为空,如果不为空,就以空格进行分割,否则就返回空数组
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        //控制文本框的隐藏
        item.inputVisible = false
        //文本框输入的值
        item.inputValue = ''
      })
      console.log(res.data);

      //如果请求成功
      //判断tab栏是否为many
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    //点击添加参数对话框的确定按钮时触发的函数
    addParams () {
      //点击确定按钮对表单数据进行预校验
      this.$refs.addFormRef.validate(async valid => {
        //如果数据不合法则返回
        if (!valid) return
        //数据合法发送post请求
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName,
        })
        //如果发送请求失败
        if (res.meta.status !== 201) return this.$message.error('添加参数失败')
        //如果发送请求成功,就提示
        this.$message.success('添加参数成功')
        //关闭对话框
        this.addDialogVisible = false
        //重新获取参数列表,渲染页面
        this.getParamsData()
      })
    },
    //关闭对话框时,清空表单数据
    addDialogclosed () {
      //引用表单对象重置表单数据
      this.$refs.addFormRef.resetFields()
    },
    // 关闭修改参数对话框时,重置表单
    editDialogVisibleClose () {
      this.$refs.editFormRef.resetFields()
    },
    //点击编辑按钮时触发的函数,接受到当前这一行的id值
    async showeditDialogVisible (id) {
      //发送get请求
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      //如果请求失败
      if (res.meta.status !== 200) return this.$message.error('获取分类失败')
      //请求成功就将数据保存到data里的editForm里
      this.editForm = res.data
      //   console.log(this.editForm);
      //显示对话框
      this.editDialogVisible = true
    },
    // / 点击修改参数对话框的确定按钮时触发的函数
    editParams () {
      //对表单数据进行预校验
      this.$refs.editFormRef.validate(async valid => {
        //如果数据不合法
        if (!valid) return
        //数据合法,则发送put请求
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName,
          attr_vals: this.editForm.attr_vals
        })
        //如果请求失败
        if (res.meta.status !== 200) return this.$message.error('修改参数失败')
        //请求成功
        this.$message.success('修改参数成功')
        //重新调用参数列表,渲染页面
        this.getParamsData()
        //不显示对话框
        this.editDialogVisible = false
      })
    },
    //点击删除按钮触发的函数
    async removeParams (attrId) {
      //提示框
      const cofirmResult = await this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      //   console.log(cofirmResult);
      if (cofirmResult !== 'confirm') return this.$message.info('已取消')
      //发送delete请求
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      //发送请求失败
      if (res.meta.status !== 200) return this.$message.error('删除参数失败')
      //发送请求成功
      this.$message.success('删除参数成功')
      //重新调用参数列表,渲染页面
      this.getParamsData()
    },
    // 文本框失去焦点,或按下enter键都会触发
    handleInputConfirm (row) {
      //   console.log('ok');
      //如果去掉前后的空格后的长度等于0
      if (row.inputValue.trim().length === 0) {
        //将文本框清空
        row.inputValue = ''
        //   隐藏文本框
        row.inputVisible = false
        return
      }
      //如果没有返回就继续后续处理
      //   将文本框里合法的数据保存到attr_vals数组里
      row.attr_vals.push(row.inputValue.trim())
      //保存后清空文本框的内容
      row.inputValue = ''
      //隐藏文本框
      row.inputVisible = false
      //调用put函数
      this.saveAttrVals(row)

    },
    //封装一个发送put请求的函数,将对attr_vals的操作保存到数据库
    async saveAttrVals (row) {
      //发送put
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      //如果请求失败
      if (res.meta.status !== 200) return this.$message.error('修改属性值失败')
      this.$message.success('修改属性成功')
    },
    //点击按钮,展示文本框
    showInput (row) {
      //控制文本框的显示与隐藏
      row.inputVisible = true
      //让文本框自动获取焦点
      //$nextTick方法的作用就是当页面元素被重新渲染完之后,才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    //关闭Tag标签,要获得当前的下标,和这一行的数据,因为时要删除这一行数据的attr_vals里的内容
    handleClose (i, row) {
      //删除当前的下标,删除1项
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 5px;
}
.input-new-tag {
  width: 120px;
}
</style>