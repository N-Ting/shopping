<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="10">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button
            type="primary"
            @click="addDialogVisible=true"
          >添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table
        :data="userList"
        border
        stripe
      >
        <el-table-column type="index"></el-table-column>
        <el-table-column
          label="姓名"
          prop="username"
        ></el-table-column>
        <el-table-column
          label="邮箱"
          prop="email"
        ></el-table-column>
        <el-table-column
          label="电话"
          prop="mobile"
        ></el-table-column>
        <el-table-column
          label="角色"
          prop="role_name"
        ></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <!-- 给switch组件设置change事件 -->
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="180px"
        >
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- Dialog对话框 -->
      <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed"
      >
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="70px"
        >
          <el-form-item
            label="用户名"
            prop="username"
          >
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item
            label="密码"
            prop="password"
          >
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item
            label="邮箱"
            prop="email"
          >
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item
            label="电话"
            prop="mobile"
          >
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 对话框底部区域 -->
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="addUser"
          >确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户信息对话框 -->
      <el-dialog
        title="修改用户信息"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClose"
      >
        <el-form
          ref="editFormRef"
          :model="editForm"
          :rules="editFormRules"
          label-width="70px"
        >
          <el-form-item label="用户名称">
            <el-input
              v-model="editForm.username"
              disabled
            ></el-input>
          </el-form-item>
          <el-form-item
            label="邮箱"
            prop="email"
          >
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item
            label="电话"
            prop="mobile"
          >
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="editUser"
          >确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配角色对话框 -->
      <el-dialog
        title="分配角色"
        :visible.sync="setRoleDialogVisible"
        width="50%"
      >
        <div>
          <p>当前的用户：{{userInfo.username}}</p>
          <p>当前的角色：{{userInfo.role_name}}</p>
          <p>分配新角色:
            <el-select
              v-model="selectedRoleId"
              placeholder="请选择"
            >
              <el-option
                v-for="item in rolesList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              ></el-option>
            </el-select>
          </p>
        </div>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button @click="setRoleDialogVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="saveRoleInfo"
          >确 定</el-button>
        </span>
      </el-dialog>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>

</template>

<script>
export default {
  data () {
    //验证邮箱的自定义规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (regEmail.test(value)) {
        return cb()
      }
      //返回一个错误提示
      cb(new Error('请输入合法的邮箱'))
    }
    //验证手机号码的规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1[34578]\d{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      //返回一个错误提示
      cb(new Error('请输入合法的手机号码'))
    }
    return {
      //获取查询用户信息的参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      //保存请求回来的数据
      userList: [],
      //每页的总条数
      total: 0,
      //是否显示添加用户弹出框
      addDialogVisible: false,
      //添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      //添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名在3~10个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '用户名在6~15个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, message: '邮箱格式不正确，请重新输入', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, message: '手机号码不正确，请重新输入', trigger: 'blur' }
        ]
      },
      //控制修改用户对话框的显示与否
      editDialogVisible: false,
      //修改用户的表单数据
      editForm: {
        username: '',
        email: '',
        mobile: ''
      },
      //修改表单的验证规则对象
      editFormRules: {
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          {
            validator: checkEmail,
            message: '邮箱格式不正确，请重新输入',
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号码',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            message: '手机号码不正确，请重新输入',
            trigger: 'blur'
          }
        ]
      },
      //获取当前行的角色数据
      userInfo: '',
      //不显示分配角色对话框
      setRoleDialogVisible: false,
      selectedRoleId: '',
      rolesList: []
    }


  },
  created () {
    //刷新时回去用户列表数据
    this.getUserList()
  },
  methods: {
    async getUserList () {
      //发送请求获取用户列表数据,并传入参数，data：res解构将data种命名为res
      const { data: res } = await this.$http.get('/users', { params: this.queryInfo })
      // console.log(res);
      //如果返回状态不等于200.表示异常，并且返回
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      //返回成功，就将请求的状态保存在data中的userList
      this.userList = res.data.users
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      //当pagesize改变触发，当pagesize发生改变的时候，我们应该以最新的pagesize啦i请求数据病展示数据
      // console.log(newSize);
      this.queryInfo.pagesize = newSize
      //重新按照pagesize发送请求，请求最新的数据
      this.getUserList()
    },
    handleCurrentChange (current) {
      //当页码改变时触发current发生改变的时候，我们应该以最新的current页码来请求数据并展示数据
      // console.log(current);
      this.queryInfo.pagenum = current
      //重新按照pagenum发送请求，请求最新的数据
      this.getUserList()
    },
    async userStateChanged (row) {
      //发送请求进行状态的修改
      const { data: res } = await this.$http.put(`users/${row.id}/state/${row.mg_state}`)
      //如果返回的状态为异常状态则报错并返回
      if (res.meta.status !== 200) {
        // 将状态值取反 
        row.mg_state = !row.mg_state
        //并提示信息
        return this.$message.error('修改状态失败')
      }
      this.$message.succes('更新状态成功')
    },
    addDialogClosed () {
      //对话关闭之后,重置表单
      this.$refs.addFormRef.resetFields()
    },
    addUser () {
      //点击确定按钮添加新用户
      //调用validate进行表单验证
      this.$refs.addFormRef.validate(async valid => {
        //如果valid为false,提示信息
        if (!valid) return this.$message.error('请填写完整用户信息')
        //发送请求完成添加用户的操作
        const { data: res } = await this.$http.post('/users', this.addForm)
        //判断如果添加失败,就做提示
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        //添加成功的提示
        this.$message.success('添加用户成功')
        //成功后关闭对话框
        this.addDialogVisible = false
        //并且重新请求最新的数据
        this.getUserList()
      })
    },
    //展示编辑用户的对话框
    async showEditDialog (id) {
      //发送请求根据id获取用户信息
      const { data: res } = await this.$http.get('users/' + id)
      //判断如果添加失败,就提示用户
      if (res.meta.status !== 200) return this.$message.error("修改用户信息失败")
      //添加成功,就将获取到的数据保存到数据editForm
      this.editForm = res.data
      //显示对话框
      this.editDialogVisible = true
    },
    //对话框关闭之后,重置表单
    editDialogClose () {
      // 通过引用对象(表单对象),使用重置表单的方法
      this.$refs.editFormRef.resetFields()
    },
    //验证修改表单的数据
    editUser () {
      //用户点击修改表单的确定按钮后,进行表单的预校验
      this.$refs.editFormRef.validate(async valid => {
        //判断数据是否正确
        if (!valid) return this.$message.error('请填写正确的用户信息')
        //数据正确发送修改请求
        // console.log(this.editForm.id);
        // 通过表单数据对象可以拿到id,发送put请求时指定id,将需要修改的数据参数传入
        const { data: res } = await this.$http.put('users/' + this.editForm.id, this.editForm)
        //如果状态码异常,提示用户修改信息失败
        if (res.meta.status !== 200) return this.$message.error('修改用户信息失败')

        //修改成功后关闭对话框
        this.editDialogVisible = false

        //并且重新调用获取用户下信息函数,获取最新用户数据
        this.getUserList()
        //修改用户信息成功,提示用户修改成功
        this.$message.success('修改用户信息成功')
      })
    },
    //删除用户事件
    async removeUserById (id) {
      //弹出确定取消框,是否删除用户,因为confirmResult为一个,可以使用.catch捕获所有的错误,并且返回
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(confirmResult);
      //如果用户点击确认,则confirmResult打印结果为confirm
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除') //当confirmResult不等于字符串confirm时,提示用户取消
      //点击确认,发送delete请求
      const { data: res } = await this.$http.delete('users/' + id)
      //判读状态码是否异常,提示用户删除失败
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      this.$message.success('删除用户成功')

      //判断这一页的tr是否等于1
      if (this.userList.length === 1) {
        // 用三元表达式判断页数是否大于1, 大于1页数 - 1, 否则就等于1
        this.queryInfo.pagenum = this.queryInfo.pagenum > 1 ? this.queryInfo.pagenum - 1 : 1
      }
      //并且重新调用获取用户信息数据函数
      this.getUserList()
    },
    //分配角色
    async setRole (userInfo) {
      //
      this.userInfo = userInfo
      //展示对话框之前，获取所有的角色列表
      const { data: res } = await this.$http.get('roles')
      //如果获取失败
      if (res.meta.status !== 200) return this.$message.error('获取角色失败')
      //成功就保存数据
      this.rolesList = res.data
      //显示张开对话框
      this.setRoleDialogVisible = true

    },
    //点击按钮，分配角色
    async saveRoleInfo () {
      //没有选中角色
      if (!this.selectedRoleId) return this.$message.error('请选择要分配的角色')
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      if (res.meta.status !== 200) {
        return this.$message.error('更新用户角色失败')
      }
      this.$message.success('更新用户角色成功')
      // 更新用户信息列表
      this.getUserList()
      //关闭对话框
      this.setRoleDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
</style>