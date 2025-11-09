# 上游同步指南（art-design-pro-edge）

本文档用于记录如何在保留本项目定制功能（多租户、图形验证码登录、二维码联系管理员等）的前提下，同步上游代码，便于后续升级复用。

## 0. 前置条件

- Git 远程
  - `origin`：当前仓库
  - `upstream`：Daymychen/art-design-pro
- Node ≥ 20.19，pnpm ≥ 8.8

- 校验远程与开发环境（首次或环境变更时建议执行）

  ```
  # 查看远程
  git remote -v
  # 若不存在 upstream，则添加其为上游（任选其一）
  git remote add upstream git@github.com:Daymychen/art-design-pro.git
  git remote add upstream https://github.com/Daymychen/art-design-pro.git

  # 基线校验：确保工作区干净且当前代码可构建
  git status --porcelain   # 输出应为空
  pnpm i
  pnpm build               # 本项目 build 已包含类型检查（vue-tsc）
  ```

## 1. 创建同步分支

```
# 建议从 main 切出，并更新到最新
git switch main || git checkout main
git pull --ff-only origin main

# 从 main 切出同步分支（命名示例）
git checkout -b merge/upstream-sync-YYYYMM

# 可推送远端并创建 Draft PR 便于审阅/CI
git push -u origin merge/upstream-sync-YYYYMM
```

## 2. 获取上游并记录版本（当前基线：v2.6.1）

```
git fetch upstream --prune
# 记录本次要同步的上游提交
UPSTREAM_COMMIT=$(git rev-parse upstream/main)
UPSTREAM_COMMIT_MSG=$(git log -1 --format="%H %s" upstream/main)
echo "Sync to: $UPSTREAM_COMMIT_MSG"
```

在 README.md 中更新“同步来源与版本”（上游 commit 信息）。当前已对齐至：

- 上游分支：`upstream/main`
- 上游提交：`3956355`（fix: bug fix, add theme color switching feature to the authorization page）

同时保持 README 中的 commitId 与本步骤记录的值一致（短/长哈希任选其一，但需前后统一）。

版本号同步（仅显示用途）：`.env` 中的 `VITE_VERSION` 建议与上游发行保持一致（当前为 2.6.0），不影响功能行为。

## 3. 审阅上游变更

常用对比命令：

```
git log --oneline --decorate --graph --left-right --cherry-pick --no-merges HEAD...upstream/main

# 列出变更文件
git diff --name-status HEAD..upstream/main

# 查看单个文件的上游版本
git show upstream/main:path/to/file
```

依赖与关键文件关注点：

```
# 依赖与锁文件是否变更
git diff --name-status HEAD..upstream/main -- package.json pnpm-lock.yaml

# 构建配置、自动导入等工具链文件
git diff --name-status HEAD..upstream/main -- vite.config.ts eslint.config.mjs .prettierrc .stylelintrc.cjs
```

变更日志（必须阅读并映射到本仓库）：

- 阅读上游 `CHANGELOG.md` / `CHANGELOG.zh-CN.md`，逐条判断是否适用本仓库。
- 适用项：按“合并决策矩阵”和“样式与组件（默认合并）”执行；不适用项：在本节或“注意事项”中已有明确排除（如注册/i18n/演示/快速入口/契约冲突等）。
- 将本次吸收的要点补充到本文档相应小节，保持“默认可合并清单”持续更新，减少下次沟通成本。

## 4. 按主题合并（先全量同步，再回放二开）

总体原则：

- 先合并上游最新代码，让“组件/样式/通用基础设施”最大限度与上游保持一致；
- 再回放本仓库“二开特征”（API 契约、业务页面、禁用能力）与必要适配；
- 若上游修改了组件 API 或行为，以组件为准，统一“改调用方”（在本仓库业务页面中适配）。

建议采用以下顺序减少冲突：

- 构建/工具链（优先，保持编译稳定）
  - `vite.config.ts`：确保存在 `unplugin-element-plus`（`useSource: true`）、`AutoImport`、`Components`，并在 SCSS `additionalData` 中注入 `@styles/el-light.scss`、variables、mixin。
  - `optimizeDeps.include`：建议包含 `element-plus/es` 及常用组件样式（如 `element-plus/es/components/*/style/css`、`message/notification/upload/button/icon` 等），并按需加入 `echarts`、`xlsx`、`xgplayer`、`crypto-js`、`file-saver`、`vue-img-cutter`，以降低打包期“组件/样式未导入”导致的异常（参考 v2.6.0）。
  - `AutoImport`：开启 `eslintrc.globalsPropValue: true`，减少 ESLint 全局声明误报（v2.6.0 修复点）。
  - 依赖与锁文件策略：上游如变更 `package.json`，先合并依赖声明，再本地执行 `pnpm i` 同步生成 `pnpm-lock.yaml`，两者一并提交。避免手工改动锁文件。
  - 路由历史模式：保持 `src/router/index.ts` 使用 `createWebHashHistory()`。如上游切换为 `createWebHistory()` 或修改 `base`，本仓库仍坚持 Hash 模式以避免服务端 404（无需服务器配合）。

- 合并决策矩阵（路径优先级）
  - 接受上游（theirs，合并后如有变化，改调用方）：
    - 工具链与样式：`vite.config.ts`（保留必要注入）、`src/assets/styles/**`
    - 通用组件与布局：`src/components/**`（但排除本仓库已禁用功能，见下）
    - 路由与基础工具：`src/router/utils/**`、`src/store/**`（不涉及业务契约的部分）
  - 保留本地（ours，合并后回放特征）：
    - API 与 HTTP 契约：`src/api/**`、`src/utils/http/**`
    - 业务页面（管理端）：`src/views/system/**`、`src/views/platform/**`
    - 认证流程与登录页：`src/views/auth/login/**`（多租户+图形验证码+联系管理员）；`src/views/auth/register/**` 不回归
  - 显式移除/禁止回归：
    - i18n：`src/locales/**`、`$t()/useI18n()`
    - 演示/示例/快速入口/通知/聊天：`src/views/(examples|widgets|template|article|change|result|safeguard)`、`art-fast-enter/**`、`art-notification/**`、`art-chat-window/**`
  - 菜单与动态路由：以后端契约为准，不引入前端私有字段（如 `showBadge` 等）；动态路由注册逻辑可吸收上游增强，但不得改变后端菜单契约。

### 冲突处理与命令速查（高频路径）

- 接受上游（theirs）
  - 工具链/样式/通用组件：`git checkout --theirs vite.config.ts src/assets/styles src/components`
  - 路由/状态基础工具（不含业务契约）：`git checkout --theirs src/router/utils src/store`
  - 批量确认：`git add <paths>` → `git commit`
- 保留本地（ours）
  - API 与 HTTP：`git checkout --ours src/api src/utils/http`
  - 业务页面：`git checkout --ours src/views/system src/views/platform`
  - 认证流程与登录页：`git checkout --ours src/views/auth/login`
- 禁止回归（直接删除或拒绝）：
  - i18n/示例/快速入口/通知/聊天相关新增文件：`git rm <unwanted paths>` 或忽略合并变更
- 辅助工具
  - 可视化解决：`git mergetool`（如已配置）
  - 复用冲突决策：`git config rerere.enabled true`（可选）

### 组件 API 变更后的本地适配流程（改调用方）

1. 定位 API 变化：对比组件源码差异（`git show upstream/main:path/to/component`）。
2. 搜索本仓库业务调用：`rg -n "<ComponentName>|<PropName>|<EventName>" src/views/system src/views/platform`。
3. 批量适配调用写法，确保 props/slots/事件名符合上游最新 API（保留业务契约）。
4. 构建与冒烟验证：`pnpm build`，登录后检查对应页面交互是否符合预期。

提示：业务契约与数据结构始终以后端为准；即便组件有增强，也不要在页面层“凭空造字段或重映射”。

- 样式与交互（默认合并）
  - 原则：非契约性的 UI/动效/样式微调默认合并，不在本文档逐项列举；前提是不改变业务契约与本仓库既有约束。
  - 排除：i18n、演示/示例、快速入口以及与后端契约冲突的改动。

- 核心组件（与上游保持完全一致）
  - 原则：组件源码以上游为唯一真源，不在本仓库做自定义 Fork。若为满足本仓库“项目特点”（多租户、验证码、二维码联系管理员）确需扩展，优先通过调用方适配（调用方式、样式覆写、组合式函数），避免改动组件本体。
  - API 变更：若上游调整了组件 Props/Slots/事件命名或行为，统一“以组件为准、改调用方”。做法：
    1. 逐个对比组件源码（git show upstream/main:path）确认差异；
    2. 直接以 upstream 版本覆盖本地组件文件；
    3. 全局搜本仓库“业务页面”用法并按上游 API 批量适配（system/platform 页面一起改）；
    4. 运行构建/冒烟测试，确保渲染和交互正常。
  - 渲染语义：保持与上游一致的判定习惯（如需要渲染 0 值，采用显式 undefined/null 判断）。该条为通用约定，不在本仓库叠加“仅当前版本”的临时性规则。
  - 样式同步：优先采用上游样式和变量，移除不必要的本地覆写；如需企业风格，仅通过局部作用域或容器类名最小化适配，避免改动组件本体。

  - 登录页

  - 吸收上游样式优化，但保留本地登录流程：
    - 多租户字段 + 图形验证码（可刷新）。
    - 后端契约不变：`access_token` / `refresh_token`。
    - “二维码联系管理员”弹窗（环境变量 `VITE_ADMIN_QRCODE_URL`）。
    - 登录页支持读取 URL 上的 `tenant_code` 参数并自动填写、锁定租户选择框。

  - 选择性 bugfix（按需 cherry-pick 指南）

  - 原则：上游改动如果不与本地的业务契约有冲突则默认合并
  - 工具链：尽量合并
  - 组件/交互：尽量合并, 如与契约有冲突，尝试同步后修改调用方调用方式来适应新的组件/契约
  - 样式/动效：纯 UI 修复默认可合并，不在本文档逐项记录。

- HTTP 层
  - 保留 `src/api/auth.ts` 的接口路径（`/system/user/*`）与返回字段契约。
  - 若上游 HTTP 处理与本地契约冲突，以本地为准（`src/utils/http/*`）。
  - 系统管理相关接口仅按本项目后端契约实现。严禁为“兼容上游纯前端”而在 API 层凭空造字段或做字段重映射。
  - 菜单字段以后端为准：页面与表单不得引入上游独有的前端字段（如 `showBadge`、`showTextBadge`、`fixedTab`、`activePath`、`roles` 等）。如后端未返回，对应 UI 也不应出现；仅保留本项目实际使用并由后端提供/驱动的字段（例如 `title`/`icon`/`path`/`component`/`sort`/`status`/`isHide`/`isIframe`/`keepAlive` 等）。
  - `src/api/system/api.ts` 使用 `/api/v1/private/admin/system` 前缀，并返回后端 payload 的结构；仅做必要的最小化适配（例如把 `status` 映射为布尔 `meta.isEnable` 以便 UI 渲染），不添加无后端来源的扩展键。
  - 全局规则：GET 查询参数清理（`src/utils/http/index.ts`）
    - 仅对 GET 请求生效；POST/PUT 不受影响。
    - 自动剔除 `undefined`、`null`、空字符串及纯空白字符串的参数键；保留 `0` 与 `false`。
    - 目的：避免把“空值”当作有效查询条件拼接到 URL（例如 `?name=&status=`）。
  - 401 处理：拦截器统一登出与提示；路由守卫遇到 401 时取消导航（不跳 500）。

- 菜单管理（UI 对齐）
  - “元素权限”列的按钮与主分支一致：徽标包裹的 `ElButton`，仅图标展示（`More`），徽标 `showZero=false`；实现使用 `resolveComponent('ElBadge')` + `resolveComponent('ElButton')`，避免运行时未注册导致按钮不渲染。
  - 表格居中（全局约定）：所有系统管理下的表格列，默认使用 `align="center"` + `header-align="center"`（除非个别场景需要左对齐，如长文本/多行描述）。新页面、合并上游时都遵循此规则。
  - “元素权限管理”弹窗（`src/views/system/menu/modal/authInfo.vue`）已按上述规则居中显示。
  - 全局不展示序号列：禁止在系统管理页面新增 `type: 'index'` 的序号列（角色、部门、租户等列表已移除），统一使用数据字段或分页信息，不再以序号列占位。
  - 操作列规则：操作项不超过 3 个时直接展示按钮（`ArtButtonTable`），超过 3 个使用下拉（`ArtButtonMore`）。例如“系统/角色”页展示为“权限/编辑/删除”三枚按钮。
  - 空值占位：表格列在未自定义渲染时，统一在全局组件 `ArtTable` 输出占位符 `--`（规则：`undefined/null/''/空白字符串 -> --`，保留 `0/false`）。路径：`src/components/core/tables/art-table/index.vue`。

- 平台管理 vs 系统管理（接口与页面）
  - 系统管理（租户侧，`/api/v1/private/admin/system`）：角色/菜单/部门/用户，接口已适配为当前登录租户的可用范围。
  - 平台管理（超级管理员，`/api/v1/private/admin/platform`）：维护“全局菜单/角色”，并通过“范围接口”为租户分配可用集合。
  - 代码组织：
    - 平台接口：`src/api/platform/api.ts`
    - 平台页面：
      - 租户管理：`src/views/platform/tenant/index.vue`（从系统租户页迁移，功能一致）
      - 菜单管理：`src/views/platform/menu/index.vue`（从系统菜单页拷贝界面，并对接平台菜单/权限/范围接口）
  - 范围规则：
    - 平台“菜单/角色”接口控制的是全局数据；系统端仅能在平台分配范围内选择与查看。

**菜单逻辑与分布（重要）**

- 角色与职责
  - 平台管理员（`/api/v1/private/admin/platform`）
    - 维护全局“菜单定义 + 元素权限”（菜单、元素权限仅在平台侧创建/编辑）
    - 为各租户分配“菜单范围”（租户可见/可选的菜单集合）
  - 租户管理员（`/api/v1/private/admin/system`）
    - 在平台授权的“菜单范围”内，为本租户创建并维护具体角色的“菜单权限”（角色—菜单—元素权限）
    - 维护本租户的部门与用户，并在“本租户角色池”内为用户授予角色

- 数据流与页面映射
  - 平台侧
    - 菜单管理：`src/views/platform/menu/index.vue`
      - 接口：`GET/POST/PUT/DELETE /admin/platform/menu`
      - 元素权限：`GET/POST/PUT/DELETE /admin/platform/menu/auth`
    - 菜单范围（仅抽屉）：`src/views/platform/tenant/scope.vue`
      - 接口（与定义分离）：
        - 查询带 hasPermission 的菜单树：`GET /admin/platform/menu/tenant?tenant_id`
        - 保存租户菜单范围：`PUT /admin/platform/menu/tenant { tenant_id, menu_data }`
    - 角色管理：已移除（平台侧不再维护角色）。
  - 系统侧（租户）
    - 菜单管理：`src/views/system/menu/index.vue`（菜单树已按平台范围裁剪）
      - 接口：`GET/POST/PUT/DELETE /admin/system/menu`、`/admin/system/menu/auth`
    - 角色管理：`src/views/system/role/index.vue`
      - 角色—菜单权限抽屉：`src/views/system/role/auth.vue`
      - 接口：`GET/POST/PUT/DELETE /admin/system/role`、`GET/PUT /admin/system/menu/role`
      - 说明：角色完全由租户侧自行创建与维护，平台不再提供角色管理或范围分配接口。
    - 部门管理：`src/views/system/department/index.vue`
    - 用户管理：`src/views/system/user/index.vue`
    - 不包含页面：系统侧不提供“租户管理”和“个人中心”页面；个人信息通过头像入口打开全局 `ArtEditInfoDialog` 进行更新。

- 接口分割与前端适配（必须遵循）
  - 平台“菜单定义”接口（不带 hasPermission 标记）
    - `GET /api/v1/private/admin/platform/menu`
    - `POST /api/v1/private/admin/platform/menu`
    - `DELETE /api/v1/private/admin/platform/menu`
    - 元素权限定义：`GET/POST/PUT/DELETE /api/v1/private/admin/platform/menu/auth`

  - 平台“租户菜单范围”接口（带 hasPermission 标记）
    - 查询：`GET /api/v1/private/admin/platform/menu/tenant?tenant_id`
    - 保存：`PUT /api/v1/private/admin/platform/menu/tenant { tenant_id, menu_data }`
    - 使用位置：`src/views/platform/tenant/scope.vue`（从租户列表“查看”按钮进入的右侧抽屉）

  - 系统“角色菜单权限”接口（带 hasPermission 标记）
    - 查询：`GET /api/v1/private/admin/system/menu/role?role_id`
    - 保存：`PUT /api/v1/private/admin/system/menu/role { role_id, menu_data }`
    - 使用位置：`src/views/system/role/auth.vue`（角色列表的“权限”抽屉）

  - 前端渲染/提交规则（与 system/role 与 platform/tenant 保持一致）
    - 渲染（默认勾选）：仅当“当前节点及其整棵子树”都为 true 时，才将父节点加入 `checkedKeys`；否则只勾选已为 true 的叶子节点（包含权限子节点）。这样父节点会呈现半选，不会级联把未选中的子节点强行勾上。
    - 提交：父节点 `hasPermission` 以 “选中 ∪ 半选中” 判断（`getCheckedKeys() ∪ getHalfCheckedKeys()`）；子菜单和权限节点按实际勾选设置 true/false。
    - 兼容：`hasPermission` 可能存在于节点顶层或 `meta` 下，值可能为 `true/false/1/0/'1'/'0'/'true'/'false'`，前端需统一归一化。
    - 权限节点（按钮）转换：把 `meta.authList` 转换为树子节点（`id = auth_${menuId}_${authId}`），用于树控件勾选与还原。
    - 二次确认：保存时需 `ElMessageBox.confirm` 二次确认（两处抽屉都已实现），避免误操作。

- 路由与动态菜单
  - 登录后，前端通过 `GET /admin/system/user/menu` 获取“当前用户可见菜单”，据此注册动态路由（`src/router/utils/registerRoutes.ts`）。
  - 菜单 `meta` 字段遵循后端契约，仅使用已约定的键值（`title`/`icon`/`keepAlive`/`isHide` 等）；不引入上游前端专属字段。
  - 平台页面组件路径建议：
    - 菜单管理（定义）：`/platform/menu/index`
    - 菜单范围（租户）：不提供平台页面入口，通过“租户管理”列表的“查看”按钮打开抽屉。
  - 路由守卫关键约定（避免刷新落入 404 的回归）：
    - 首次注册动态路由后，二次导航严禁使用 `next(to)` 或 `next({ ...to })`，应基于“路径重匹配”执行：`next({ path: to.path, query: to.query, hash: to.hash, replace: true })`。原因：刷新时初次匹配多为静态 404，携带其 matched/name 会持续落入 404。
    - 在注册动态路由前，同步将菜单写入 Store：`useMenuStore().setMenuList(menuList)`，以便侧边栏与首页路径计算（`getFirstMenuPath`）立即可用。
    - 登出/重置需清理：调用 `resetRouterState()`，执行 `menuStore.removeAllDynamicRoutes()`，并清空 `menuStore.setMenuList([])` 与 `sessionStorage('iframeRoutes')`，避免残留动态路由与缓存。
    - 根路径跳转：登录且已完成注册时，如命中根路径 `/`，根据 `useCommon().homePath.value` 重定向到首页；若后端未返回首页，使用仪表盘 `/dashboard/console` 作为兜底。
  - 访问模式与 roles（环境变量约定）：
    - `VITE_ACCESS_MODE=backend`（默认）：严格按后端返回菜单注册；忽略前端 `roles`。后端不应返回 `roles`。
    - `VITE_ACCESS_MODE=frontend`（开发/演示）：使用本地 `src/router/routes/asyncRoutes.ts`。该文件可带 `meta.roles` 做前端过滤，但仅限本地前端模式，禁止反向影响后端契约。
  - 后端路由字段契约（component/path/name 必读）：
    - `path`：子级为相对路径，父子拼接形成最终路径；顶级使用以 `/` 开头的一级路径（例如 `/system`）。
    - `component`：指向 `src/views` 下的视图相对路径（不含扩展名），支持两种：`/a/b`（映射 `src/views/a/b.vue`）或 `/a/b/index`（映射 `src/views/a/b/index.vue`）。一级菜单容器使用 `RoutesAlias.Layout`（`/index/index`）。
    - `name`：全局唯一，避免与静态路由名冲突（保留名：`Login`、`Exception403/404/500`、`Outside`、`Iframe`）。
    - iframe 外链：`meta.isIframe=true` 且提供 `meta.link`，其余按 `registerRoutes.ts` 的 iframe 规则生成。
    - 隐藏菜单：`meta.isHide=true` 时侧边栏不展示，但可直接访问；请避免把首页标记为隐藏。

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
  - 顶栏“修改个人信息”入口需联动全局组件 `ArtEditInfoDialog`：保留 `mittBus.emit('openEditInfoDialog')` 事件，确保 `src/components/core/layouts/art-edit-info/index.vue` 及其在 `src/config/component.ts` 的挂载项存在，并使用 `/api/v1/private/admin/system/user/info` 的 GET/PUT 接口同步更新用户信息（提交字段需匹配新文档：`username`、`phone`、`gender`、`password`）。
  - 用户头像区保持与上游一致：使用 `userInfo.avatar` 作为头像来源，并仅保留“锁定屏幕 / 修改个人信息 / 退出登录”三项菜单，禁止回退到自定义静态头像或增加额外入口；同时确保默认头像文件 `src/assets/images/user/avatar.webp` 保留（供 `setUserInfo` 兜底），并在 `ArtUserMenu` 中对无效地址（例如 `/src/**`、`@/**`）回退到该默认头像。
  - 头像浮层信息不得简化：头像右侧需展示“租户：{code - name}”“账号：{account}”“邮箱”三段信息（按实际存在显示），字段取值顺序为 `userInfo.userName/username/nickName/account/email` 与 `tenantInfo.code/tenantInfo.name/currentTenantCode`，参考 `src/components/core/layouts/art-header-bar/widget/ArtUserMenu.vue` 现有实现；合并上游后如弹层信息被删改，必须回放此逻辑。
  - 全局水印：使用“租户编码 | 用户账号”作为默认文案（登录时填写的两项），实现于 `src/components/core/others/art-watermark/index.vue`。行为规范：
    - 优先使用传入 props.content；未显式传入时，按“tenant_code | account”组装；若两项缺失，回退为系统名称 `AppConfig.systemInfo.name`。
    - 租户编码来源：`userStore.getTenantInfo.code` 或 `userStore.getCurrentTenantCode`；用户账号来源：`userStore.getUserInfo.account || username || userName`。
    - 上游如变更用户信息字段命名，同步更新该组件内的字段映射，不要在调用方硬编码水印文本。

- 快速入口（彻底精简移除）
  - 移除组件与配置，避免后续同步误引入：
    1. 删除组件目录：`src/components/core/layouts/art-fast-enter/`
    2. 删除组合函数：`src/composables/useFastEnter.ts`
    3. 删除配置文件：`src/config/fastEnter.ts`
    4. 移除引用：
       - 顶栏移除 `<ArtFastEnter />`：`src/components/core/layouts/art-header-bar/index.vue`
       - `src/config/index.ts` 去除 `fastEnter` 引入与导出
    5. 类型与自动导入：`src/types/components.d.ts` 为自动生成文件，如存在 ArtFastEnter 项，运行本地构建后会自动清理；无需手工维护

- 示例页面（彻底精简移除，outside 保留）
  - 目标目录：
    - `src/views/article/`
    - `src/views/change/`
    - `src/views/examples/`
    - `src/views/result/`
    - `src/views/safeguard/`
    - `src/views/template/`
    - `src/views/widgets/`
  - 保留目录：`src/views/outside/`（用于 iframe 外链页面承载）
  - 路由同步：
    - 本地 `src/router/routes/asyncRoutes.ts` 已精简，仅保留“仪表盘/系统管理/异常页面/外链示例”四类；若上游再次引入示例菜单，请在合并时删除对应菜单项。
    - `src/router/routesAlias.ts` 已移除示例路由别名（如 Widgets/Template/Examples/Article/Result/Safeguard 等）；如上游回归，请勿恢复。
  - 文档同步：README 已注明“示例页面精简”；合并时如上游文档提及示例目录，请忽略或改为系统页面示例。

- 仪表盘演示页与系统嵌套菜单（不合并）
  - 不合并内容：
    - 仪表盘演示页：`src/views/dashboard/analysis`、`src/views/dashboard/ecommerce`
    - 系统嵌套演示：`src/views/system/nested/**`
  - 路由约束：
    - 仅保留工作台（Console）。`src/router/modules/dashboard.ts` 的 `children` 里只允许 `console`；移除 `analysis/ecommerce`。
    - 系统模块不包含 `nested` 多级演示菜单。`src/router/modules/system.ts` 中删除 `nested` 相关配置。
    - `src/router/routesAlias.ts` 不应包含 `Analysis/Ecommerce/Nested*` 别名。
  - 快速清理命令：

    ```bash
    # 移除演示视图目录
    git rm -rf src/views/dashboard/analysis src/views/dashboard/ecommerce src/views/system/nested || true

    # 预览路由是否仍有引用
    rg -n "dashboard/(analysis|ecommerce)|system/nested|NestedMenu|RoutesAlias\.(Analysis|Ecommerce)" src
    ```

  - 合并后校验：运行 `pnpm build` 应无缺失组件/路径错误；导航菜单仅出现工作台与业务菜单。

## 5. 验证

```
pnpm i
pnpm build
pnpm fix             # 等价于 `pnpm lint --fix`，先自动修复可修复项
pnpm dev
pnpm lint            # 代码规范（确认无残留错误）
pnpm lint:stylelint  # 样式规范（如配置可用）
pnpm lint:prettier   # Markdown/JSON/样式格式化检查（如配置可用）
```

版本校验：

- 运行 `pnpm build` 时，控制台打印 `🚀 VERSION = 2.6.0`（来自 `.env`），仅用于显示，不影响功能。

视觉/行为校验（合并后回放二开特征，检查调用方已适配组件 API）：

- 组件调用：system / platform 页面组件调用是否符合上游最新 API；无运行时警告
- 动态菜单：登录后按后端菜单契约正常注册；meta 字段契约不变
- 401 行为：未登录访问受限路由不出现 500；由拦截器统一退出并提示
- 登录页：多租户/图形验证码/联系管理员入口正常
- 样式外观：采用上游样式为主，企业化局部样式不影响上游升级
- 刷新行为：已登录状态下刷新受保护页面，不应落入 404；侧边菜单保持渲染且首页跳转正确
- 路由契约：后端返回的 `component/path/name` 满足“后端路由字段契约”；无重复 `name`，与静态路由不冲突
- 历史模式：保持 Hash，刷新与直链访问均正常

冒烟测试：

- 登录：多租户 + 图形验证码 + 二维码弹窗
- 租户管理：列表、创建、更新、删除 // 语言切换：已移除（默认中文）
- ArtSearchBar：示例页与系统页调用是否正确
- 表格：列头/分页/高度/样式
- 动态菜单注册：登录后根据 `GET /admin/system/user/menu` 成功注入路由；菜单 meta 与后端契约一致。
- 权限抽屉一致性：`system/role/auth.vue` 与 `platform/tenant/scope.vue` 勾选/半选/提交规则一致。
- 头像菜单：仅“锁定屏幕/修改个人信息/退出登录”三项，`ArtEditInfoDialog` 正常打开与提交。
- 水印：默认文案“租户编码 | 用户账号”正确，props.content 覆盖优先。
- 平台范围：租户端菜单树已按平台分配范围裁剪。

## 6. 文档

- 更新升级日志（必须）
  - 文件：`src/mock/upgrade/changeLog.ts`
  - 在数组头部新增一条记录，包含：`version`（形如 `v2.x.x`）、`title`、`date`（YYYY-MM-DD）、`detail`（要点列表）、`remark/requireReLogin`（如需）。
- 更新 README（必须）
  - 文件：`README.md`
  - “同步来源与版本”中更新上游分支与 Commit（`upstream/main` + 最新 commitId 与 message）。
  - 若有新的定制项或环境变量，也在“项目定制/升级说明”补充。
  - 统一性：README 中记录的 commitId 与“第 2 步记录”的值保持一致（短/长哈希任选其一）。
- 更新环境变量版本号（必须）
  - 文件：`.env`
  - `VITE_VERSION` 同步更新为当前项目发布版本号（与升级日志 version 对齐）。
  - 如使用二维码联系管理员，确认 `VITE_ADMIN_QRCODE_URL` 是否需要调整。

## 7. 提交与 PR

```
git add -A
git commit -m "chore(sync): upstream @ <short-commit> and preserve customizations"
# 提交 PR 并进行代码审阅
git push -u origin HEAD
```

- 建议使用 Draft PR 先跑 CI/预审，确认无误后转正式 PR；标题、描述中附上上游 commitId 与本次合并要点。

## 8. 回滚与应急

- 合并前备份（可选但推荐）

```
git branch backup/before-sync-$(date +%Y%m%d)
```

- 合并后发现问题的回退策略

```
# 方式 A：优先使用 revert，保留历史（推荐）
git log --oneline --merges      # 找到本次合并的 merge-commit
git revert -m 1 <merge-commit>  # 生成反向提交回滚

# 方式 B：基于备份分支恢复（需谨慎，如已推送需与团队确认是否强推）
git reset --hard backup/before-sync-YYYYMMDD
git push -f origin HEAD
```

- 发布标签回退（如存在发行标签）

```
git switch -c hotfix/rollback <last_release_tag>
```

```

## 注意事项

- 冲突处理
  - 样式优化与无破坏性改动优先采用上游；若与本地契约冲突，以本地为准。
  - 不可移除：多租户与图形验证码登录。
  - 不要切换到上游的 `/api/auth/login` 与 token 字段命名。
- 安全检查
  - 路由：移除的页面（注册/忘记密码）不得残留死链。
- 国际化：项目为中文单语，语言文件已删除并禁止回归（`src/locales/langs/*.json`）。
  - 如合并后出现语言文件或语言切换入口，请一并移除。
  - 上游引入/调整的 i18n 代码统一不回归；发现 `$t()/useI18n()` 直接改为中文静态文案并移除导入。
  - 环境变量：如需二维码，引入 `VITE_ADMIN_QRCODE_URL`。

- 控制台与推广文案（保持精简）
  - 移除“技术支持/QQ群/捐赠”等推广性文案的控制台输出，保留中性欢迎与上游 Star 信息即可。
  - 文件：`src/utils/sys/console.ts`
  - 文档：README 不包含“技术支持/捐赠”等章节；上游若回归相关内容，合并时一并清理。
```
