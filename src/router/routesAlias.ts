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
  User = '/system/user', // 账户
  Role = '/system/role', // 角色
  Tenant = '/system/tenant', // 租户
  UserCenter = '/system/user-center', // 用户中心
  Menu = '/system/menu' // 菜单
  // 已精简：示例与演示页面别名已移除
}
