/**
 * 路由别名，方便快速找到页面，同时可以用作路由跳转
 */

/** 路由别名 */
export enum RoutesAlias {
  Layout = '/index/index', // 布局容器
  Login = '/auth/login', // 登录
  ForgetPassword = '/auth/forget-password', // 忘记密码
  Exception403 = '/exception/403', // 403
  Exception404 = '/exception/404', // 404
  Exception500 = '/exception/500', // 500
  Dashboard = '/dashboard/console', // 工作台
  Analysis = '/dashboard/analysis', // 分析页
  Ecommerce = '/dashboard/ecommerce', // 电子商务
  User = '/system/user', // 账户
  Role = '/system/role', // 角色
  Tenant = '/system/tenant', // 租户
  UserCenter = '/system/user-center', // 用户中心
  Menu = '/system/menu', // 菜单
  NestedMenu1 = '/system/nested/menu1', // 嵌套菜单1
  NestedMenu21 = '/system/nested/menu2', // 嵌套菜单2-1
  NestedMenu31 = '/system/nested/menu3', // 嵌套菜单3-1
  NestedMenu321 = '/system/nested/menu3/menu3-2' // 嵌套菜单3-2-1
  // 已精简：示例与演示页面别名已移除
}
