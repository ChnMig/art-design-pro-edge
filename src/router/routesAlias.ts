// 路由别名
export enum RoutesAlias {
  Home = '/layout/index', // 首页
  Login = '/login', // 登录
  ForgetPassword = '/forget-password', // 忘记密码
  Exception403 = '/exception/403', // 403
  Exception404 = '/exception/404', // 404
  Exception500 = '/exception/500', // 500
  Success = '/result/Success', // 成功
  Fail = '/result/Fail', // 失败
  Dashboard = '/dashboard/console', // 工作台
  Analysis = '/dashboard/analysis' // 分析页
}

// 主页路由
export const HOME_PAGE = RoutesAlias.Dashboard
