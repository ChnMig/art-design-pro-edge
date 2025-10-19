import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { systemRoutes } from './system'
import { exceptionRoutes } from './exception'

/**
 * 导出业务实际使用的模块化路由
 * 说明：按本仓库约定，已移除上游的示例/演示模块（article/examples/template/widgets/result/safeguard/help）。
 */
export const routeModules: AppRouteRecord[] = [dashboardRoutes, systemRoutes, exceptionRoutes]
