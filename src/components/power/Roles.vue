<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button
            type="primary"
            @click="addRoledialogVisible=true"
          >添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table
        :data="rolesList"
        border
        stripe
      >
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- <pre>
              {{scope.row}}
            </pre> -->
            <el-row
              :class="['bdbottom' ,i1==0 ? 'bdtop':'','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 第一个列渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRight(scope.row,item1.id)"
                > {{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 第一个列渲染二级、三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环，嵌套渲染二级权限 -->
                <el-row
                  :class="[i2===0 ? '':'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRight(scope.row,item2.id)"
                    > {{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>

                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3,i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRight(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column
          label="角色名称"
          prop="roleName"
        ></el-table-column>
        <el-table-column
          label="角色描述"
          prop="roleDesc"
        ></el-table-column>
        <el-table-column
          label="操作"
          width="300px"
        >
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
            >编辑</el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
            >删除</el-button>
            <!-- 分配权限 -->
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加角色对话框 -->
      <el-dialog
        title="添加角色"
        :visible.sync="addRoledialogVisible"
        width="30%"
        @close="addRolehandleClose"
      >
        <el-form
          :model="addRoleForm"
          :rules="addRoleFormRules"
          ref="addFormRef"
          label-width="70px"
        >
          <el-form-item
            label="角色名称"
            prop="roleName"
          >
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item
            label="角色描述"
            prop="roleDesc"
          >
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 添加角色对话框底部 -->
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button @click="addRoledialogVisible= false">取 消</el-button>
          <el-button
            type="primary"
            @click="addRoledialogVisible = false"
          >确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配角色对话框 -->
      <el-dialog
        title="提示"
        :visible.sync="setRightDialogVisible"
        width="50%"
        @close="setRightDialogClose"
      >
        <!-- 树形结构 data代表数据绑定 props是指定树形结构的文本是以什么属性绑定的，或者说通过那个属性来实现父子间的嵌套 default-expand-all为true展开所有节点-->
        <el-tree
          :data="rightList"
          :props="treeProps"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defKeys"
          ref="treeRef"
        ></el-tree>

        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="allotRights"
          >确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      //所有角色列表数据
      rolesList: [],
      //显示是否淡出添加角色对话框
      addRoledialogVisible: false,
      //添加角色的表单数据
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      //校验角色表单的数据
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '角色名称在3~10个字符之间', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 3, max: 10, message: '角色描述在3~10个字符之间', trigger: 'blur' }
        ]


      },
      //是否显示角色分配对话框
      setRightDialogVisible: false,
      //获取权限数据
      rightList: [],
      //树形控件的属性的绑定
      treeProps: {
        //父子间的嵌套以那种属性
        children: 'children',
        //看到的文本是那个数据字段
        label: 'authName'
      },
      //设置树形控件中默认选中的内容
      defKeys: [],
      //保存角色的id
      rolesId: ''

    }
  },
  created () {
    //加载组件时,就渲染角色列表数据
    this.getRoleList()
  },
  methods: {
    async getRoleList () {
      //发送获取角色列表数据的请求
      const { data: res } = await this.$http.get('roles')
      //判断状态码是否异常
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      //成功后将数据保存到data里的rolesList里
      this.rolesList = res.data
      // console.log(this.rolesList); 
    },
    addRolehandleClose () {
      //添加角色对话框关闭，重置表单
    },
    //删除权限
    async removeRight (roles, id2) {
      // 点击时触发
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete(`roles/${roles.id}/rights/${id2}`)
      //如果状态码异常表示删除失败
      if (res.meta.status !== 200) return this.$message.error('删除权限失败')
      // 删除成功，重新调用获取列表函数,会刷新列表不建议
      // this.getRoleList()
      //返回的data数据时最新的，只需要  为角色信息重新赋值
      roles.children = res.data
    },
    // 点击时弹出对话框
    async showSetRightDialog (role) {
      //将获取到的角色id保存起来以供权限时使用
      this.roleId = role.id
      //获取到所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      // 判断是否成功
      if (res.meta.status !== 200) return this.$message.error('获取权限失败')
      //成功就将数据保存到data里
      this.rightList = res.data
      // console.log(this.rightList);
      //在显示对话框之前调用递归
      this.getLeafKeys(role, this.defKeys)
      //点击时显示对话框
      this.setRightDialogVisible = true
      // console.log(this.defKeys);
    },
    // 该函数会获取到所有三级权限id并添加到defKeys中
    getLeafKeys (node, arr) {
      //如果没有children这个属性,就表示node为三级权限
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => this.getLeafKeys(item, arr))
    },
    //关闭对话框的时候
    setRightDialogClose () {
      //清空defKeys数组
      this.defKeys = []
    },
    //点用户在属性对话框中点击确定按钮，将用户选择的权限发送
    async allotRights () {
      // 通过树形结构的引用对象，可以调用getCheckedKeys方法获取到所有选中的节点，和getHalfCheckedKeys方法可以获取到所有半选中的节点
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      //将数组转换为凭借字符串
      const idStr = keys.join(',')
      //发送post请求完成更新
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败');

      this.$message.success('分配权限成功');
      this.getRoleList();
      //关闭对话框
      this.setRightDialogVisible = false;

    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>