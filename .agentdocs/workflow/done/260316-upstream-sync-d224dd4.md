# 上游同步 d224dd4 任务文档

## 背景

- 当前仓库是基于 `Daymychen/art-design-pro` 的企业化二开版本。
- README 记录的上次同步上游提交为 `c4aa8ae9b7bcff3a2e8d393cb53d9a2a6af56747`。
- 本次目标上游提交为 `d224dd4504e23cdf230b242a7f78eb089efdbee5`（`fix: bug fixes, form and routing experience improvements`）。
- 当前工作区不干净，存在用户本地修改：`src/types/auto-imports.d.ts`，以及未跟踪目录 `.suco-auggie/`。

## 目标

- 按 `merge.md` 同步上游共享组件、路由与运行时修复。
- 保留本仓库的后端契约、多租户登录、平台/系统分层、中文单语和已移除功能约束。
- 禁止回归 i18n、fastEnter、示例页/演示页、通知/聊天、注册流程等上游能力。

## 关键约束

- 不在当前脏工作区直接实施，必须使用独立 sibling worktree。
- 路由继续使用 Hash 模式，动态菜单严格以后端契约为准。
- 共享组件以上游为准，业务页面通过改调用方适配，不 fork 组件源码。
- 当前真实生效的菜单编辑入口是 `src/views/system/menu/modal/menuInfo.vue`、`src/views/system/menu/modal/authInfo.vue`、`src/views/platform/menu/modal/menuInfo.vue`、`src/views/platform/menu/modal/authInfo.vue`。
- `src/views/system/menu/modules/menu-dialog.vue` 虽未被当前页面引用，但包含 `showBadge`、`showTextBadge`、`fixedTab`、`activePath`、`roles` 等前端私有字段，属于需要显式收敛或确认废弃状态的风险文件。

## 阶段计划

### Phase 0 - 预检与隔离

- 从 `origin/merge/upstream-sync-3.0.1` 创建独立 worktree 分支。
- 保证当前工作区不被覆盖、不 stash、不 reset。
- 在新 worktree 内先执行基线门禁：`git status --short` 为空、`pnpm build` 可通过；若基线已坏，先停下来确认是否属于仓库既有问题。

### Phase 1 - 禁止回归防线

- 拒绝回归 `src/router/modules/examples.ts`、`src/views/examples/**`、`src/views/widgets/**`、`src/views/template/pricing/index.vue`。
- 拒绝回归 i18n、fastEnter、notice/chat、register。

### Phase 2 - 共享布局与工具层

- 合并菜单滚动、全局搜索、异常页、设置面板、指令类型、导航/存储/错误处理等上游修复。
- `src/App.vue` 只手工移植全局 `card.shadow='never'`，不接回 locale/i18n 逻辑。

### Phase 3 - 路由核心

- 合并 `src/router/core/MenuProcessor.ts`、`src/router/core/RoutePermissionValidator.ts`、`src/router/guards/beforeEach.ts` 的上游增强。
- 保持 Hash 模式和现有 401/动态路由重匹配语义。

### Phase 4 - 共享表单/表格组件

- 合并 `ArtForm`、`ArtSearchBar`、`ArtTable`、`ArtWangEditor` 的上游修复。
- 手工清除任何 i18n 回归。

### Phase 5 - 业务页面适配

- 仅调整 `src/views/system/**`、`src/views/platform/**` 的调用方式。
- 不整体接受上游业务页实现。
- 优先检查并收敛真实生效入口 `src/views/system/menu/modal/menuInfo.vue`、`src/views/platform/menu/modal/menuInfo.vue` 是否会在组件适配后引入前端私有字段回流。
- `src/views/system/menu/modules/menu-dialog.vue` 作为历史风险文件单独处理：若仍保留则同步收敛；若确认废弃则避免再次接入执行链路。

### Phase 6 - 文档与版本

- 更新 `README.md`、`src/mock/upgrade/changeLog.ts`。
- 结合实际吸收内容决定 `.env` 中 `VITE_VERSION` 是否更新。

### Phase 7 - 验证

- 执行 `pnpm build`、`pnpm lint`、`pnpm lint:prettier`、`pnpm lint:stylelint`。
- 进行以下明确冒烟验证：
  - 未登录访问受保护地址时跳转登录，不直接落入 404。
  - 登录后刷新 `/#/system/user`、`/#/system/role` 仍可正常进入页面。
  - 访问根路径 `/` 时，若后端未返回首页，仍兜底到 `/#/dashboard/console`。
  - 侧边菜单内容超高时可滚动；父菜单在可点击场景下仍可跳转。
  - 全局搜索分别验证内部路由、外部链接、iframe 路由三类跳转。
  - 搜索栏提交时会清理空值，但保留 `0` 与 `false`；重置后恢复默认值。
  - 禁止回归路径与功能未重新出现。

## TODO

- [x] 建立独立 worktree 并完成预检
- [x] 合并共享布局与工具层
- [x] 合并路由核心
- [x] 合并共享表单/表格组件
- [x] 适配 system/platform 业务页面
- [x] 更新文档与版本元数据
- [x] 完成构建、lint 与冒烟验证

## 风险记录

- 上游共享组件变更中可能夹带 `useI18n()` 与语言配置，必须手工剔除。
- 路由核心增强可能改变父菜单默认跳转与隐藏路由可达性，需与后端契约逐项核对。
- 真实生效的 system/platform 菜单弹窗若在适配阶段引入前端私有字段，会把不符合契约的字段继续扩散到菜单相关流程。
- `src/views/system/menu/modules/menu-dialog.vue` 若后续被重新接入，也会重新引入同类漂移风险。

## 验证结果

- 已通过：`pnpm build`
- 已执行：`pnpm lint`
- 已执行：`pnpm lint:prettier`
- 已执行：`pnpm lint:stylelint`
- 已验证：登录页可打开，未登录访问静态异常路由会回到登录并保留 `redirect`
- 受后端依赖限制：验证码接口请求返回连接失败，动态菜单登录后场景未在本地完成真实联调，仅完成构建级与静态路由级验证
