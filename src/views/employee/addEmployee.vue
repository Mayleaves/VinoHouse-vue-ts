<template>
  <div class="addBrand-container">
    <div class="container">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="180px">
        <el-form-item label="账号" prop="username">
          <el-input v-model="ruleForm.username"
                    placeholder="请填写账号"
                    :disabled="isAdminUsername"></el-input>
        </el-form-item>
        <el-form-item label="员工姓名" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请填写员工姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="ruleForm.phone" placeholder="请填写手机号"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
            <el-radio v-model="ruleForm.sex" label="1">男</el-radio>
            <el-radio v-model="ruleForm.sex" label="0">女</el-radio>
        </el-form-item>
        <el-form-item label="身份证号" prop="idNumber">
          <el-input v-model="ruleForm.idNumber" placeholder="请填写身份证号"></el-input>
        </el-form-item>
        <div class="subBox">
          <el-button type="normal-btn continue" @click="submitForm('ruleForm',false)">保存</el-button>
          <el-button
            v-if="this.optType === 'add'"
            type="primary"
            @click="submitForm('ruleForm',true)">保存并继续添加员工
          </el-button>
          <el-button @click="() => this.$router.push('/employee')">返回</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts">
import {addEmployee, queryEmployeeById, updateEmployee} from '@/api/employee'

export default {
  data() {
    const MOBILE_REG = /^1[3-9]\d{9}$/;
    const ID_CARD_REG_18 = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
    const ID_CARD_REG_15 = /^[1-9]\d{5}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}$/;

    return {
      optType: '',  // 当前操作类型：新增/修改
      isAdminUsername: false,  // 标记 username 是否为 admin
      ruleForm: {
        name: '',
        username: '',
        sex: '1',  // 默认为男
        phone: '',
        idNumber: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入员工姓名', trigger: 'blur' }
        ],
        username: [
          { required: true, message: '请输入员工账号', trigger: 'blur' }
        ],
        phone: [
          {
            required: true,
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error('请输入手机号！'));
              } else if (!MOBILE_REG.test(value)) {
                callback(new Error('请输入正确的手机号！'));
              } else {
                callback();
              }
            }
          }
        ],
        idNumber: [
          {
            required: true,
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error('请输入身份证号！'));
              } else if (!ID_CARD_REG_18.test(value) && !ID_CARD_REG_15.test(value)) {
                callback(new Error('请输入正确的身份证号！'));
              } else {
                callback();
              }
            }
          }
        ]
      }
    }
  },
  created() {  // 自动执行
    // 获取路由参数（id），如果有则为修改操作，否则为新增操作
    this.optType = this.$route.query.id ? 'update': 'add'
    if(this.optType === 'update') {
      this.loadEmployeeData();  // 数据回显
    }
  },
  methods: {
    submitForm(formName, isContinue) {
      // 进行表单校验
      this.$refs[formName].validate((valid) => {
        if(valid) {
          // 表单校验通过，调用 Ajax 请求
          if(this.optType === 'add'){  // 新增操作
            addEmployee(this.ruleForm).then((res) => {
              if(res.data.code === 1) {
                this.$message.success('员工添加成功！')
                if(isContinue) {  // 继续添加，清空表单
                  this.ruleForm = {
                    name: '',
                    username: '',
                    sex: '1',  // 默认为 男
                    phone: '',
                    idNumber: ''
                  }
                } else {
                  this.$router.push('/employee')
                }
              } else {
                this.$message.error(res.data.msg)
              }
            })
          } else {  // 修改操作
            updateEmployee(this.ruleForm).then((res) => {
              if (res.data.code === 1) {
                this.$message.success('员工信息修改成功！')
                this.$router.push('/employee')
              }
            })
          }
        } else {
          this.$message.error('表单校验失败！')
        }
      })
    },
    loadEmployeeData() {
      queryEmployeeById(this.$route.query.id).then(res => {
        if (res.data.code === 1) {
          this.ruleForm = res.data.data;
          // 检查 username 是否为 admin，并标记状态
          this.isAdminUsername = this.ruleForm.username === 'admin';
        }
      });
    },
  }
}
</script>

<style lang="scss" scoped>
.addBrand {
  &-container {
    margin: 30px;
    margin-top: 30px;
    .HeadLable {
      background-color: transparent;
      margin-bottom: 0px;
      padding-left: 0px;
    }
    .container {
      position: relative;
      z-index: 1;
      background: #fff;
      padding: 30px;
      border-radius: 4px;
      // min-height: 500px;
      .subBox {
        padding-top: 30px;
        text-align: center;
        border-top: solid 1px $gray-5;
      }
    }
    .idNumber {
      margin-bottom: 39px;
    }

    .el-form-item {
      margin-bottom: 29px;
    }
    .el-input {
      width: 293px;
    }
  }
}
</style>
