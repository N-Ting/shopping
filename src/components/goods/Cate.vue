<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 添加分类按钮区域 -->
      <el-row>
        <el-col>
          <el-button
            type="primary"
            @click="addCate"
          >添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 分类表格data为表格的数据源 columns表格各列的配置 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效自定义模板列  slot-scope接受这一行的数据-->
        <template
          slot="isOk"
          slot-scope="scope"
        >
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted===false"
            style="color:lightgreen"
          ></i>
          <i
            class="el-icon-error"
            v-else
            style="color:red"
          ></i>
        </template>
        <!-- 排序自定义模板列 -->
        <template
          slot="order"
          slot-scope="scope"
        >
          <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag
            type="success"
            v-else-if="scope.row.cat_level===1"
          >二级</el-tag>
          <el-tag
            type="warning"
            v-else
          >三级</el-tag>
        </template>
        <!-- 操作自定义模板列 -->
        <template
          slot="opt"
          slot-scope="scope"
        >
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClose"
    >
      <el-form
        ref="addCateFromRef"
        :model="addCateFrom"
        :rules="addCateFromRules"
        label-width="100px"
      >
        <el-form-item
          label="分类名称:"
          prop="cat_name"
        >
          <el-input v-model="addCateFrom.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- options指定数据源  props: 用来指定配置对象  clearable是否支持清空选项  change-on-select: 允许选择一级分类 -->
          <el-cascader
            expand-trigger="hover"
            :options="parentList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentCateChanged"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>

      <!-- 对话框底部区域 -->
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="addCateDialog"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
export default {
  data () {
    return {
      //定义一个查询分类数据的条件对象
      queryInfo: {
        // 表示显示三层分类列表
        type: 3,
        // 当前页码值
        pagenum: 1,
        //每页显示多少条数据
        pagesize: 5
      },
      //定义一个商品分类数据列表数组
      cateList: [],
      //定义一个保存总数据条数
      total: 0,
      //定义表格各列的配置
      columns: [
        {
          //列标题名称
          label: '分类名称 ',
          //对应列内容的属性名
          prop: 'cat_name',
        },
        {
          //列标题名称
          label: '是否有效 ',
          //列类型，可选值有 'template'(自定义列模板)
          type: 'template',
          //列类型为 'template'(自定义列模板) 时，对应的作用域插槽名称
          template: 'isOk',
        },
        {
          //列标题名称
          label: '排序 ',
          //列类型，可选值有 'template'(自定义列模板)
          type: 'template',
          //列类型为 'template'(自定义列模板) 时，对应的作用域插槽名称
          template: 'order',
        },
        {
          //列标题名称
          label: '操作 ',
          //列类型，可选值有 'template'(自定义列模板)
          type: 'template',
          //列类型为 'template'(自定义列模板) 时，对应的作用域插槽名称
          template: 'opt',
        },
      ],
      //不显示添加分类对话框
      addCateDialogVisible: false,
      //添加表单分类的对象
      addCateFrom: {
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        //分类的等级，默认分类的为1级分类
        cat_level: 0
      },
      //表单校验规则对象
      addCateFromRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 3, max: 10, message: '分类名称在3~10个字符之间', trigger: 'blur' }
        ]
      },
      //定义一个获取父级分类的数组
      parentList: [],
      //指定级联的配置对象
      cascaderProps: {
        //指定具体选中的那个值的属性
        value: 'cat_id',
        //指定看到的是那个属性
        label: 'cat_name',
        //父子间嵌套使用的是那个属性
        children: 'children'
      },
      //定义一个保存选中的父级分类的id数组
      selectedKeys: []
    }
  },
  created () {
    //在created函数中可以获取到数据
    this.getCateList()
  },
  methods: {
    //封装一个获取分类数据的函数
    async getCateList () {
      //发送get请求，获取到数据
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      //如果请求失败
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      //将数据列表赋值给cateList
      this.cateList = res.data.result
      //保存总数据条数
      this.total = res.data.total
    },
    //监听pagesize的变化
    handleSizeChange (newSize) {
      //当pagesize发生变化时，将新的值赋值给pagesize
      this.queryInfo.pagesize = newSize
      //重新获取数据
      this.getCateList()
    },
    //当前的页码发生变化
    handleCurrentChange (current) {
      //当页码发生变化时重新赋值
      this.queryInfo.pagenum = current
      //重新获取数据
      this.getCateList()
    },
    //点击添加分类按钮
    addCate () {
      //点击按钮获取到分类的数据
      this.getParentCateList()
      //显示添加分类对话框
      this.addCateDialogVisible = true
    },
    // 定义一个获取父级分类的函数
    async getParentCateList () {
      //发送get请求获取数据
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      //如果请求失败
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      //   console.log(res.data);
      //发送请求成功后将数据保存到data里的parentList里
      this.parentList = res.data
    },
    //级联变化的函数
    parentCateChanged () {

      //如果selectedKeys数组的长度等于0就表示没有选择
      if (this.selectedKeys.length > 0) {
        this.addCateFrom.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateFrom.cat_level = this.selectedKeys.length
        return
      } else {
        //否则的话没有选择
        this.addCateFrom.cat_pid = 0
        this.addCateFrom.cat_level = 0
      }
    },
    //点击确定按钮
    addCateDialog () {
      //对表单数据进行预校验
      this.$refs.addCateFromRef.validate(async valid => {
        if (!valid) return
        //表单数据正确，发送请求
        const { data: res } = await this.$http.post('categories', this.addCateFrom)
        //如果请求失败
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        //添加分类成功
        this.$message.success('添加分类成功')
        //重新调用获取分类函数
        this.getCateList()
        //关闭对话框
        this.addCateDialogVisible = false

      })
    },
    //关闭对话框重置表单
    addCateDialogClose () {
      this.$refs.addCateFromRef.resetFields()
      //重置selectedKeys数组
      this.selectedKeys = []
      //重置表单里的 cat_pid,cat_level
      this.addCateFrom.cat_pid = 0
      this.addCateFrom.cat_level = 0
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>