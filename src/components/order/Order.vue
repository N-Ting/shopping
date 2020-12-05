<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 搜索区域 -->
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            clearable
          >
            <el-button
              slot="append"
              icon="el-icon-search"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表表格区域 -->
      <el-table
        :data="orderList"
        border
        stripe
      >
        <el-table-column type="index"></el-table-column>
        <el-table-column
          label="订单编号"
          prop="order_number"
        ></el-table-column>
        <el-table-column
          label="订单价格"
          prop="order_price"
        ></el-table-column>
        <el-table-column
          label="是否付款"
          prop="pay_status"
        >
          <template slot-scope="scope">
            <el-tag
              type="success"
              v-if="scope.row.pay_status==='1'"
            >已付款</el-tag>
            <el-tag
              type="danger"
              else
            >未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="是否发货"
          prop="is_send"
        ></el-table-column>
        <el-table-column
          label="下单时间"
          prop="create_time"
        >
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showBox"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showProgressBox"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 修改对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
      width="50%"
    >
      <!-- 表单区域 -->
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item
          label="省市区/县"
          prop="address1"
        >
          <el-cascader
            v-model="addressForm.address1"
            :options="CityData"
            :props="props"
          ></el-cascader>
        </el-form-item>
        <el-form-item
          label="详细地址"
          prop="address2"
        >
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="addressVisible = false"
        >确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流进度对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressVisible"
      width="50%"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(activity,index)
          in
          progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
//导入省市区
import CityData from './citydata.js'
export default {
  data () {
    return {
      // 查询参数对象
      queryInfo: {
        //查询参数 
        query: '',
        //当前的页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 10
      },
      //总条数
      total: 0,
      //保存订单列表数据的数组
      orderList: [],
      //隐藏修改地址对话框
      addressVisible: false,
      //修改订单表单的数据对象
      addressForm: {
        address1: [],
        address2: ''
      },
      //校验修改订单表单数据规则
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' },
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' },
        ]
      },
      //省市区级联选择器的数据源
      CityData,
      props: {
        expandTrigger: 'hover'
      },
      //不显示物流对话框
      progressVisible: false,
      progressInfo: []

    }
  },
  created () {
    //在created函数中可以快速获取到订单列表数据
    this.getOrderList()
  },
  methods: {
    //监听获取订单列表的事件
    async getOrderList () {
      //发送get请求
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      //如果请求失败
      if (res.meta.status !== 200) return this.$message.error('获取订单列表失败！')
      //   console.log(res.data);
      //将数据保存到data里面的orderLIst数组中
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    //当显示条数发生变化时
    handleSizeChange (newSize) {
      //将变化后的值赋值给pagesize
      this.queryInfo.pagesize = newSize
      //重新调用获取商品列表的函数
      this.getOrderList()
    },
    // 当显示的页码发生变化时
    handleCurrentChange (current) {
      //将变化后的值赋值给pagenum
      this.queryInfo.pagenum = current
      //重新调用获取商品列表的函数
      this.getOrderList()
    },
    //点击修改按钮时触发的事件
    showBox () {
      this.addressVisible = true
    },
    //点击物流按钮时触发的事件
    async showProgressBox () {
      //发送请求,获取物流数据
      const { data: res } = await this.$http.get('kuaidi/DPK210206915703')
      //请求失败
      if (res.meta.status !== 200) return this.$message.error('获取物流进度失败!')
      //将获取到数据保存下来
      this.progressInfo = res.data
      //显示物流进度对话框
      this.progressVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>