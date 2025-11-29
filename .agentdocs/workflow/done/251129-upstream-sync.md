# 251129 上游同步（art-design-pro-edge）

## 背景

- 本仓库基于上游 `Daymychen/art-design-pro` 进行企业化二次开发。
- 当前需求：按照 `merge.md` 的“上游同步指南”，将上游 `upstream/main` 的最新变更合并到本仓库，保持与上游在组件、样式与基础设施层面的对齐，同时保留本仓库定制特性（多租户、图形验证码登录、平台/系统分层等）。

## 当前范围

- 上游分支：`upstream/main`
- 目标提交：同步至最新提交 `1c20801d094a7d884f4f5147fd104d1e248489c9`（fix: fix animation missing after opening settings center）。
- 本地工作分支：`merge/upstream-sync-3.0.1`。

## 关键约束与保留点

- 严格遵循 `merge.md` 中的“合并决策矩阵”与“接口分割与前端适配”约束：
  - 工具链、通用组件与样式优先对齐上游；
  - 平台/系统分层、动态菜单、登录契约、水印、路由守卫等保持本仓库实现；
  - 禁止回归 vue-i18n、快速入口、演示/示例页面等被移除能力。
- 不改动后端接口契约：所有接口仍以当前后端实现为准。

## TODO

- [x] 审阅上游最新 CHANGELOG 与差异文件列表，梳理本次需要吸收的改动点（本次上游新增变更集中在锁屏、设置面板、路由守卫与登录示例页）。
- [x] 按主题合并工具链与样式相关改动，确保构建流程与上游保持兼容（本次无工具链变更，仅更新设置面板抽屉动画逻辑）。
- [x] 按组件/页面模块逐步比对并合并上游变更，对业务调用方按需适配（合并 `art-screen-lock` 自动填充修复、`useSettingsPanel` 主题动画修复、`beforeEach` 路由守卫死循环修复，忽略示例页与 i18n 相关改动）。
- [x] 校验平台/系统管理相关页面在同步后的路由与接口行为未被破坏（动态菜单、权限抽屉、平台/系统菜单页面均保持本仓库契约与行为）。
- [x] 通过 `pnpm build` 与必要 lint 检查，确保本次同步不引入新的构建错误（已执行 `pnpm build && pnpm lint && pnpm lint:prettier && pnpm lint:stylelint` 全部通过）。

## 变更记录与思路

- 首次创建：记录 2025-11-29 上游同步任务背景与范围。
- 2025-11-29：对齐上游 `upstream/main@1c20801` 的关键修复，包含：
  - 设置中心：在 `useSettingsPanel` 中引入 `themeChangeTimer`，避免抽屉打开/关闭时主题切换动画丢失或延迟。
  - 路由守卫：在 `beforeEach` 中增加 `routeInitFailed`、`routeInitInProgress` 状态，防止动态路由初始化失败导致的重复请求和死循环，并在注销后重置状态。
  - 锁屏：为锁定/解锁密码输入框增加 `autocomplete="new-password"`，降低浏览器自动填充风险。
  - 文档：更新 `README.md`、`merge.md`、`src/mock/upgrade/changeLog.ts` 对应同步提交与升级说明；未回归上游 i18n、快速入口、演示/示例页面等功能。
