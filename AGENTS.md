# AGENTS 指南（art-design-pro-edge）

本仓库为企业化定制版本，基于上游 Daymychen/art-design-pro 二次开发。此文档用于约束 AI 代理在本仓库的协作方式（代码变更、验证流程、合并策略）。

## 技术栈与命令

- Node >= 20.19，pnpm >= 8.8
- 开发命令：`pnpm dev`
- 构建命令（包含类型检查）：`pnpm build`（`vue-tsc --noEmit` + `vite build`）
- 代码质量：
  - ESLint：`pnpm lint` / 自动修复：`pnpm fix`
  - Prettier：`pnpm lint:prettier`
  - Stylelint：`pnpm lint:stylelint`

## 验证要求（必须满足）

每次提交前，至少本地通过以下检查：

1. 安装依赖：`pnpm i`
2. 类型检查 + 构建：`pnpm build`
3. 代码格式与样式（按需执行）：
   - `pnpm lint`（或 `pnpm fix`）
   - `pnpm lint:prettier`
   - `pnpm lint:stylelint`

说明：项目暂无单测框架，勿自行引入。若需关键逻辑的回归保障，优先通过类型约束与 e2e 级别的冒烟构建校验。

## 上游同步策略（摘要）

- 核心遵循 `merge.md`：
  - 不可回归：国际化（vue-i18n）、快速入口、示例/演示页面。
  - 组件源码以上游为准；如需扩展，优先在调用方适配，不 fork 组件本体。
  - HTTP 层以后端契约为准，不前端造字段或重映射。
  - 平台/系统分层与权限树行为遵循本仓库契约。
- 合并顺序：工具链/构建 → 组件 → 页面业务；锁文件通过 `pnpm i` 生成，不手改。

## 提交规范

- 推荐遵循 `cz-git` 的 commit 规范。
- 避免一次性提交过多无关改动；小步提交、主题清晰。

## 代码风格

- 组件/页面文案使用中文；如引入英文专业名词，首次出现附简要中文释义。
- 保持实现简单、干净；移除未使用的变量、函数、组件与样式。
