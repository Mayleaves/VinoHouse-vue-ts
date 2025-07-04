import request from '@/utils/request'
/**
 * 员工管理
 **/
// 登录
export const login = (data: any) =>
  request({
    'url': '/employee/login',
    'method': 'post',
    data: data
  })

  // 退出
 export const userLogout = (params: any) =>
  request({
    'url': `/employee/logout`,
    'method': 'post',
    params  // 当 key 和 value 一样的时候，可以这么简写
  })

// 分页查询
export const getEmployeelist = (params: any) =>
  request({
    'url': `/employee/page`,  // admin 已经在 .env.development 文件中统一添加了
    'method': 'get',
    params: params  // key:value
  })

// 启用禁用员工账号
export const enableOrDisableEmployee = (params: any) =>
  request({
    'url': `/employee/status/${params.status}`,
    'method': 'post',
    params: {id: params.id}
  })

// 新增员工
export const addEmployee = (params: any) =>
  request({
    'url': `/employee`,
    'method': 'post',
    data: params
  })

// 根据 id 查询员工
export const queryEmployeeById = (id: number) =>
  request({
    'url': `/employee/${id}`,
    'method': 'get'
  })

// 修改员工
export const updateEmployee = (params: any) =>
  request({
    'url': `/employee`,
    'method': 'put',
    data: params
  })

export const deleteEmployee = (id: number) =>
  request({
    url: '/employee',
    method: 'delete',
    params: { id: id }  // 必须这么写，后端接收的字段是 id
  })
