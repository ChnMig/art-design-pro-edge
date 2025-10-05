English | [简体中文](./README.zh-CN.md)

## About Art Design Pro

As a developer, I needed to build admin management systems for multiple projects but found that traditional systems couldn't fully meet the requirements for user experience and visual design. Therefore, I created Art Design Pro, an open-source admin management solution focused on user experience and rapid development. Based on the ElementPlus design specifications, it has been visually optimized to provide a more beautiful and practical front-end interface, helping you easily build high-quality admin systems.

## Official Website

[Visit the official documentation](https://www.artd.pro/docs/en/)

## Demo Images

### Light Theme

![Light Theme](https://www.qiniu.lingchen.kim/art_design_pro_readme_cover1.png)

![Light Theme](https://www.qiniu.lingchen.kim/art_design_pro_readme_cover2.png)

### Dark Theme

![Dark Theme](https://www.qiniu.lingchen.kim/art_design_pro_readme_cover3.png)

![Dark Theme](https://www.qiniu.lingchen.kim/art_design_pro_readme_cover4.png)

## Features

- Uses the latest technology stack
- Built-in common business component templates
- Provides multiple theme modes and customizable themes
- Beautiful UI design, excellent user experience, and attention to detail
- System fully supports customization, meeting your personalized needs

## Functionality

- Rich theme switching
- Global search
- Lock screen
- Multi-tabs
- Global breadcrumbs
- Icon library
- Rich text editor
- Echarts charts
- Utils toolkit
- Network exception handling
- Route-level authentication
- Sidebar menu authentication
- Authentication directives
- Mobile adaptation
- Excellent persistent storage solution
- Local data storage validation
- Code commit validation and formatting
- Code commit standardization

## Compatibility

- Supports modern mainstream browsers such as Chrome, Safari, Firefox, etc.

## Installation and Running

```bash
# Install dependencies
pnpm install

# If pnpm install fails, try using the following command to install dependencies
pnpm install --ignore-scripts

# Start local development environment
pnpm dev

# Build for production
pnpm build
```

## Upstream Version

- Upstream repo: Daymychen/art-design-pro
- Branch: upstream/main
- Commit: 89fbed0ed61bfce5cea983d14693e2a463c53958 (build: core dependency upgrade)
- Sync time: see this repo’s latest sync commit (branch: merge/upstream-sync-202502)

## Project Customizations

This fork syncs upstream while preserving and enhancing the following features:

- Multi-tenant login with image captcha

  - Login page keeps tenant code and image captcha input; captcha can be refreshed by clicking the image.
  - APIs:
    - Get captcha: `GET /system/user/login/captcha` (fn: `src/api/auth.ts:fetchCaptcha`)
    - Login: `POST /system/user/login` (fn: `src/api/auth.ts:fetchLogin`)
    - User info: `GET /system/user/info` (fn: `src/api/auth.ts:fetchGetUserInfo`)
  - Token fields: `access_token`, `refresh_token`.
  - Store enhancements: `src/store/modules/user.ts` keeps `tenantInfo` and `currentTenantCode` for multi-tenant.

- Tenant management

  - Page: `src/views/system/tenant/index.vue`
  - APIs: `src/api/tenant.ts`
  - Types: `Api.SystemTenant.*` in `src/typings/api.d.ts`

- Build & theme

  - Enabled `unplugin-element-plus` with `useSource: true`; theme variables are injected via Vite `css.preprocessorOptions.scss.additionalData` (see `vite.config.ts`).
  - Light theme variables from `@styles/el-light.scss`, dark theme via `@styles/el-dark.scss` and `@assets/styles/dark.scss`.

- Components & styles synced from upstream

  - ArtSearchBar API normalized:
    - `show-reset-button` → `show-reset`
    - `show-search-button` → `show-search`
    - `disabled-search-button` → `disabled-search`
    - Example updated: `src/views/examples/tables/index.vue`
  - ArtStatsCard supports count = 0: use `v-if="count !== undefined"`
    - File: `src/components/core/cards/art-stats-card/index.vue`
  - Login style: align ElSelect height with inputs
    - File: `src/views/auth/login/index.scss`
  - Layout stacking: header `z-index` adjusted to 50
    - File: `src/views/index/style.scss`

- Auth flow simplification
  - Removed Register/Forgot Password pages in favor of a single “Contact Admin via QR code” flow.
  - Login page includes a QR modal; content is configurable via `VITE_ADMIN_QRCODE_URL`.

## Upgrade Notes (2025-10)

If you are upgrading from an older version:

1. ArtSearchBar props renamed

   - Replace any usage of `show-reset-button` / `show-search-button` / `disabled-search-button` with the new props. See `src/views/examples/tables/index.vue`.

2. ArtStatsCard zero values

   - Change `v-if="count"` to `v-if="count !== undefined"` to properly render 0.

3. Login API and multi-tenant

   - This project keeps backend contract: `access_token`/`refresh_token` and captcha + tenant fields.
   - For other backends, adjust endpoints/mapping in `src/api/auth.ts`.

4. Theme and on-demand styles
   - We no longer import ElementPlus styles globally. They are enabled via `unplugin-element-plus` and SCSS variables.
   - Remove any extra manual imports of `el-light.scss` to avoid duplication.

## Technical Support

QQ Group: <a href="https://qm.qq.com/cgi-bin/qm/qr?k=Gg6yzZLFaNgmRhK0T5Qcjf7-XcAFWWXm&jump_from=webapi&authKey=YpRKVJQyFKYbGTiKw0GJ/YQXnNF+GdXNZC5beQQqnGZTvuLlXoMO7nw5fNXvmVhA">821834289</a> (Click the link to join the group chat)

## Donation

If my project has been helpful to you, donations are welcome! Your support will be used to purchase tools like ChatGPT, Cursor, etc., to improve development efficiency and make the project even better. Thank you for your encouragement and support!

![Donation QR Code](https://www.qiniu.lingchen.kim/%E7%BB%84%202%402x%202.png)

- Internationalization removed (Chinese only)

  - The language switcher is hidden and the app defaults to Simplified Chinese.
  - Header language feature is disabled via `src/config/headerBar.ts` (set `language.enabled = false`).
  - Settings panel language toggle is hidden accordingly; runtime locale remains Chinese.
  - i18n runtime is still present to avoid breaking existing `$t()` usage, but switching is disabled.
