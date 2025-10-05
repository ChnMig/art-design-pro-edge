# 上游同步指南（art-design-pro-edge）

本文档用于记录如何在保留本项目定制功能（多租户、图形验证码登录、二维码联系管理员等）的前提下，同步上游代码，便于后续升级复用。

## 0. 前置条件

- Git 远程
  - `origin`：当前仓库
  - `upstream`：Daymychen/art-design-pro
- Node ≥ 20.19，pnpm ≥ 8.8

## 1. 创建同步分支

```
# 从当前工作分支切出同步分支
git checkout -b merge/upstream-sync-YYYYMM
```

## 2. 获取上游并记录版本

```
git fetch upstream --prune
# 记录本次要同步的上游提交
UPSTREAM_COMMIT=$(git rev-parse upstream/main)
UPSTREAM_COMMIT_MSG=$(git log -1 --format="%H %s" upstream/main)
echo "Sync to: $UPSTREAM_COMMIT_MSG"
```

在 README.md / README.zh-CN.md 中更新“同步来源与版本”（上游 commit 信息）。

## 3. 审阅上游变更

常用对比命令：

```
git log --oneline --decorate --graph --left-right --cherry-pick --no-merges HEAD...upstream/main

# 列出变更文件
git diff --name-status HEAD..upstream/main

# 查看单个文件的上游版本
git show upstream/main:path/to/file
```

## 4. 按主题合并（确保本地定制不回退）

建议采用以下顺序减少冲突：

- 构建/工具链

  - `vite.config.ts`：确保存在 `unplugin-element-plus`（`useSource: true`）、`AutoImport`、`Components`，并在 SCSS `additionalData` 中注入 `@styles/el-light.scss`、variables、mixin。
  - `optimizeDeps.include` 如需包含 element-plus css。

- 核心组件（与上游保持完全一致）

  - 原则：组件源码以上游为唯一真源，不在本仓库做自定义 Fork。若为满足本仓库“项目特点”（多租户、验证码、二维码联系管理员）确需扩展，优先通过调用方适配（调用方式、样式覆写、组合式函数），避免改动组件本体。
  - API 变更：若上游调整了组件 Props/Slots/事件命名或行为，统一“以组件为准、改调用方”。做法：
    1. 逐个对比组件源码（git show upstream/main:path）确认差异；
    2. 直接以 upstream 版本覆盖本地组件文件（如确认为纯上游演进）；
    3. 全局搜用法并按上游 API 批量适配（示例页、系统页一起改）；
    4. 运行构建/冒烟测试，确保渲染和交互正常。
  - 渲染语义：保持与上游一致的判定习惯（如需要渲染 0 值，采用显式 undefined/null 判断）。该条为通用约定，不在本仓库叠加“仅当前版本”的临时性规则。
  - 样式同步：优先采用上游样式和变量，移除不必要的本地覆写；仅在不影响上游升级的前提下为本仓库视觉做最小化适配（例如通过局部作用域样式或容器类名）。

- 登录页

  - 吸收上游样式优化，但保留本地登录流程：
    - 多租户字段 + 图形验证码（可刷新）。
    - 后端契约不变：`access_token` / `refresh_token`。
    - “二维码联系管理员”弹窗（环境变量 `VITE_ADMIN_QRCODE_URL`）。
    - 登录页支持读取 URL 上的 `tenant_code` 参数并自动填写、锁定租户选择框。

- HTTP 层

  - 保留 `src/api/auth.ts` 的接口路径（`/system/user/*`）与返回字段契约。
  - 若上游 HTTP 处理与本地契约冲突，以本地为准（`src/utils/http/*`）。

- 路由与页面

  - 保留本地的路由守卫逻辑，仅吸收安全的上游增强。
  - 注册页仍保持移除状态；忘记密码页保留，为用户提供“联系管理员”指引（二维码/客服信息）。
  - 登录页到忘记密码页的跳转需继续可用，上游新增页面时注意合并本地版本的内容与交互。
  - 快速入口配置文件 `src/config/fastEnter.ts` 已删除（不再保留该功能）。

- 国际化（已彻底移除，需保持中文单语界面）

  1. 删除上游新增的 `vue-i18n` 依赖、`src/locales/*` 文件以及 `app.use(i18n)` 相关调用。
  2. 发现 `$t()` / `useI18n()` / `languageOptions` 等语句，一律改写为中文静态文案并移除对应导入。
  3. 路由、菜单等 meta.title 只能写中文字符串；如上游仍返回 `menus.xxx`，请手动改为中文。
  4. 保持顶栏、设置面板中不会重新出现语言切换相关的 state / handler / UI（参考 `src/components/core/layouts/art-header-bar/index.vue` 与 `src/store/modules/setting.ts` 的现状）。
  5. `src/App.vue` 中的 `ElConfigProvider` 固定使用中文 locale；Element Plus 无需额外同步用户语言。

- 关闭快速入口：`src/config/headerBar.ts` -> `fastEnter.enabled = false`，并将 `src/store/modules/setting.ts` 中 `showFastEnter` 默认设为 `false`

- 顶部栏模块

  - 通知中心与在线对话入口已移除：`src/components/core/layouts/art-header-bar/index.vue` 不再渲染对应按钮，也删除了 `ArtNotification` 弹层及 `mittBus.emit('openChat')` 等逻辑。
  - 上游若重新加入 `notice` / `chat` 相关代码，合并时请同步清理，确保顶部栏仅保留刷新、全屏、设置、主题等按钮；同步移除全局组件配置中的 `chat-window`（`src/config/component.ts`），避免重新加载 `ArtChatWindow` 组件。
  - 用户头像区保持与上游一致：使用 `userInfo.avatar` 作为头像来源，并仅保留“锁定屏幕 / 修改个人信息 / 退出登录”三项菜单，禁止回退到自定义静态头像或增加额外入口；同时确保默认头像文件 `src/assets/img/user/avatar.webp` 保留（供 `setUserInfo` 兜底）。

- 快速入口（彻底精简移除）
  - 移除组件与配置，避免后续同步误引入：
    1. 删除组件目录：`src/components/core/layouts/art-fast-enter/`
    2. 删除组合函数：`src/composables/useFastEnter.ts`
    3. 删除配置文件：`src/config/fastEnter.ts`
    4. 移除引用：
       - 顶栏移除 `<ArtFastEnter />`：`src/components/core/layouts/art-header-bar/index.vue`
       - `src/config/index.ts` 去除 `fastEnter` 引入与导出
    5. 类型与自动导入：`src/types/components.d.ts` 为自动生成文件，如存在 ArtFastEnter 项，运行本地构建后会自动清理；无需手工维护

## 5. 验证

```
pnpm i
pnpm build
pnpm dev
```

冒烟测试：

- 登录：多租户 + 图形验证码 + 二维码弹窗
- 租户管理：列表、创建、更新、删除 // 语言切换：已移除（默认中文）
- ArtSearchBar：示例页与系统页调用是否正确
- 表格：列头/分页/高度/样式

## 6. 文档

- 更新升级日志（必须）
  - 文件：`src/mock/upgrade/changeLog.ts`
  - 在数组头部新增一条记录，包含：`version`（形如 `v2.x.x`）、`title`、`date`（YYYY-MM-DD）、`detail`（要点列表）、`remark/requireReLogin`（如需）。
- 更新 README（必须）
  - 中文：`README.zh-CN.md`
    - “同步来源与版本”中更新上游分支与 Commit（`upstream/main` + 最新 commitId 与 message）。
    - 若有新的定制项或环境变量，也在“项目定制/升级说明”补充。
  - 英文：`README.md`
    - “Upstream Version”中更新最新 Commit 信息。
- 更新环境变量版本号（必须）
  - 文件：`.env`
  - `VITE_VERSION` 同步更新为当前项目发布版本号（与升级日志 version 对齐）。
  - 如使用二维码联系管理员，确认 `VITE_ADMIN_QRCODE_URL` 是否需要调整。

## 7. 提交与 PR

```
git add -A
git commit -m "chore(sync): upstream @ <short-commit> and preserve customizations"
# 提交 PR 并进行代码审阅
```

## 注意事项

- 冲突处理
  - 样式优化与无破坏性改动优先采用上游；若与本地契约冲突，以本地为准。
  - 不可移除：多租户与图形验证码登录。
  - 不要切换到上游的 `/api/auth/login` 与 token 字段命名。
- 安全检查
  - 路由：移除的页面（注册/忘记密码）不得残留死链。
  - 国际化：语言切换入口已隐藏；如无需要，可按需删除 `src/locales/langs/en.json`。
  - 环境变量：如需二维码，引入 `VITE_ADMIN_QRCODE_URL`。
