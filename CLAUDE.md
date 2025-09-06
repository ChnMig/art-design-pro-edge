# Art Design Pro Edge - 项目概览

## 项目基本信息

**项目名称**: art-design-pro-edge  
**项目类型**: 前后端分离的 Vue3 后台管理系统  
**主要语言**: Vue 3 + TypeScript + Vite  
**UI框架**: Element Plus  
**状态管理**: Pinia

## 项目来源与改造

本项目 fork 自 [art-design-pro](https://github.com/Daymychen/art-design-pro)，原项目为纯前端展示，本项目进行了以下重要改造：

1. **对接后端 API** - 完整的前后端分离架构
2. **权限管理优化** - 使用后端权限控制模式
3. **精简功能** - 移除多余展示页面、英文切换、用户注册等
4. **增强安全** - 添加水印功能（用户ID|账号），无法关闭
5. **验证码改进** - 滑动验证码改为图形验证码
6. **UI优化** - 更符合直觉的菜单和权限管理界面

## 与原版项目的详细差异对比

### 架构层面改造

#### 1. 从纯前端转向前后端分离

- **原版**: 纯前端项目，所有数据为模拟数据，仅用于展示
- **本项目**: 完整的前后端分离架构，对接真实后端 API
- **影响**: 从展示型项目变为可投入生产的后台管理系统

#### 2. 权限管理模式切换

- **原版**: 支持前端权限（frontend）和后端权限（backend）两种模式
- **本项目**: 强制使用后端权限模式（`VITE_ACCESS_MODE = backend`）
- **实现**: 菜单和权限完全由后端控制，前端不再维护权限配置
- **优势**: 更安全，权限集中管理，避免前端权限绕过

### 功能移除和精简

#### 3. 国际化支持移除

- **原版**: 支持中英文切换
- **本项目**: 移除英文切换，专注中文环境
- **原因**: 简化项目复杂度，针对国内用户

#### 4. 用户注册功能移除

- **原版**: 包含用户注册页面和流程
- **本项目**: 完全移除注册功能
- **替代方案**: 用户由管理员创建和管理

#### 5. 忘记密码流程简化

- **原版**: 完整的忘记密码找回流程
- **本项目**: 移除找回流程，通过二维码联系管理员
- **配置**: 二维码路径 `src/assets/images/qrcode.png`

#### 6. 用户个性化功能移除

- **原版**: 支持用户头像自定义、邮箱管理
- **本项目**: 移除头像自定义和邮箱字段
- **简化**: 减少用户个人信息管理复杂度

#### 7. 多余展示页面清理

- **原版**: 包含大量展示性页面和示例
- **本项目**: 保留核心管理功能，移除展示页面
- **专注**: 突出实际业务管理功能

### 安全增强

#### 8. 强制水印功能

- **原版**: 水印功能可选择开启/关闭
- **本项目**: 水印功能强制开启，用户无法关闭
- **内容**: 显示 `{用户ID} | {用户账号}` 格式
- **实现**:
  ```vue
  const effectiveContent = computed( () => userStore.getUserInfo.id + ' | ' +
  userStore.getUserInfo.username )
  ```
- **目的**: 防止截图泄露，增强安全审计

#### 9. 验证码类型变更

- **原版**: 使用滑动验证码
- **本项目**: 改为图形验证码
- **优势**: 更简单直接，减少第三方依赖

### 系统优化

#### 10. Logo 资源优化

- **原版**: 使用传统图片格式 logo
- **本项目**: 改为 SVG 静态资源
- **优势**: 更好的缩放性和性能

#### 11. 路由参数问题修复

- **原版**: 存在关闭其他标签后当前页面 query 参数丢失的问题
- **本项目**: 修复了该问题
- **影响**: 提升用户体验，避免页面状态丢失

#### 12. 依赖精简

- **原版**: 包含大量展示相关的依赖
- **本项目**: 移除多余依赖，减少包体积
- **效果**: 更快的构建和部署

### 配置和环境

#### 13. 环境变量配置

- **权限模式**: `VITE_ACCESS_MODE = backend` (强制后端模式)
- **API地址**: `VITE_API_URL = http://127.0.0.1:8080/api/v1/admin/`
- **版本同步**: 当前版本 `2.5.6`，同步原项目 commit `d2d01bf5cf819d736add622df952783fbcb3ec02`

#### 14. 配套后端项目

- **后端仓库**: [art-design-pro-edge-go-server](https://github.com/ChnMig/art-design-pro-edge-go-server)
- **技术栈**: Golang + Gin + Gorm + PostgreSQL + Redis
- **集成**: 完整的 API 对接和数据交互

### 开发理念变化

#### 15. 目标用户定位

- **原版**: 面向前端开发者的展示和学习项目
- **本项目**: 面向有开发经验的用户，提供即用型后台系统
- **体现**: 不提供初始化界面，假设用户具备开发能力

#### 16. AI 辅助开发

- **特色**: 95% 代码由 GitHub Copilot 辅助编写
- **意义**: 展示 AI 辅助开发的实际应用效果

### 待完成功能

#### 17. 开发规划

- **API层权限管制**: 计划中的功能增强
- **文档完善**: 持续改进文档质量
- **版本同步**: 跟随原项目更新，但不同步已精简的功能

### 部署考虑

#### 18. 关键配置提醒

- **后端地址**: 需在环境变量中正确配置
- **联系二维码**: 上线前必须替换为实际联系方式
- **系统名称和Logo**: 需根据实际项目修改

这些改造使得项目从一个前端展示项目转变为可投入实际使用的企业级后台管理系统，更适合中小企业的实际业务需求。

## 代码层面详细差异分析

### 配置文件层面变化

#### 环境变量强制配置

- **`.env` 文件**:
  - `VITE_ACCESS_MODE = backend` - 强制使用后端权限模式，不再支持前端权限模式
  - `VITE_API_URL = http://127.0.0.1:8080/api/v1/admin/` - 明确指向后端API地址
  - `VITE_VERSION = 2.5.4` - 版本号与原项目同步
  - `VITE_WITH_CREDENTIALS = false` - 跨域请求默认不携带Cookie

#### 系统配置统一

- **`src/config/index.ts`**:
  - `systemInfo.name: 'Art Design Pro'` - 系统名称统一配置
  - 主题配置保持不变，支持亮色/暗色/自动切换
  - 菜单布局配置保持原有的Left/Top/Mixed/Dual Column四种模式

### 核心组件改动分析

#### 1. 水印组件强制性改造（`src/components/core/others/art-water-mark/index.vue`）

```vue
// 核心变化：强制显示用户身份信息 const effectiveContent = computed( () => userStore.getUserInfo.id
+ ' | ' + userStore.getUserInfo.username )
```

- **强制性**: 水印内容不再从props获取，直接从用户store获取
- **安全性**: 显示用户ID和用户名，用于审计和防泄露
- **不可关闭**: 移除了visibility控制，水印始终显示

#### 2. 忘记密码页面简化（`src/views/auth/forget-password/index.vue`）

```vue
// 核心变化：移除密码找回流程，改为联系管理员
<div class="qrcode-container">
  <img :src="qrcodeImage" alt="联系管理员二维码" class="qrcode-img" />
  <p class="qrcode-tip">扫描上方二维码联系管理员</p>
</div>
```

- **简化流程**: 移除邮箱验证、短信验证等复杂找回流程
- **人工干预**: 通过二维码联系管理员重置密码
- **资源依赖**: 依赖 `src/assets/img/admin/qrcode.png` 二维码图片

#### 3. 国际化功能完全移除

- **代码残留**: 虽然代码中仍有 `vue-i18n` 依赖和语言相关的枚举定义
- **功能禁用**: 实际不再提供语言切换功能
- **中文化**: 所有界面文字强制使用中文

### 权限系统架构变化

#### 1. 用户状态管理优化（`src/store/modules/user.ts`）

```typescript
// 核心变化：JWT双Token管理
const accessToken = ref('') // 访问令牌
const refreshToken = ref('') // 刷新令牌

// Token设置方法
const setToken = (newAccessToken: string, newRefreshToken?: string) => {
  accessToken.value = newAccessToken
  if (newRefreshToken) {
    refreshToken.value = newRefreshToken
  }
}
```

- **双Token架构**: 支持访问令牌和刷新令牌分离管理
- **持久化存储**: 使用localStorage持久化用户状态
- **安全登出**: 退出时清空所有相关状态和缓存

#### 2. 路由守卫强化（`src/router/guards/beforeEach.ts`）

```typescript
// 核心变化：强制后端权限模式
async function processBackendMenu(router: Router): Promise<() => void> {
  console.log('获取用户菜单...')
  const asyncRoutesData = await getUserMenu()
  // 菜单数据完全来自后端API
  const menuList: AppRouteRecord[] = menuRes.map((route: AppRouteRecord) => menuDataToRouter(route))
  await registerAndStoreMenu(router, menuList, closeLoading)
}
```

- **后端驱动**: 菜单和路由完全由后端API控制
- **动态注册**: 运行时动态注册路由，而非编译时静态配置
- **权限验证**: 每次路由跳转都验证用户权限和登录状态
- **错误处理**: 完善的错误处理和fallback机制

#### 3. 前端权限模式保留但禁用

```typescript
// 保留前端权限模式代码但实际不使用
async function processFrontendMenu(router: Router): Promise<void> {
  const menuList = asyncRoutes.map((route) => menuDataToRouter(route))
  const roles = userStore.info.roles
  const filteredMenuList = filterMenuByRoles(menuList, roles)
  await registerAndStoreMenu(router, filteredMenuList)
}
```

- **代码保留**: 前端权限相关代码仍然存在
- **环境禁用**: 通过环境变量强制使用后端模式
- **兼容性**: 保持代码结构兼容，便于将来切换

### API集成架构分析

#### 1. HTTP客户端配置（`src/utils/http/index.ts`）

```typescript
// 核心变化：生产环境API配置
const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: VITE_API_URL, // 环境变量配置后端地址
  withCredentials: VITE_WITH_CREDENTIALS === 'true',
  validateStatus: (status) => status >= 200 && status < 300
})

// 请求拦截器自动添加Token
axiosInstance.interceptors.request.use((request: InternalAxiosRequestConfig) => {
  const { accessToken } = useUserStore()
  if (accessToken) {
    request.headers.set('Authorization', accessToken)
  }
  return request
})
```

- **环境配置**: 基础URL通过环境变量动态配置
- **认证自动化**: 自动在请求头添加Authorization Token
- **错误处理**: 统一的错误处理和用户提示机制
- **重试机制**: 支持网络异常时的自动重试

#### 2. API接口统一管理（`src/api/system/api.ts`）

```typescript
// 核心变化：完整的CRUD API集合
export const getUserMenu = (): Promise<ApiResponse<ApiResponse>> => {
  return api.get({ url: '/system/user/menu' })
}

export const getUserInfo = (): Promise<ApiResponse<ApiResponse>> => {
  return api.get({ url: '/system/user/info' })
}

export const userLogin = (data: {
  username: string
  password: string
  captcha: string
  captcha_id: string
}): Promise<ApiResponse<ApiResponse>> => {
  return api.post({ url: '/system/user/login', data })
}
```

- **RESTful设计**: 遵循REST规范的API设计
- **类型安全**: 完整的TypeScript类型定义
- **CRUD完整**: 涵盖用户、角色、部门、菜单的完整增删改查
- **权限关联**: 菜单权限、角色权限的关联管理API

#### 3. 图形验证码集成

```typescript
export const getCaptcha = (height: number, width: number): Promise<ApiResponse<ApiResponse>> => {
  return api.get({ url: '/system/user/login/captcha', params: { height, width } })
}
```

- **验证码获取**: 从滑动验证码改为图形验证码
- **参数化配置**: 支持自定义验证码尺寸
- **API集成**: 与后端验证码生成接口对接

### 状态管理架构优化

#### 1. Pinia持久化策略

```typescript
export const useUserStore = defineStore(
  'userStore',
  () => {
    // Store定义...
  },
  {
    persist: {
      key: 'user',
      storage: localStorage // 用户状态持久化到localStorage
    }
  }
)
```

- **持久化存储**: 用户登录状态和设置信息持久化
- **跨会话保持**: 浏览器关闭重开时保持登录状态
- **选择性持久化**: 只持久化必要的状态信息

#### 2. 模块化状态管理

- **userStore**: 用户信息、登录状态、令牌管理
- **settingStore**: 系统设置、主题配置、界面状态
- **menuStore**: 菜单数据、权限控制
- **worktabStore**: 工作台标签管理
- **tableStore**: 表格状态管理

### 构建和部署优化

#### 1. 依赖精简

```json
// package.json - 移除不必要的依赖
"dependencies": {
  // 保留核心依赖
  "vue": "^3.5.12",
  "element-plus": "^2.10.2",
  "axios": "^1.7.5",
  // 移除了国际化、复杂验证码等相关依赖
}
```

- **核心保留**: 保留Vue3、Element Plus、Axios等核心依赖
- **功能精简**: 移除国际化、复杂验证码等不需要的依赖
- **版本统一**: 依赖版本与原项目保持同步

#### 2. 环境变量标准化

- **开发环境**: `.env.development` 专门配置开发环境变量
- **生产环境**: `.env` 配置生产环境默认值
- **灵活配置**: 支持通过环境变量灵活配置API地址、端口等

### 代码质量和规范

#### 1. TypeScript类型完整性

- **API类型**: 完整的API请求和响应类型定义
- **Store类型**: Pinia状态管理的类型安全
- **组件类型**: Vue组件Props和Emit的类型声明
- **路由类型**: 路由配置和守卫的类型安全

#### 2. 错误处理机制

- **全局错误**: axios拦截器统一处理HTTP错误
- **路由错误**: 路由守卫中的错误处理和fallback
- **用户友好**: 错误信息的用户友好提示
- **日志记录**: 开发环境的详细错误日志

这些代码层面的改动体现了从展示型项目向生产级应用的转变，强调了安全性、可维护性和用户体验的提升。

## 技术栈

### 核心框架

- **Vue 3.5.12** - 主框架，使用 Composition API
- **TypeScript 5.6.3** - 类型系统
- **Vite 6.1.0** - 构建工具，支持热重载和快速构建

### UI 与样式

- **Element Plus 2.10.2** - UI组件库
- **@element-plus/icons-vue 2.3.1** - 图标库
- **Sass 1.81.0** - CSS预处理器
- **自定义主题系统** - 支持亮色/暗色模式切换

### 状态管理与路由

- **Pinia 3.0.2** - 状态管理，支持持久化
- **Vue Router 4.4.2** - 路由管理，支持路由守卫
- **pinia-plugin-persistedstate 4.3.0** - Pinia持久化插件

### 网络与数据

- **Axios 1.7.5** - HTTP客户端，配置拦截器和统一错误处理
- **crypto-js 4.2.0** - 加密解密工具

### 富文本与图表

- **@wangeditor/editor 5.1.23** - 富文本编辑器
- **md-editor-v3 4.17.0** - Markdown编辑器
- **ECharts 5.6.0** - 图表库
- **xlsx 0.18.5** - Excel处理

### 工具库

- **@vueuse/core 11.0.0** - Vue组合式函数库
- **mitt 3.0.1** - 事件总线
- **nprogress 0.2.0** - 进度条
- **file-saver 2.0.5** - 文件下载
- **highlight.js 11.10.0** - 代码高亮

### 开发工具

- **ESLint + Prettier** - 代码规范和格式化
- **Husky + lint-staged** - Git钩子和代码检查
- **Commitizen** - 规范化提交

## 项目架构

### 目录结构

```
src/
├── api/                    # API接口定义
├── assets/                 # 静态资源
│   ├── fonts/             # 字体文件
│   ├── icons/             # 图标资源
│   ├── img/               # 图片资源
│   ├── styles/            # 全局样式
│   └── svg/               # SVG资源
├── components/            # 公共组件
│   └── core/              # 核心组件
│       ├── base/          # 基础组件
│       ├── forms/         # 表单组件
│       ├── layouts/       # 布局组件
│       ├── tables/        # 表格组件
│       └── views/         # 视图组件
├── composables/           # 组合式函数
├── config/                # 配置文件
├── directives/            # 指令
├── enums/                 # 枚举定义
├── router/                # 路由配置
├── store/                 # 状态管理
├── types/                 # 类型定义
├── utils/                 # 工具函数
└── views/                 # 页面视图
```

### 核心功能模块

#### 1. 认证与权限系统

- **JWT Token管理** - 访问令牌和刷新令牌
- **路由守卫** - 基于权限的路由访问控制
- **菜单权限** - 后端控制的菜单显示权限
- **角色管理** - 多角色权限分配

#### 2. 布局系统

- **多种菜单布局** - 左侧菜单、顶部菜单、混合菜单
- **主题切换** - 亮色/暗色模式，多种菜单主题
- **响应式设计** - 支持移动端适配
- **工作台标签** - 多标签页面管理

#### 3. 组件系统

- **表格组件** - 支持排序、筛选、分页
- **表单组件** - 统一的表单验证和提交
- **搜索组件** - 多种搜索条件组合
- **设置面板** - 实时主题和布局配置

#### 4. 系统功能

- **用户管理** - 用户CRUD、角色分配
- **菜单管理** - 动态菜单配置
- **权限管理** - 细粒度权限控制
- **系统设置** - 主题、布局、功能开关

## 状态管理架构

### Store 模块

- **userStore** - 用户信息、登录状态、令牌管理
- **settingStore** - 系统设置、主题配置、界面状态
- **menuStore** - 菜单数据、权限控制
- **worktabStore** - 工作台标签管理
- **tableStore** - 表格状态管理

### 持久化策略

- 使用 `pinia-plugin-persistedstate` 实现状态持久化
- localStorage 存储用户设置和认证信息
- sessionStorage 存储临时数据

## 网络架构

### API 客户端配置

- **基础URL** - 通过环境变量配置后端地址
- **请求拦截器** - 自动添加认证头、请求预处理
- **响应拦截器** - 统一错误处理、数据格式化
- **超时控制** - 15秒请求超时
- **错误提示** - 用户友好的错误消息

### 代理配置

- 开发环境 `/api` 路径代理到后端服务
- 生产环境通过 `VITE_API_URL` 配置

## 构建配置

### Vite 配置特性

- **自动导入** - 组件和API自动导入，无需手动import
- **路径别名** - `@` 指向 `src` 目录，支持多种别名
- **代码分割** - vendor chunk分离，优化加载性能
- **压缩优化** - Gzip压缩，Terser压缩
- **开发工具** - Vue DevTools集成

### 构建优化

- Element Plus 按需导入
- 图片压缩和优化
- CSS预处理器配置
- 依赖预构建优化

## 开发规范

### 代码规范

- **ESLint** - JavaScript/TypeScript代码规范
- **Prettier** - 代码格式化
- **Stylelint** - CSS/SCSS样式规范
- **Commitizen** - Git提交规范

### 类型安全

- 全面的 TypeScript 类型定义
- API 响应类型定义
- 组件 Props 类型声明
- Store 状态类型管理

## 部署配置

### 环境变量

- **VITE_API_URL** - 后端API地址
- **VITE_VERSION** - 应用版本号
- **VITE_PORT** - 开发服务器端口
- **VITE_BASE_URL** - 应用基础路径

### 关键配置文件

- **联系二维码** - `src/assets/images/qrcode.png`
- **系统Logo** - `src/assets/img/common/logo.png`
- **系统名称** - `src/config/env` 中的 `name` 变量

## 后端集成

### 配套后端项目

- **项目地址** - [art-design-pro-edge-go-server](https://github.com/ChnMig/art-design-pro-edge-go-server)
- **技术栈** - Golang + Gin + Gorm + PostgreSQL + Redis
- **API版本同步** - 当前同步版本 `d2d01bf5cf819d736add622df952783fbcb3ec02`

## 项目特色

1. **AI辅助开发** - 95%代码由 GitHub Copilot 辅助编写
2. **完整权限体系** - 后端驱动的菜单和权限管理
3. **现代化技术栈** - Vue3 + TypeScript + Vite 最佳实践
4. **高度可定制** - 丰富的主题和布局配置选项
5. **生产就绪** - 完善的错误处理、性能优化和安全措施

## 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 构建生产版本
pnpm run build

# 代码检查
pnpm run lint

# 代码格式化
pnpm run lint:prettier

# 清理开发环境
pnpm run clean:dev
```

## 项目状态

- **开发活跃度** - 持续更新，跟随原项目版本
- **生产使用** - 适合中小企业后台管理系统
- **文档完善度** - 待完善API层权限管制文档
- **社区支持** - 基于成熟的 art-design-pro 生态
