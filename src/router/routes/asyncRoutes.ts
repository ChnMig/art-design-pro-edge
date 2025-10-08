import { RoutesAlias } from '../routesAlias'
import { AppRouteRecord } from '@/types/router'
import { WEB_LINKS } from '@/utils/constants'

/**
 * 精简后的异步路由
 * 仅保留：仪表盘、系统管理、异常页面、外链示例
 * 其余示例页面（article/change/examples/result/safeguard/template/widgets）已移除
 */
export const asyncRoutes: AppRouteRecord[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    component: RoutesAlias.Layout,
    meta: {
      title: '仪表盘',
      icon: '&#xe721;',
      roles: ['R_SUPER', 'R_ADMIN']
    },
    children: [
      {
        path: 'console',
        name: 'Console',
        component: RoutesAlias.Dashboard,
        meta: {
          title: '工作台',
          keepAlive: false,
          fixedTab: true
        }
      },
      {
        path: 'analysis',
        name: 'Analysis',
        component: RoutesAlias.Analysis,
        meta: {
          title: '分析页',
          keepAlive: false
        }
      },
      {
        path: 'ecommerce',
        name: 'Ecommerce',
        component: RoutesAlias.Ecommerce,
        meta: {
          title: '电子商务',
          keepAlive: false
        }
      }
    ]
  },

  {
    path: '/system',
    name: 'System',
    component: RoutesAlias.Layout,
    meta: {
      title: '系统管理',
      icon: '&#xe7b9;',
      roles: ['R_SUPER', 'R_ADMIN']
    },
    children: [
      {
        path: 'user',
        name: 'User',
        component: RoutesAlias.User,
        meta: {
          title: '用户管理',
          keepAlive: true,
          roles: ['R_SUPER', 'R_ADMIN']
        }
      },
      {
        path: 'role',
        name: 'Role',
        component: RoutesAlias.Role,
        meta: {
          title: '角色管理',
          keepAlive: true,
          roles: ['R_SUPER']
        }
      },
      {
        path: 'tenant',
        name: 'Tenant',
        component: RoutesAlias.Tenant,
        meta: {
          title: '租户管理',
          keepAlive: true,
          roles: ['R_SUPER']
        }
      },
      {
        path: 'user-center',
        name: 'UserCenter',
        component: RoutesAlias.UserCenter,
        meta: {
          title: '个人中心',
          isHide: true,
          keepAlive: true,
          isHideTab: true
        }
      },
      {
        path: 'menu',
        name: 'Menus',
        component: RoutesAlias.Menu,
        meta: {
          title: '菜单管理',
          keepAlive: true,
          roles: ['R_SUPER'],
          authList: [
            { title: '新增', authMark: 'add' },
            { title: '编辑', authMark: 'edit' },
            { title: '删除', authMark: 'delete' }
          ]
        }
      },
      {
        path: 'nested',
        name: 'Nested',
        component: '',
        meta: {
          title: '嵌套菜单',
          keepAlive: true
        },
        children: [
          {
            path: 'menu1',
            name: 'NestedMenu1',
            component: RoutesAlias.NestedMenu1,
            meta: {
              title: '菜单1',
              icon: '&#xe676;',
              keepAlive: true
            }
          },
          {
            path: 'menu2',
            name: 'NestedMenu2',
            component: '',
            meta: {
              title: '菜单2',
              icon: '&#xe676;',
              keepAlive: true
            },
            children: [
              {
                path: 'menu2-1',
                name: 'NestedMenu2-1',
                component: RoutesAlias.NestedMenu21,
                meta: {
                  title: '菜单2-1',
                  icon: '&#xe676;',
                  keepAlive: true
                }
              }
            ]
          },
          {
            path: 'menu3',
            name: 'NestedMenu3',
            component: '',
            meta: {
              title: '菜单3',
              icon: '&#xe676;',
              keepAlive: true
            },
            children: [
              {
                path: 'menu3-1',
                name: 'NestedMenu3-1',
                component: RoutesAlias.NestedMenu31,
                meta: {
                  title: '菜单3-1',
                  icon: '&#xe676;',
                  keepAlive: true
                }
              },
              {
                path: 'menu3-2',
                name: 'NestedMenu3-2',
                component: '',
                meta: {
                  title: '菜单3-2',
                  icon: '&#xe676;',
                  keepAlive: true
                },
                children: [
                  {
                    path: 'menu3-2-1',
                    name: 'NestedMenu3-2-1',
                    component: RoutesAlias.NestedMenu321,
                    meta: {
                      title: '菜单3-2-1',
                      icon: '&#xe676;',
                      keepAlive: true
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  {
    path: '/exception',
    name: 'Exception',
    component: RoutesAlias.Layout,
    meta: {
      title: '异常页面',
      icon: '&#xe820;'
    },
    children: [
      {
        path: '403',
        name: '403',
        component: RoutesAlias.Exception403,
        meta: { title: '403', keepAlive: true, isFullPage: true }
      },
      {
        path: '404',
        name: '404',
        component: RoutesAlias.Exception404,
        meta: { title: '404', keepAlive: true, isFullPage: true }
      },
      {
        path: '500',
        name: '500',
        component: RoutesAlias.Exception500,
        meta: { title: '500', keepAlive: true, isFullPage: true }
      }
    ]
  },

  // 外链示例（保留官方文档与精简版链接）
  {
    name: 'Document',
    path: '',
    component: '',
    meta: {
      title: '官方文档',
      icon: '&#xe73e;',
      link: WEB_LINKS.DOCS,
      isIframe: false,
      keepAlive: false
    }
  },
  {
    name: 'LiteVersion',
    path: '',
    component: '',
    meta: {
      title: '精简版本',
      icon: '&#xe7ff;',
      link: WEB_LINKS.LiteVersion,
      isIframe: false,
      keepAlive: false
    }
  }
]
