# 251109 - upstream-3.0-sync

## 背景

- 上游 Daymychen/art-design-pro 发布 3.0（commit 817b854），目录结构与样式体系（Tailwind + 新 assets）大规模调整。
- 当前仓库基于 2.6.x 定制了多租户登录、平台/系统分层、HTTP 契约等能力，与上游产生约 450 个文件差异。
- 目标：以保留既有二开特性为前提，完成 3.0 级别的工具链与组件同步，并通过 `pnpm build`/lint 验证。

## 差异现状

- 组件/样式：3.0 引入 Tailwind 与全新 assets 目录，需要确认与 `@styles` 注入兼容。
- 业务页面：`src/views/system/**`、`src/views/platform/**`、`src/api/**` 与上游契约差异大，合并时需优先保留本地实现并适配组件 API。
- 功能约束：3.0 回归了 i18n、快速入口、通知/聊天、示例页等特性，需要在同步后继续禁用。

## 风险

- 冲突文件超过 100 个，涉及 HTTP 层与核心组件；处理不慎容易破坏后端契约。
- 新依赖与锁文件需要重新安装校验，若跳过 `pnpm build` 将难以及时发现类型/自动导入问题。

- 需要多阶段提交，避免一次性变更过大难以回溯。

## TODO

- [ ] Phase 1：合并准备
  - [x] 记录 merge 方案、创建 `.agentdocs/workflow/251109-upstream-3.0-sync.md`
  - [x] 运行 `git fetch upstream --prune` 并记录目标 commit（817b854）
  - [x] `pnpm i && pnpm build`，确保当前基线可构建后再进行合并
- [ ] Phase 2：上游合并与冲突解决
  - [x] 执行 `git merge upstream/main`，按 merge.md 决策矩阵处理（API/业务 ours，组件/样式 theirs）
  - [x] 删除 i18n、快速入口、通知/聊天、示例/演示页面等禁止回归内容（目前上游 3.0 组件广泛依赖 `vue-i18n`，需先评估可行替代方案）
  - [x] 恢复多租户登录、平台范围、权限树等二开特性并与 3.0 新增 `composables/router/core` 体系适配
  - [x] 回补 3.0 引入的 `src/composables`、`src/router/utils`、`src/utils/theme` 等公共模块，解决 `pnpm build` 中缺失依赖
- [x] Phase 3：验证与文档
  - [x] 更新 README/.env/src/mock/upgrade/changeLog 版本信息
  - [x] `pnpm build` + lint 系列（lint、lint:prettier、lint:stylelint）
  - [x] 更新 `.agentdocs/index.md` 当前任务状态，完成后移动任务文档到 done 目录
