## 项目说明

本项目是基于上游开源项目 Daymychen/art-design-pro 二次开发（Fork）的企业后台管理模板。我们在保留上游优秀体验与视觉规范的基础上，面向企业级场景做了契约对齐与功能精简：

- 多租户 + 图形验证码登录，保留 `access_token/refresh_token` 字段命名
- 平台/系统分层：平台维护“菜单定义 + 元素权限 + 租户范围”，租户侧维护“角色—菜单—元素权限”
- 动态菜单完全后端驱动，严格遵守后端契约，不前端造字段/重映射
- 登录页支持 URL `tenant_code` 预填与锁定，“二维码联系管理员”弹窗（`VITE_ADMIN_QRCODE_URL`）
- 去除国际化与演示页：保持中文单语界面，删除 article/change/examples/result/safeguard/template/widgets
- UI 约定：系统页表格默认居中、无序号列、操作列展开规则统一，空值占位 `--`
- HTTP 规则：GET 查询参数自动清理空值（保留 0/false），最小 UI 字段映射
- 全局水印：默认“租户编码 | 用户账号”，可通过 props 覆盖

## 官方文档（上游）

[访问上游文档](https://www.artd.pro/docs/)

## 特点

- 使用最新技术栈
- 内置常用业务组件模版
- 提供多种主题模式，可以自定义主题
- 漂亮的 UI设计、极致的用户体验和细节处理
- 系统全面支持自定义设置，满足您的个性化需求

## 技术栈

- 开发框架：Vue3、TypeScript、Vite、Element-Plus、Tailwind CSS
- 代码规范：Eslint、Prettier、Stylelint、Husky、Lint-staged、cz-git

## 功能

- 丰富主题切换
- 全局搜索
- 锁屏
- 多标签页
- 全局面包屑
- 图标库
- 富文本编辑器
- Echarts 图表
- Utils工具包
- 网络异常处理
- 路由级别鉴权
- 侧边栏菜单鉴权
- 鉴权指令
- 移动端适配
- 优秀的持久化存储方案
- 本地数据存储校验
- 代码提交校验与格式化
- 代码提交规范化

## 兼容性

- 支持 Chrome、Safari、Firefox 等现代主流浏览器。

## 预览与文档

- 官方演示：[https://www.artd.pro](https://www.artd.pro)
- 上游文档：[https://www.artd.pro/docs](https://www.artd.pro/docs)
- 变更记录：`CHANGELOG.md` / `CHANGELOG.zh-CN.md`

## 安装运行

```bash
# 安装依赖
pnpm install

# 如果 pnpm install 安装失败，尝试使用下面的命令安装依赖
pnpm install --ignore-scripts

# 本地开发环境启动
pnpm dev

# 生产环境打包
pnpm build
```

## 同步来源与版本

- 上游项目：Daymychen/art-design-pro
- 同步分支：upstream/main
- 同步提交：817b85473722b5fbce29a6dd5594c82aee163a1b（refactor: directory structure adjustment and optimization，tag v3.0.0）
- 同步时间：见本仓库最近一次同步提交（分支：merge/upstream-sync-3.0）

## 项目定制

本仓库在同步上游的同时，保留并增强了以下业务能力：

- 多租户与图形验证码登录
  - 登录页保留租户编码与图形验证码输入，支持点击图片刷新验证码。
  - 接口：
    - 获取验证码：`GET /system/user/login/captcha`（函数：`src/api/auth.ts:fetchCaptcha`）
    - 登录：`POST /system/user/login`（函数：`src/api/auth.ts:fetchLogin`）
    - 用户信息：`GET /system/user/info`（函数：`src/api/auth.ts:fetchGetUserInfo`）
  - Token 字段：`access_token`、`refresh_token`。
  - Store 增强：在 `src/store/modules/user.ts` 中保留 `tenantInfo`、`currentTenantCode` 等字段，便于多租户场景使用。

- 多租户管理页面
  - 页面：`src/views/system/tenant/index.vue`
  - 接口：`src/api/tenant.ts`
  - 类型：`src/typings/api.d.ts` 中 `Api.SystemTenant.*`

- 构建与主题
  - 已启用 `unplugin-element-plus` 的 `useSource: true` 按需样式方案，主题变量通过 Vite 的 `css.preprocessorOptions.scss.additionalData` 注入（见 `vite.config.ts`）。
  - 亮色主题变量来自 `@styles/el-light.scss`，暗黑主题通过 `@styles/el-dark.scss` 与 `@assets/styles/dark.scss` 协同。

- 组件和样式同步要点（与上游同步）
  - 搜索条组件 ArtSearchBar API 统一：
    - `show-reset-button` → `show-reset`
    - `show-search-button` → `show-search`
    - `disabled-search-button` → `disabled-search`
    - 系统页面示例：`src/views/system/user/index.vue`
  - 统计卡片 ArtStatsCard 兼容计数为 0：`v-if="count !== undefined"`
    - 文件：`src/components/core/cards/art-stats-card/index.vue`
  - 登录页样式：选择器高度与输入框统一
    - 文件：`src/views/auth/login/index.scss`
  - 布局层级：顶栏 `z-index` 调整为 50（更合理的层级关系）
    - 文件：`src/views/index/style.scss`

- 认证流程精简
  - 移除“注册/忘记密码”页面，统一改为“二维码联系管理员”。
  - 登录页提供“联系管理员”入口，点击弹出二维码。
  - 二维码内容支持环境变量配置：`VITE_ADMIN_QRCODE_URL`。

- 平台 / 系统分层（本仓库独有）
  - 平台管理员（`/api/v1/private/admin/platform`）
    - 仅维护“全局菜单定义 + 元素权限”。
    - 为各租户分配“菜单范围”。
  - 租户管理员（`/api/v1/private/admin/system`）
    - 在平台授权范围内创建并维护本租户的“角色—菜单—元素权限”。
    - 维护部门与用户，并为用户授予本租户角色。
  - 登录后基于 `GET /admin/system/user/menu` 动态注册路由。
  - 页面与接口（主要位置）
    - 平台菜单（定义）：`src/views/platform/menu/index.vue`
      - `GET/POST/PUT/DELETE /api/v1/private/admin/platform/menu`
      - 元素权限：`GET/POST/PUT/DELETE /api/v1/private/admin/platform/menu/auth`
    - 平台租户菜单范围（从租户列表“查看”抽屉进入）：`src/views/platform/tenant/scope.vue`
      - 查询带 hasPermission 的菜单树：`GET /api/v1/private/admin/platform/menu/tenant?tenant_id`
      - 保存范围：`PUT /api/v1/private/admin/platform/menu/tenant { tenant_id, menu_data }`
    - 系统角色权限抽屉：`src/views/system/role/auth.vue`
      - 查询：`GET /api/v1/private/admin/system/menu/role?role_id`
      - 保存：`PUT /api/v1/private/admin/system/menu/role { role_id, menu_data }`
  - 权限树行为
    - 渲染：仅当整棵子树全为 true 时父节点才勾选，否则父节点半选、叶子按实际勾选。
    - 提交：父节点以“已选 ∪ 半选”判定，子节点按实际勾选；
    - 将 `meta.authList` 转换为子节点参与勾选（`id = auth_${menuId}_${authId}`）。

- HTTP 契约与数据规则（本仓库约定）
  - 严格遵守后端契约，不为兼容上游而前端造字段或做字段重映射。
  - 接口前缀：系统 `/api/v1/private/admin/system`、平台 `/api/v1/private/admin/platform`。
  - 菜单 meta 仅使用约定字段（如 `title`、`icon`、`keepAlive`、`isHide` 等），禁止引入上游前端私有字段（如 `showBadge`、`fixedTab`、`roles` 等）。
  - GET 查询参数清理（仅 GET 生效）：剔除 `undefined/null/空字符串/纯空白字符串`，保留 `0/false`。
  - 仅做必要的最小 UI 映射，如把数字 `status` 映射为布尔 `meta.isEnable` 便于渲染。
  - 认证字段保持：`access_token`、`refresh_token`；不要改用上游 `/api/auth/login`。

- 顶部栏与个人信息（本仓库约定）
  - 已移除通知中心与在线对话入口；顶部栏仅保留刷新、全屏、设置、主题等按钮。
  - 个人信息通过全局组件 `ArtEditInfoDialog` 打开（`mittBus.emit('openEditInfoDialog')`）。
  - 头像使用 `userInfo.avatar`，默认兜底图：`src/assets/img/user/avatar.webp`。

- 全局水印（本仓库约定）
  - 默认文案为“租户编码 | 用户账号”，实现位置：`src/components/core/others/art-watermark/index.vue`。
  - 优先使用传入 `props.content`；否则从用户/租户信息组装；再否则回退 `AppConfig.systemInfo.name`。

- 系统管理页面 UI 约定（本仓库约定）
  - 表格单元格与表头默认居中（`align="center"` + `header-align="center"`）。
  - 不展示序号列（`type: 'index'`）。
  - 操作列：不超过 3 个操作直出按钮；超过则收起到下拉菜单。
  - 全局空值占位：`ArtTable` 统一输出 `--`（保留 `0/false`）。

- 登录页增强（本仓库约定）
  - 支持从 URL 读取 `tenant_code` 并自动填写、锁定租户选择框。

- 移除的功能（保持不回归）
  - 国际化（仅中文 UI）与“快速入口”已彻底移除；合并上游时勿回归。
  - 仪表盘仅保留“工作台（Console）”，已移除演示性质的 `src/views/dashboard/analysis` 与 `src/views/dashboard/ecommerce` 及对应路由。
  - 示例/演示页面目录已删除：`src/views/article`、`src/views/change`、`src/views/examples`、`src/views/result`、`src/views/safeguard`、`src/views/template`、`src/views/widgets`（保留 `src/views/outside`）。

## 升级说明（2025-10）

如果你从旧版本升级到当前版本，请注意：

1. 搜索条属性重命名
   - 全局搜索 `show-reset-button` / `show-search-button` / `disabled-search-button` 已重命名。
   - 项目中可通过检索定位并替换（可参考系统页：`src/views/system/user/index.vue`）。

2. 视图精简（移除示例页面）
   - 删除以下演示/示例视图目录：`src/views/article`、`src/views/change`、`src/views/examples`、`src/views/result`、`src/views/safeguard`、`src/views/template`、`src/views/widgets`。
   - 保留 `src/views/outside` 以支持外链 iframe 嵌入。
   - 已同步精简动态路由配置；可参考系统管理页面作为用法示例。

3. 统计卡片显示 0 值
   - 若你在自定义卡片中使用了 `v-if="count"`，请改为 `v-if\u003d\"count !== undefined\"` 以正确显示 0。

4. 登录接口与多租户
   - 本项目保留自有后台契约：登录返回 `access_token`、`refresh_token`，并保留验证码与租户字段。
   - 如需对接其他后台，请在 `src/api/auth.ts` 中调整端点与参数映射即可。

5. 主题与按需样式
   - 不再手动全量引入 ElementPlus 样式，已通过 `unplugin-element-plus` + SCSS 变量按需生效。
   - 若你额外手动引入了 `el-light.scss`，可移除重复引入，避免体积增大。

6. 忘记密码/注册流程
   - 已移除注册与忘记密码页面；请使用登录页“联系管理员”二维码。
   - 可在环境变量中设置 `VITE_ADMIN_QRCODE_URL` 指向你的客服/工单/企业微信链接。

## 致谢

本项目基于上游开源项目 Daymychen/art-design-pro 二次开发，感谢上游项目及其所有贡献者的长期投入与维护。

- 去除国际化（仅中文）
  - 所有 `$t()` 调用已替换为简体中文静态文案，移除 `vue-i18n` 依赖。
  - 顶栏和设置面板的语言相关入口全部删除，界面始终展示中文。
  - 后续同步上游若出现新的国际化 key，请手动改写为中文字符串，保持单语言模式。

- 去除快速入口
  - 顶部栏“快速入口”默认关闭。
  - 通过 `src/config/headerBar.ts` 禁用（`fastEnter.enabled = false`）。
  - 设置面板对应开关随之隐藏。
