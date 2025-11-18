## 任务：同步上游 v3.0.1（art-design-pro）

### 背景

- 本仓库基于 Daymychen/art-design-pro 进行企业化二次开发，当前 README 中记录的上游基线为：
  - 分支：`upstream/main`
  - 提交：`817b854`（tag v3.0.0）
- 通过 `git fetch upstream --prune` 后，上游最新版本为：
  - 分支：`upstream/main`
  - 提交：`66e0704`（`feat: bug fixes and new features`，tag `v3.0.1`）
- 需要在保留本仓库自定义能力（多租户、验证码登录、无 i18n、无快速入口、无演示页等）的前提下，同步上游 v3.0.1。

### 目标

- 将本仓库从上游 v3.0.0 同步至 v3.0.1。
- 保持并强化以下约束：
  - 继续禁用 `vue-i18n` 与所有语言切换 UI。
  - 不回归“快速入口”（`fastEnter`）相关组件与配置。
  - 不回归演示/示例页面：`article/change/examples/result/safeguard/template/widgets` 以及 `dashboard/ecommerce`。
  - 保留多租户登录、图形验证码、二维码联系管理员、平台/系统分层及权限树行为。
- 同步完成后更新：
  - `README.md` 中的“同步来源与版本”。
  - `merge.md` 中的上游基线描述与合并注意事项（如新增需要长期记忆的规则）。

### 当前状态

- 分支：
  - 工作分支：`merge/upstream-sync-3.0.1`（自 `main` 创建）。
  - 远程：`origin`（当前仓库）、`upstream`（Daymychen/art-design-pro）。
- 基线检查：
  - `git status --porcelain`：工作区干净。
  - 上游已获取：`git fetch upstream --prune` 已执行。

### TODO / 阶段拆解

- [x] 创建同步分支并获取上游最新提交信息（v3.0.1）。
- [x] 审阅上游 `CHANGELOG.md` / `CHANGELOG.zh-CN.md` 中 v3.0.1 相关变更，标记对本仓库适用的功能/修复。
- [x] 执行 `git merge upstream/main`，按 `merge.md` 的“合并决策矩阵”逐类处理冲突：
  - [x] 工具链与依赖（`package.json`、`vite.config.ts`、`eslint.config.mjs` 等）。
  - [x] 组件与基础样式（`src/components`、`src/assets/styles`）。
  - [x] 路由与页面（`src/router`、`src/views`），重点确保：
    - [x] 不引入 `vue-i18n` 与语言切换 UI。
    - [x] 不回归 `fastEnter` 及演示页面路由。
  - [x] 类型与 API 契约（`src/types`、`src/api`），确保与后端契约保持一致。
- [x] 清理与本仓库定位不符的上游新增内容：
  - [x] 移除演示页路由和视图：`article/change/examples/result/safeguard/template/widgets`、`dashboard/ecommerce`（本次主要为 `src/views/examples/**`、`src/views/widgets/**` 与对应路由模块）。
  - [x] 移除快速入口相关文件与配置：删除顶栏中的 `<ArtFastEnter />`，保持 `fastEnter` 配置为关闭状态，并确保未引入 `art-fast-enter` 组件与 `art-chat-window` 组件。
  - [x] 移除/改写 `vue-i18n` 相关依赖与代码：删除 `src/locales/**`，移除 `main.ts` 中的 `app.use(language)`，并清理登录/顶部栏中的语言切换 UI 与 `useI18n` 引用。
- [x] 更新文档：
  - [x] 在 `README.md` 中更新同步提交信息为 `66e0704`（v3.0.1）。
  - [x] 更新 `merge.md` 的“当前基线版本”说明，补充本次合并中新增需要长期记忆的注意事项。
  - [x] 若涉及全局约束变更，更新 `.agentdocs/index.md` 中“全局重要记忆”。
- [x] 验证与提交前检查：
  - [x] `pnpm i`
  - [x] `pnpm build`
  - [x] `pnpm lint` 或 `pnpm fix`
  - [x] `pnpm lint:prettier`
  - [x] `pnpm lint:stylelint`

### 关键决策与注意事项（已完成）

- 路由守卫全面切换为上游 v3.0.1 的核心实现：使用 `RouteRegistry`、`MenuProcessor`、`IframeRouteManager` 与 `RoutePermissionValidator` 组合，统一在 `src/router/guards/beforeEach.ts` 中处理权限与动态路由注册，同时严格保持“二次导航使用 `next({ path, query, hash, replace: true })`”的约束。
- 菜单数据获取与规范化统一通过 `MenuProcessor` 完成：前端模式依赖 `asyncRoutes`（仅保留仪表盘、系统管理与异常页面），后端模式依赖 `/api/v1/private/admin/system/user/menu`；所有菜单路径规范化和非法绝对路径检查集中在 `MenuProcessor` 内部处理。
- i18n 相关实现彻底移除：不再引入 `vue-i18n` 依赖，删除 `src/locales/**` 及登录页/顶部栏的语言切换 UI，所有文案保持中文静态文本形式，示例页中的 `useI18n` 也随页面一并删除。
- 演示/示例能力保持删除状态：不再引入 `article/change/examples/result/safeguard/template/widgets` 及 `dashboard/ecommerce` 页面与路由；如需新增业务页面，应直接在 `system` 或业务模块中实现，而非复活示例模块。
- 顶部栏仅保留刷新、全屏、设置和主题切换等业务相关按钮：移除通知中心与在线聊天入口，删除 `ArtChatWindow` 组件及其全局类型声明，快速入口 `ArtFastEnter` 组件不再渲染且对应配置强制保持关闭。
