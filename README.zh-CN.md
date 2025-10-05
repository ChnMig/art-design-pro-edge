简体中文 | [English](./README.md)

## 关于 Art Design Pro

作为一名开发者，我在多个项目中需要搭建后台管理系统，但发现传统系统在用户体验和视觉设计上不能完全满足需求。因此，我创建了 Art Design Pro，一款专注于用户体验和快速开发的开源后台管理解决方案。基于 ElementPlus 设计规范，进行了视觉上的精心优化，提供更美观、更实用的前端界面，帮助你轻松构建高质量的后台系统。

## 官方网站

[访问官方文档](https://www.artd.pro/docs/)

## 演示图

### 浅色主题

![浅色主题](https://www.qiniu.lingchen.kim/art_design_pro_readme_cover1.png)

![浅色主题](https://www.qiniu.lingchen.kim/art_design_pro_readme_cover2.png)

### 暗黑主题

![暗黑主题](https://www.qiniu.lingchen.kim/art_design_pro_readme_cover3.png)

![暗黑主题](https://www.qiniu.lingchen.kim/art_design_pro_readme_cover4.png)

## 特点

- 使用最新技术栈
- 内置常用业务组件模版
- 提供多种主题模式，可以自定义主题
- 漂亮的 UI设计、极致的用户体验和细节处理
- 系统全面支持自定义设置，满足您的个性化需求

## 技术栈

- 开发框架：Vue3、TypeScript、Vite、Element-Plus
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
- 同步提交：89fbed0ed61bfce5cea983d14693e2a463c53958（build: core dependency upgrade）
- 同步时间：见本仓库最近一次同步提交（分支：merge/upstream-sync-202502）

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
    - 示例已更新：`src/views/examples/tables/index.vue`
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

## 升级说明（2025-10）

如果你从旧版本升级到当前版本，请注意：

1. 搜索条属性重命名

   - 全局搜索 `show-reset-button` / `show-search-button` / `disabled-search-button` 已重命名。
   - 项目中可通过检索定位并替换（示例已更新，参考 `src/views/examples/tables/index.vue`）。

2. 统计卡片显示 0 值

   - 若你在自定义卡片中使用了 `v-if="count"`，请改为 `v-if="count !== undefined"` 以正确显示 0。

3. 登录接口与多租户

   - 本项目保留自有后台契约：登录返回 `access_token`、`refresh_token`，并保留验证码与租户字段。
   - 如需对接其他后台，请在 `src/api/auth.ts` 中调整端点与参数映射即可。

4. 主题与按需样式

   - 不再手动全量引入 ElementPlus 样式，已通过 `unplugin-element-plus` + SCSS 变量按需生效。
   - 若你额外手动引入了 `el-light.scss`，可移除重复引入，避免体积增大。

5. 忘记密码/注册流程
   - 已移除注册与忘记密码页面；请使用登录页“联系管理员”二维码。
   - 可在环境变量中设置 `VITE_ADMIN_QRCODE_URL` 指向你的客服/工单/企业微信链接。

## 技术支持

QQ群：<a href="https://qm.qq.com/cgi-bin/qm/qr?k=Gg6yzZLFaNgmRhK0T5Qcjf7-XcAFWWXm&jump_from=webapi&authKey=YpRKVJQyFKYbGTiKw0GJ/YQXnNF+GdXNZC5beQQqnGZTvuLlXoMO7nw5fNXvmVhA">821834289</a>（点击链接加入群聊）

## 捐赠

如果我的项目对你有所帮助，欢迎捐赠支持！你的支持将用于购买 ChatGPT、Cursor 等工具，以提升开发效率，让项目变得更好。感谢你的鼓励与支持！

![捐赠二维码](https://www.qiniu.lingchen.kim/%E7%BB%84%202%402x%202.png)

- 去除国际化（仅中文）

  - 所有 `$t()` 调用已替换为简体中文静态文案，移除 `vue-i18n` 依赖。
  - 顶栏和设置面板的语言相关入口全部删除，界面始终展示中文。
  - 后续同步上游若出现新的国际化 key，请手动改写为中文字符串，保持单语言模式。

- 去除快速入口

  - 顶部栏“快速入口”默认关闭。
  - 通过 `src/config/headerBar.ts` 禁用（`fastEnter.enabled = false`）。
  - 设置面板对应开关随之隐藏。
