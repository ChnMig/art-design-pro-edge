import { RoutesAlias } from '../routesAlias'
import { AppRouteRecord } from '@/types/router'
import { WEB_LINKS } from '@/utils/constants'

/**
 * 菜单列表、异步路由
 *
 * 支持两种模式:
 * 前端静态配置 - 直接使用本文件中定义的路由配置
 * 后端动态配置 - 后端返回菜单数据，前端解析生成路由
 *
 * 菜单标题（title）:
 * 使用静态文本（例如：'用户列表'）
 *
 * 注意事项：
 * 1、RoutesAlias.Layout 指向的是布局容器，后端返回的菜单数据中，component 字段需要指向 /index/index
 * 2、path、name 不要和动态路由冲突，否则会导致路由冲突无法访问
 */
export const asyncRoutes: AppRouteRecord[] = [
  // 主页一级菜单配置示例：
  // {
  //   name: 'Home',
  //   path: '/home',
  //   component: RoutesAlias.Dashboard,
  //   meta: {
  //     title: '工作台',
  //     icon: '&#xe733;',
  //     keepAlive: false
  //   }
  // },
  {
    name: 'Dashboard',
    path: '/dashboard',
    component: RoutesAlias.Layout,
    meta: {
      title: '仪表盘',
      icon: '&#xe721;',
      roles: ['R_SUPER', 'R_ADMIN'] // 角色权限，前端控制模式（只有拥有这些角色的用户才能访问）
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
    path: '/template',
    name: 'Template',
    component: RoutesAlias.Layout,
    meta: {
      title: '模板中心',
      icon: '&#xe860;'
    },
    children: [
      {
        path: 'cards',
        name: 'Cards',
        component: RoutesAlias.Cards,
        meta: {
          title: '卡片',
          keepAlive: false
        }
      },
      {
        path: 'banners',
        name: 'Banners',
        component: RoutesAlias.Banners,
        meta: {
          title: '横幅',
          keepAlive: false
        }
      },
      {
        path: 'charts',
        name: 'Charts',
        component: RoutesAlias.Charts,
        meta: {
          title: '图表',
          keepAlive: false
        }
      },
      {
        path: 'map',
        name: 'Map',
        component: RoutesAlias.Map,
        meta: {
          title: '地图',
          keepAlive: true
        }
      },
      {
        path: 'chat',
        name: 'Chat',
        component: RoutesAlias.Chat,
        meta: {
          title: '聊天',
          keepAlive: true
        }
      },
      {
        path: 'calendar',
        name: 'Calendar',
        component: RoutesAlias.Calendar,
        meta: {
          title: '日历',
          keepAlive: true
        }
      },
      {
        path: 'pricing',
        name: 'Pricing',
        component: RoutesAlias.Pricing,
        meta: {
          title: '定价',
          keepAlive: true,
          isFullPage: true // 是否全屏显示
        }
      }
    ]
  },
  {
    path: '/widgets',
    name: 'Widgets',
    component: RoutesAlias.Layout,
    meta: {
      title: '组件中心',
      icon: '&#xe81a;'
    },
    children: [
      {
        path: 'icon-list',
        name: 'IconList',
        component: RoutesAlias.IconList,
        meta: {
          title: 'Icon 图标',
          keepAlive: true
        }
      },
      {
        path: 'icon-selector',
        name: 'IconSelector',
        component: RoutesAlias.IconSelector,
        meta: {
          title: '图标选择器',
          keepAlive: true
        }
      },
      {
        path: 'image-crop',
        name: 'ImageCrop',
        component: RoutesAlias.ImageCrop,
        meta: {
          title: '图像裁剪',
          keepAlive: true
        }
      },
      {
        path: 'excel',
        name: 'Excel',
        component: RoutesAlias.Excel,
        meta: {
          title: 'Excel 导入导出',
          keepAlive: true
        }
      },
      {
        path: 'video',
        name: 'Video',
        component: RoutesAlias.Video,
        meta: {
          title: '视频播放器',
          keepAlive: true
        }
      },
      {
        path: 'count-to',
        name: 'CountTo',
        component: RoutesAlias.CountTo,
        meta: {
          title: '数字滚动',
          keepAlive: false
        }
      },
      {
        path: 'wang-editor',
        name: 'WangEditor',
        component: RoutesAlias.WangEditor,
        meta: {
          title: '富文本编辑器',
          keepAlive: true
        }
      },
      {
        path: 'watermark',
        name: 'Watermark',
        component: RoutesAlias.Watermark,
        meta: {
          title: '水印',
          keepAlive: true
        }
      },
      {
        path: 'context-menu',
        name: 'ContextMenu',
        component: RoutesAlias.ContextMenu,
        meta: {
          title: '右键菜单',
          keepAlive: true
        }
      },
      {
        path: 'qrcode',
        name: 'Qrcode',
        component: RoutesAlias.Qrcode,
        meta: {
          title: '二维码',
          keepAlive: true
        }
      },
      {
        path: 'drag',
        name: 'Drag',
        component: RoutesAlias.Drag,
        meta: {
          title: '拖拽',
          keepAlive: true
        }
      },
      {
        path: 'text-scroll',
        name: 'TextScroll',
        component: RoutesAlias.TextScroll,
        meta: {
          title: '文字滚动',
          keepAlive: true
        }
      },
      {
        path: 'fireworks',
        name: 'Fireworks',
        component: RoutesAlias.Fireworks,
        meta: {
          title: '礼花',
          keepAlive: true,
          showTextBadge: 'Hot'
        }
      },
      {
        path: '/outside/iframe/elementui',
        name: 'ElementUI',
        component: '',
        meta: {
          title: '组件总览',
          keepAlive: false,
          link: 'https://element-plus.org/zh-CN/component/overview.html',
          isIframe: true
        }
      }
    ]
  },
  {
    path: '/examples',
    name: 'Examples',
    component: RoutesAlias.Layout,
    meta: {
      title: '功能示例',
      icon: '&#xe8d4;',
      showBadge: true
    },
    children: [
      {
        path: 'permission',
        name: 'Permission',
        component: '',
        meta: {
          title: '前端权限'
        },
        children: [
          {
            path: RoutesAlias.PermissionSwitchRole,
            name: 'PermissionSwitchRole',
            component: RoutesAlias.PermissionSwitchRole,
            meta: {
              title: '切换权限',
              keepAlive: true
            }
          },
          {
            path: RoutesAlias.PermissionButtonAuth,
            name: 'PermissionButtonAuth',
            component: RoutesAlias.PermissionButtonAuth,
            meta: {
              title: '按钮权限演示',
              keepAlive: true,
              authList: [
                {
                  title: '新增',
                  authMark: 'add'
                },
                {
                  title: '编辑',
                  authMark: 'edit'
                },
                {
                  title: '删除',
                  authMark: 'delete'
                },
                {
                  title: '导出',
                  authMark: 'export'
                },
                {
                  title: '查看',
                  authMark: 'view'
                },
                {
                  title: '发布',
                  authMark: 'publish'
                },
                {
                  title: '配置',
                  authMark: 'config'
                },
                {
                  title: '管理',
                  authMark: 'manage'
                }
              ]
            }
          },
          {
            path: RoutesAlias.PermissionPageVisibility,
            name: 'PermissionPageVisibility',
            component: RoutesAlias.PermissionPageVisibility,
            meta: {
              title: '超级管理员可见',
              keepAlive: true,
              roles: ['R_SUPER'] // 仅超级管理员可访问
            }
          }
        ]
      },
      {
        path: 'tabs',
        name: 'Tabs',
        component: RoutesAlias.ExamplesTabs,
        meta: {
          title: '标签页'
        }
      },
      {
        path: 'tables/basic',
        name: 'TablesBasic',
        component: RoutesAlias.ExamplesTablesBasic,
        meta: {
          title: '基础表格',
          keepAlive: true
        }
      },
      {
        path: 'tables',
        name: 'Tables',
        component: RoutesAlias.ExamplesTables,
        meta: {
          title: '高级表格',
          keepAlive: true
        }
      },
      {
        path: 'forms',
        name: 'Forms',
        component: RoutesAlias.ExamplesForms,
        meta: {
          title: '表单',
          keepAlive: true,
          showTextBadge: 'new'
        }
      },
      {
        path: 'form/search-bar',
        name: 'SearchBar',
        component: RoutesAlias.ExamplesSearchBar,
        meta: {
          title: '搜索表单',
          keepAlive: true
        }
      },
      {
        path: 'tables/tree',
        name: 'TablesTree',
        component: RoutesAlias.ExamplesTablesTree,
        meta: {
          title: '左右布局表格',
          keepAlive: true
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
            {
              title: '新增',
              authMark: 'add'
            },
            {
              title: '编辑',
              authMark: 'edit'
            },
            {
              title: '删除',
              authMark: 'delete'
            }
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
    path: '/article',
    name: 'Article',
    component: RoutesAlias.Layout,
    meta: {
      title: '文章管理',
      icon: '&#xe7ae;',
      roles: ['R_SUPER', 'R_ADMIN']
    },
    children: [
      {
        path: 'article-list',
        name: 'ArticleList',
        component: RoutesAlias.ArticleList,
        meta: {
          title: '文章列表',
          keepAlive: true,
          authList: [
            {
              title: '新增',
              authMark: 'add'
            },
            {
              title: '编辑',
              authMark: 'edit'
            }
          ]
        }
      },

      {
        path: 'detail/:id',
        name: 'ArticleDetail',
        component: RoutesAlias.ArticleDetail,
        meta: {
          title: '文章详情',
          isHide: true,
          keepAlive: true,
          activePath: '/article/article-list' // 激活菜单路径
        }
      },
      {
        path: 'comment',
        name: 'ArticleComment',
        component: RoutesAlias.Comment,
        meta: {
          title: '留言管理',
          keepAlive: true
        }
      },
      {
        path: 'publish',
        name: 'ArticlePublish',
        component: RoutesAlias.ArticlePublish,
        meta: {
          title: '文章发布',
          keepAlive: true,
          authList: [
            {
              title: '发布',
              authMark: 'add'
            }
          ]
        }
      }
    ]
  },
  {
    path: '/result',
    name: 'Result',
    component: RoutesAlias.Layout,
    meta: {
      title: '结果页面',
      icon: '&#xe715;'
    },
    children: [
      {
        path: 'success',
        name: 'ResultSuccess',
        component: RoutesAlias.Success,
        meta: {
          title: '成功页',
          keepAlive: true
        }
      },
      {
        path: 'fail',
        name: 'ResultFail',
        component: RoutesAlias.Fail,
        meta: {
          title: '失败页',
          keepAlive: true
        }
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
        meta: {
          title: '403',
          keepAlive: true,
          isFullPage: true
        }
      },
      {
        path: '404',
        name: '404',
        component: RoutesAlias.Exception404,
        meta: {
          title: '404',
          keepAlive: true,
          isFullPage: true
        }
      },
      {
        path: '500',
        name: '500',
        component: RoutesAlias.Exception500,
        meta: {
          title: '500',
          keepAlive: true,
          isFullPage: true
        }
      }
    ]
  },

  {
    path: '/safeguard',
    name: 'Safeguard',
    component: RoutesAlias.Layout,
    meta: {
      title: '运维管理',
      icon: '&#xe816;',
      keepAlive: false
    },
    children: [
      {
        path: 'server',
        name: 'SafeguardServer',
        component: RoutesAlias.Server,
        meta: {
          title: '服务器管理',
          keepAlive: true
        }
      }
    ]
  },
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
  },
  // 一级菜单
  {
    name: 'ChangeLog',
    path: '/change/log',
    component: RoutesAlias.ChangeLog,
    meta: {
      title: '更新日志',
      showTextBadge: `v${__APP_VERSION__}`,
      icon: '&#xe712;',
      keepAlive: false
    }
  }
]
