<template>
  <div class="dashboard-container">
    <div class="container">
      <div class="table-bar">
        <label class="query-label">员工姓名：</label>
        <el-input class="query-input" placeholder="请输入员工姓名" v-model="name" clearable/> <!-- v-model：双向绑定 -->
        <el-button type="normal-btn continue"
                   class="query-button"
                   @click="pageQuery()">查询</el-button>
        <el-button type="primary"
                   class="add-button"
                   @click="handleAddEmp()">+ 添加员工</el-button>
      </div>
      <el-table class="tableBox"
        :data="records"
        stripe
        style="width: 100%">
        <el-table-column
          prop="name"
          label="员工姓名"
          width="180">
        </el-table-column>
        <el-table-column
          prop="username"
          label="账号"
          width="180">
        </el-table-column>
        <el-table-column
          prop="phone"
          label="手机号">
        </el-table-column>
        <el-table-column
          prop="sex"
          label="性别">
          <template v-slot="scope">
            {{scope.row.sex === "0" ? '女': '男'}}
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="帐号状态">
          <template v-slot="scope">
            {{scope.row.status === 0 ? '禁用': '启用'}}
          </template>
        </el-table-column>
        <el-table-column
          prop="updateTime"
          label="最后操作时间">
        </el-table-column>
        <el-table-column v-if="currentUser.username === 'admin'"
                         label="操作"
                         width="250"
                         align="center">  <!-- 仅在管理员登录时，呈现以下内容 -->
          <template v-slot="scope">
            <el-button type="text"
                       size="small"
                       class="blueBug"
                       @click="handleUpdateEmp(scope.row)">修改</el-button>
            <el-button type="text"
                       size="small"
                       class="delBut"
                       :disabled="scope.row.username === 'admin'"
                       @click="handleDelete(scope.row)"> 删除 </el-button>
            <el-button type="text"
                       size="small"
                       class="non"
                       :class="{
                         blueBug: scope.row.status == '0',
                         delBut: scope.row.status != '0'
                       }"
                       :disabled="scope.row.username === 'admin'"
                       @click="handleStarEorStop(scope.row)">{{scope.row.status === 1 ? '禁用': '启用'}}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pageList"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script lang="ts">
import { getEmployeelist, enableOrDisableEmployee, deleteEmployee } from '@/api/employee'

export default {
  name: "EmployeeSearchForm",
  // 模型数据
  data() {
    return {
      name: '',        // 员工姓名，对应 v-model="name"（双向绑定）
      page: 1,         // 页码
      pageSize: 10,    // 每页记录数
      total: 0,        // 总记录数
      records: [],     // 当前页要展示的数据集合
      currentUser: {}  // 存储当前登录用户
    }
  },
  created() {  // 自动执行
    // 从 localStorage 获取当前用户
    const user = localStorage.getItem('currentUser');
    this.currentUser = user ? JSON.parse(user) : {};
    this.pageQuery()
  },
  methods: {
    // 分页查询
    pageQuery() {
      // 准备请求参数
      const params = {name: this.name, page: this.page, pageSize: this.pageSize}
      // 调用 Ajax 请求
      getEmployeelist(params).then(res => {
        if(res.data.code === 1){
          this.total = res.data.data.total  // res.data：后端返回数据中的 data；res.data.data：模型数据
          this.records = res.data.data.records
        }
      }).catch(err => {
        this.$message.error('请求出错了：' + err.message)
      })
    },
    // pageSize 发生变化时触发
    handleSizeChange(pageSize){
      this.pageSize = pageSize
      this.pageQuery()
    },
    // page 发生变化时触发
    handleCurrentChange(page){
      this.page = page
      this.pageQuery()
    },
    // 启用禁用员工账号
    handleStarEorStop(row){  // row：表格每行的数据
      if(row.username ==='admin') { // 冗余校验，确保安全
        this.$message.error('admin 为系统的管理员账号，禁止修改账号状态！')
        return
      }
      // 弹出确认提示框
      this.$confirm('确认要修改当前员工账号状态吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const p = {
          id: row.id,
          status: !row.status ? 1: 0  // 0 是 true，1 是 false
        }
        enableOrDisableEmployee(p).then(res => {
          if(res.data.code === 1){
            this.$message.success('员工的账号状态修改成功！')
            this.pageQuery()
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消修改'
        });
      });
    },
    // 跳转到新增员工页面（组件）
    handleAddEmp(){
      // 路由跳转，跳转到新增员工组件
      this.$router.push('/employee/add')  // 简写
    },
    // 跳转到修改员工页面（组件）
    handleUpdateEmp(row){
      // 跳转到修改页面，通过地址栏传递参数
      this.$router.push({
        path: '/employee/add',  // 修改 ⊂ 新增
        query: {id: row.id}  // 修改员工路由地址仅比新增员工路由地址多一个 id
      })
    },
    // 删除员工
    handleDelete(row){
      if(row.username ==='admin') { // 冗余校验，确保安全
        this.$message.error('admin 为系统的管理员账号，禁止删除账户！')
        return
      }
      // 弹出确认提示框
      this.$confirm('确认要删除当前员工吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteEmployee(row.id).then(res => {
          if(res.data.code === 1){
            this.$message.success('员工账户删除成功！')
            this.pageQuery()
          } else {
            this.$message.error(res.data.msg)
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
  }
}
</script>

<style lang="scss" scoped>
//查询黑色按钮样式
.normal-btn {
  background: #333333;
  color: white;
  margin-left: 20px;
}

.table-bar {
  margin-bottom: 20px;

  .add-button {
    display: inline-block;
    float: right;

  }

  .query-label {
    margin-right: 10px;
  }

  .query-input {
    width: 14%;
    margin-right: 20px;
  }

  .query-button {
    margin-right: 20px;
  }

}

.tableBox {
  width: 100%;
  border: 1px solid $gray-5;
  border-bottom: 0;
  margin-top: 20px;
}

.pageList {
  text-align: center;
  margin-top: 30px;
}

</style>
