<template>
  <div class="dashboard-container">
    <div class="container">
      <div class="table-bar">
        <label class="query-label">套餐名称：</label>
        <el-input class="query-input" placeholder="请输入套餐名称" v-model="name" clearable/> <!-- v-model：双向绑定 -->
        <label class="query-label">套餐分类：</label>
        <el-select class="query-input" v-model="categoryId" placeholder="请选择">
          <el-option
            v-for="item in categoryList"
            :key="item.id"
            :label="item.name"
            :value="item.id">  <!-- 要与后端传过来的字段名一致 -->
          </el-option>
        </el-select>
        <label class="query-label">售卖状态：</label>
        <el-select class="query-input" v-model="status" placeholder="请选择">
          <el-option
            v-for="item in statusArr"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-button type="normal-btn continue"
                   class="query-button"
                   @click="pageQuery()">查询</el-button>
        <div class="tableLab">
          <span class="delBut non"
                @click="handleDelete('批量', null)">批量删除</span>
          <el-button type="primary"
                     class="add-button"
                     @click="handleAdd('add')">+ 新增套餐</el-button>
        </div>
      </div>
      <el-table :data="records" stripe class="tableBox" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="25" />
        <el-table-column prop="name" label="套餐名称" />
        <el-table-column label="图片">
          <template v-slot="scope">
            <el-image class="table-image" :src="scope.row.image"></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="套餐分类" />
        <el-table-column label="售价">
          <template v-slot="scope">
            <span class="price">￥{{ (scope.row.price ).toFixed(2)*100/100 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="售卖状态">
          <template v-slot="scope">
            <div class="tableColumn-status" :class="{ 'stop-use': scope.row.status === 0 }">
              {{ scope.row.status === 0 ? '停售' : '启售' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="最后操作时间" />
        <el-table-column label="操作" align="center" width="250px">
          <template v-slot="scope">
            <el-button type="text" size="small" class="blueBug" @click="handleAdd(scope.row.id)"> 修改 </el-button>
            <el-button type="text" size="small" class="delBut" @click="handleDelete('单删', scope.row.id)"> 删除 </el-button>
            <el-button type="text"
                       size="small"
                       class="non"
                       :class="{
                         blueBug: scope.row.status == '0',
                         delBut: scope.row.status != '0'
                       }"
                       @click="statusHandle(scope.row)">
              {{ scope.row.status == '0' ? '启售' : '停售'  }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pageList"
                     :page-sizes="[10, 20, 30, 40]"
                     :page-size="pageSize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<script lang="ts">
import {getCategoryByType} from '@/api/category'
import {getSetmealPage, enableOrDisableSetmeal, deleteSetmeal} from '@/api/setMeal'
export default {
  // 模型数据
  data() {
    return {
      name: '',               // 套餐姓名，对应 v-model="name"（双向绑定）
      page: 1,                // 页码
      pageSize: 10,           // 每页记录数
      total: 0,               // 总记录数
      records: [],            // 当前页要展示的数据集合
      status: '',             // 售卖状态
      categoryId: '',         // 分类 Id
      categoryList: [],       // 分类数据
      multipleSelection: '',  // 当前表格选中的多个元素
      checkList: [],          // 存储选中的记录
      statusArr: [{
        value: '0',
        label: '停售'
      }, {
        value: '1',
        label: '启售'
      }]
    }
  },
  created() {
    // 动态填充下拉框中的分类数据
    getCategoryByType({type: 2}).then(res => {
      if(res.data.code === 1) {
        this.categoryList = res.data.data
      }
    })
    // 页面加载完成后查询套分页数据
    this.pageQuery()
  },
  methods: {
    // 分页查询
    pageQuery() {
      // 准备请求参数
      const params = { name: this.name, page: this.page, pageSize: this.pageSize, status: this.status, categoryId: this.categoryId}
      // 调用 Ajax 请求
      getSetmealPage(params).then(res => {
        if (res.data.code === 1) {
          this.total = res.data.data.total  // res.data：后端返回数据中的 data；res.data.data：模型数据
          this.records = res.data.data.records
        }
      }).catch(err => {
        this.$message.error('请求出错了：' + err.message)
      })
    },
    // 删除套餐
    handleDelete(type: string, id: string){
      if (type === '批量' && id === null) {
        if (this.checkList.length === 0) {
          return this.$message.error('请选择删除对象')
        }
      }
      // 弹出确认提示框
      this.$confirm('确认要删除当前套餐吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteSetmeal(type === '批量' ? this.checkList.join(',') : id)
          .then(res => {
            if (res && res.data && res.data.code === 1) {
              this.$message.success('删除成功！')
              this.pageQuery()
            } else {
              this.$message.error(res.data.msg)
            }
          }).catch(err => {
            this.$message.error('请求出错了：' + err.message)
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    // 处理选择变化
    handleSelectionChange(selection){
      // 更新选中列表
      this.checkList = selection.map(item => item.id)
    },
    // 新增/修改套餐，跳转到新增页面（组件）
    handleAdd(st: string) {
      if (st === 'add') {  // 新增
        this.$router.push('/setmeal/add')
      } else {  // 修改
        this.$router.push({
          path: '/setmeal/add',
          query: { id: st }
        })
      }
    },
    // 启售、停售套餐
    statusHandle(row){
      // 弹出确认提示框
      this.$confirm('确认要修改当前套餐售卖状态吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const p = {
          id: row.id,
          status: !row.status ? 1: 0  // 0 是 true，1 是 false
        }
        enableOrDisableSetmeal(p).then(res => {
          if(res.data.code === 1){
            this.$message.success('套餐售卖状态修改成功！')
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
    handleSizeChange(pageSize){
      this.pageSize = pageSize
      this.pageQuery()
    },
    handleCurrentChange(page){
      this.page = page
      this.pageQuery()
    }
  }
}
</script>

<style lang="scss">

// 全局样式
.el-table-column--selection .cell {
  padding-left: 10px;
}

// 组件样式
.dashboard-container {
  margin: 30px;

  .container {
    background: #fff;
    position: relative;
    z-index: 1;
    padding: 30px 28px;
    border-radius: 4px;

    .table-bar {
      margin-bottom: 20px;

      .tableLab {
        display: inline-block;
        float: right;

        span {
          cursor: pointer;
          display: inline-block;
          font-size: 14px;
        }
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

      .add-button{
        margin-left: 30px;
      }
    }

    .tableBox {
      width: 100%;
      border: 1px solid $gray-5;
      border-bottom: 0;
    }

    .table-image {
      width: 80px;
      height: 40px;
      border: none;
    }

    .price {
      margin-right: 10px;
    }

    .pageList {
      text-align: center;
      margin-top: 30px;
    }

    // 查询黑色按钮样式
    .normal-btn {
      background: #333333;
      color: white;
      margin-left: 20px;
    }
  }
}
</style>
