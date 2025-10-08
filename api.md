# API 接口文档

## 项目概览

本项目是基于 Go + Gin + GORM + PostgreSQL + Redis 的多租户管理系统后端 API。

**技术栈：**

- `Golang` - 后端编程语言
- `Gin` - Web 框架
- `GORM` - ORM 框架
- `PostgreSQL` - 主数据库
- `Redis` - 缓存和会话存储
- `JWT` - 身份认证
- `Zap` - 日志记录

**服务地址：** `http://localhost:{port}`

**API 版本：** `v1`

**基础路径：** `/api/v1`

## 通用说明

### 请求格式

- Content-Type: `application/json`
- 字符编码: `UTF-8`

### 响应格式

所有 API 接口返回统一的 JSON 格式：

```json
{
  "code": 200,
  "status": "OK",
  "message": "请求成功",
  "data": {},
  "timestamp": 1640995200,
  "total": 100
}
```

**响应字段说明：**

- `code` - 业务状态码（HTTP 始终为 200）
- `status` - 字符串状态标识
- `message` - 响应消息
- `data` - 响应数据
- `timestamp` - 响应时间戳（秒）
- `total` - 数据总数（仅分页接口返回）

### 通用状态码

| 状态码 | 状态标识            | 说明                         |
| ------ | ------------------- | ---------------------------- |
| 200    | OK                  | 请求成功                     |
| 400    | INVALID_ARGUMENT    | 请求参数错误                 |
| 400    | FAILED_PRECONDITION | 无法执行客户端请求           |
| 400    | OUT_OF_RANGE        | 客户端越限访问               |
| 401    | UNAUTHENTICATED     | 身份验证失败                 |
| 403    | PERMISSION_DENIED   | 客户端权限不足               |
| 404    | NOT_FOUND           | 资源不存在                   |
| 409    | ABORTED             | 数据处理冲突                 |
| 409    | ALREADY_EXISTS      | 资源已存在                   |
| 429    | RESOURCE_EXHAUSTED  | 资源配额不足或达不到速率限制 |
| 499    | CANCELLED           | 请求被客户端取消             |
| 500    | DATA_LOSS           | 处理数据发生错误             |
| 500    | UNKNOWN             | 服务器未知错误               |
| 500    | INTERNAL            | 服务器内部错误               |
| 501    | NOT_IMPLEMENTED     | API不存在                    |
| 503    | UNAVAILABLE         | 服务不可用                   |
| 504    | DEALINE_EXCEED      | 请求超时                     |

### 认证机制

除登录和验证码接口外，所有接口都需要在 Header 中携带 JWT Token：

```
Authorization: Bearer {your_jwt_token}
```

### 分页参数

支持分页的接口通用参数：

- `page` - 页码，从1开始，默认1
- `pageSize` - 每页数量，默认20

### 多租户支持

系统支持多租户架构，需要在登录时提供 `tenant_code` 租户编码。

---

## 系统管理接口

### 1. 用户认证

#### 1.1 获取登录验证码

**接口描述：** 获取图片验证码

**请求方式：** `GET`

**请求路径：** `/api/v1/admin/system/user/login/captcha`

**请求参数：**

- `width` (必填) - 图片宽度
- `height` (必填) - 图片高度

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "message": "请求成功",
  "data": {
    "id": "Nz0z0L7c5t9GxOXLiVWV",
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSU..."
  },
  "timestamp": 1640995200
}
```

#### 1.2 用户登录

**接口描述：** 用户登录认证

**请求方式：** `POST`

**请求路径：** `/api/v1/admin/system/user/login`

**请求参数：**

```json
{
  "tenant_code": "platform",
  "account": "admin",
  "password": "123456",
  "captcha": "1234",
  "captcha_id": "Nz0z0L7c5t9GxOXLiVWV"
}
```

**参数说明：**

- `tenant_code` **(必填)** - 租户编码
- `account` **(必填)** - 登录账号
- `password` **(必填)** - 登录密码
- `captcha` **(必填)** - 验证码
- `captcha_id` **(必填)** - 验证码ID

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "message": "请求成功",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tenant_info": {
      "tenant_id": 1,
      "tenant_code": "platform",
      "tenant_name": "平台管理"
    },
    "user_info": {
      "user_id": 1,
      "name": "超级管理员",
      "username": "admin",
      "account": "admin"
    }
  },
  "timestamp": 1640995200
}
```

#### 1.3 租户编码模糊查询

**接口描述：** 登录页用，根据用户输入模糊查询租户编码，返回最多 10 条。

**请求方式：** `GET`

**请求路径：** `/api/v1/admin/system/user/login/tenant`

**请求参数：**

- `code` (必填) - 用户输入的租户编码片段，长度必须大于或等于系统配置的最小长度（默认 3）。

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "message": "请求成功",
  "data": [{ "id": 1, "code": "platform", "name": "平台管理" }],
  "timestamp": 1640995200
}
```

### 2. 用户管理

#### 2.1 获取用户信息

**接口描述：** 获取当前登录用户信息

**请求方式：** `GET`

**请求路径：** `/api/v1/admin/system/user/info`

**请求头：** `Authorization: Bearer {token}`

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "id": 1,
    "tenant_id": 1,
    "department_id": 1,
    "role_id": 1,
    "name": "超级管理员",
    "username": "admin",
    "account": "admin",
    "phone": "13800138000",
    "gender": 1,
    "status": 1,
    "created_at": 1640995200,
    "updated_at": 1640995200
  },
  "timestamp": 1640995200
}
```

#### 2.2 更新用户信息

**接口描述：** 更新当前登录用户信息

**请求方式：** `PUT`

**请求路径：** `/api/v1/admin/system/user/info`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

```json
{
  "username": "新昵称",
  "phone": "13900139000",
  "gender": 1,
  "password": "可选，若传则更新"
}
```

- `username` - 用户昵称，支持修改
- `phone` - 手机号
- `gender` - 性别 (1 男 / 2 女)
- `password` - 可选，提供则更新密码

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "message": "请求成功",
  "data": "更新用户成功",
  "timestamp": 1640995200
}
```

#### 2.3 获取用户列表

**接口描述：** 分页查询用户列表

**请求方式：** `GET`

**请求路径：** `/api/v1/admin/system/user`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

- `username` - 用户名（可选）
- `name` - 姓名（可选）
- `phone` - 手机号（可选）
- `department_id` - 部门ID（可选）
- `role_id` - 角色ID（可选）
- `page` - 页码
- `pageSize` - 每页数量

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "id": 1,
      "tenant_id": 1,
      "department_id": 1,
      "department_name": "管理中心",
      "role_id": 1,
      "role_name": "超级管理员",
      "role_desc": "拥有所有权限",
      "username": "admin",
      "name": "超级管理员",
      "account": "admin",
      "phone": "13800138000",
      "gender": 1,
      "status": 1,
      "created_at": 1640995200,
      "updated_at": 1640995200
    }
  ],
  "total": 1,
  "timestamp": 1640995200
}
```

**字段说明：**

- `role_name` / `role_desc` - 用户所属角色名称与描述。
- `department_name` - 用户所属部门名称。
- `created_at` / `updated_at` - 记录创建与更新时间，Unix 时间戳（秒）。
- 其余字段保持与用户实体一致，不包含密码信息。

#### 2.4 获取用户缓存列表

**接口描述：** 从缓存获取用户列表（性能更优）

**请求方式：** `GET`

**请求路径：** `/api/v1/admin/system/user/cache`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

- `username` - 用户名（可选）
- `name` - 姓名（可选）
- `id` - 用户ID（获取单个用户信息）
- `page` - 页码
- `pageSize` - 每页数量

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "message": "请求成功",
  "data": [
    {
      "id": 1,
      "username": "admin",
      "name": "超级管理员",
      "role_id": 1,
      "role_name": "超级管理员"
    }
  ],
  "total": 1,
  "timestamp": 1640995200
}
```

> 提示：当携带 `id` 参数时，返回的 `data` 为单个用户对象且不包含 `total` 字段。

#### 2.5 新增用户

**接口描述：** 创建新用户

**请求方式：** `POST`

**请求路径：** `/api/v1/admin/system/user`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

```json
{
  "name": "新用户",
  "username": "newuser",
  "account": "newuser",
  "password": "123456",
  "phone": "13800138001",
  "gender": 1,
  "status": 1,
  "role_id": 2,
  "department_id": 1
}
```

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "message": "请求成功",
  "data": null,
  "timestamp": 1640995200
}
```

> 说明：`role_id` 必须为当前租户已创建的角色。

#### 2.6 更新用户

**接口描述：** 更新用户信息

**请求方式：** `PUT`

**请求路径：** `/api/v1/admin/system/user`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

```json
{
  "id": 1,
  "name": "更新后姓名",
  "username": "admin",
  "account": "admin",
  "phone": "13800138000",
  "gender": 1,
  "status": 1,
  "role_id": 1,
  "department_id": 1,
  "password": "可选"
}
```

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "message": "请求成功",
  "data": null,
  "timestamp": 1640995200
}
```

#### 2.7 删除用户

**接口描述：** 删除用户（软删除）

**请求方式：** `DELETE`

**请求路径：** `/api/v1/admin/system/user`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

```json
{
  "id": 1
}
```

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "message": "请求成功",
  "data": null,
  "timestamp": 1640995200
}
```

### 3. 平台菜单与租户范围（超级管理员）

**说明：** 平台侧维护系统菜单定义，同时可为指定租户配置“可用菜单范围”。GET/PUT `/api/v1/admin/platform/menu` 接口接受 `tenant_id` 参数，并返回（或保存）该租户的菜单范围，响应包含“全部菜单与权限”，并在其中标记该租户当前已拥有的菜单和按钮权限。

#### 3.1 获取指定租户的菜单范围（带权限标记）

- **请求方式：** `GET`
- **请求路径：** `/api/v1/admin/platform/menu`
- **查询参数：** `tenant_id`（必填）
- **请求头：** `Authorization: Bearer {token}`

接口返回所有菜单与其权限列表，并对属于该租户范围内的菜单（及其下的按钮权限）设置 `hasPermission = true` 标记，便于前端直接呈现勾选状态。

#### 3.2 新增平台菜单（定义）

- **请求方式：** `POST`
- **请求路径：** `/api/v1/admin/platform/menu`
- **请求参数：**

```json
{
  "path": "/platform/menu",
  "name": "PlatformMenu",
  "component": "/platform/menu/index",
  "title": "菜单管理",
  "status": 1,
  "parentId": 2,
  "sort": 3
}
```

#### 3.3 更新指定租户的菜单范围

- **请求方式：** `PUT`
- **请求路径：** `/api/v1/admin/platform/menu`
- **请求体：**

```json
{
  "tenant_id": 1,
  "menu_data": "[ { \"id\":6, \"hasPermission\":true, \"children\":[ ... ] } ]"
}
```

当 `menu_data` 中某节点 `hasPermission` 为 `true` 时，该菜单会被加入该租户的范围。按钮权限的 `hasPermission` 仅用于呈现；目前租户范围按“菜单级别”存储，按钮权限将根据已授权菜单自动标记允许。

#### 3.4 删除平台菜单（定义）

- **请求方式：** `DELETE`
- **请求路径：** `/api/v1/admin/platform/menu`

#### 3.5 菜单权限定义管理（定义层）

- `GET /api/v1/admin/platform/menu/auth`
- `POST /api/v1/admin/platform/menu/auth`
- `PUT /api/v1/admin/platform/menu/auth`
- `DELETE /api/v1/admin/platform/menu/auth`

请求与响应结构与原有示例保持一致，仅路径前缀为 `/admin/platform`。

### 4. 租户菜单管理

**说明：** 租户管理员通过 `/api/v1/admin/system` 前缀调用，仅能操作平台授权范围内的数据。注意：租户端不提供菜单的增删改查与权限定义接口（菜单管理仅平台端可操作）。

#### 4.1 获取当前用户菜单

- **请求方式：** `GET`
- **请求路径：** `/api/v1/admin/system/user/menu`
- **请求头：** `Authorization: Bearer {token}`

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "id": 5,
      "name": "系统管理",
      "path": "/system",
      "icon": "&#xe72b;",
      "children": [
        { "id": 6, "name": "角色管理", "path": "/system/role" },
        { "id": 7, "name": "部门管理", "path": "/system/department" },
        { "id": 8, "name": "用户管理", "path": "/system/user" }
      ]
    }
  ],
  "timestamp": 1640995200
}
```

#### 4.2 获取角色菜单权限

- **请求方式：** `GET`
- **请求路径：** `/api/v1/admin/system/menu/role`
- **请求参数：** `role_id`（必填）

#### 4.3 更新角色菜单权限

- **请求方式：** `PUT`
- **请求路径：** `/api/v1/admin/system/menu/role`
- **请求体：**

```json
{
  "role_id": 2,
  "menu_data": "[ { \"id\":6, \"hasPermission\":true } ]"
}
```

当请求体包含超出平台授权范围的菜单节点时，将返回 `PERMISSION_DENIED`。

### 5. 部门管理

#### 5.1 获取部门列表

**接口描述：** 获取部门列表

**请求方式：** `GET`

**请求路径：** `/api/v1/admin/system/department`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

- `name` - 部门名称（可选）
- `status` - 状态（可选，1启用/2禁用）
- `page` - 页码
- `pageSize` - 每页数量

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "id": 1,
      "name": "管理中心",
      "status": 1,
      "sort": 1,
      "created_at": 1640995200,
      "updated_at": 1640995200
    }
  ],
  "timestamp": 1640995200
}
```

#### 5.2 新增部门

**接口描述：** 创建新部门

**请求方式：** `POST`

**请求路径：** `/api/v1/admin/system/department`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

```json
{
  "name": "部门名称",
  "status": 1,
  "sort": 1
}
```

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "message": "请求成功",
  "data": {
    "id": 6,
    "created_at": 1640995200,
    "updated_at": 1640995200,
    "name": "部门名称",
    "sort": 1,
    "status": 1
  },
  "timestamp": 1640995200
}
```

#### 5.3 更新部门

**接口描述：** 更新部门信息

**请求方式：** `PUT`

**请求路径：** `/api/v1/admin/system/department`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

```json
{
  "id": 6,
  "name": "部门名称",
  "status": 2,
  "sort": 10
}
```

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "message": "请求成功",
  "data": {
    "id": 6,
    "created_at": 1640995200,
    "updated_at": 1641002400,
    "name": "部门名称",
    "sort": 10,
    "status": 2
  },
  "timestamp": 1641002400
}
```

#### 5.4 删除部门

**接口描述：** 删除部门

**请求方式：** `DELETE`

**请求路径：** `/api/v1/admin/system/department`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

```json
{
  "id": 1
}
```

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "message": "请求成功",
  "data": {
    "id": 1,
    "created_at": 1640995200,
    "updated_at": 1640998800,
    "deleted_at": 1641002400,
    "name": "管理中心",
    "sort": 1,
    "status": 1
  },
  "timestamp": 1641002400
}
```

### 6. 角色管理

#### 6.1 平台角色管理（超级管理员）

- **获取角色列表：** `GET /api/v1/admin/platform/role`，需要查询参数 `tenant_id` 指定目标租户。
- **创建角色：** `POST /api/v1/admin/platform/role`，请求体需包含 `tenant_id`、`name`、`status`、`desc`。
- **更新角色：** `PUT /api/v1/admin/platform/role`，可调整角色名称、描述、状态以及归属租户。
- **删除角色：** `DELETE /api/v1/admin/platform/role`。

> 说明：平台管理员创建或修改的角色仅对指定租户生效，可用于初始化或协助运营处理。

**示例 - 获取角色列表：**

```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "id": 1,
      "tenant_id": 1,
      "name": "超级管理员",
      "desc": "拥有所有权限",
      "status": 1,
      "created_at": 1640995200
    }
  ],
  "total": 1,
  "timestamp": 1640995200
}
```

#### 6.2 租户角色管理

- **获取角色列表：** `GET /api/v1/admin/system/role`，自动限定为当前登录租户。
- **创建角色：** `POST /api/v1/admin/system/role`，租户自行创建，仅对本租户生效。
- **更新角色信息：** `PUT /api/v1/admin/system/role`。
- **删除角色：** `DELETE /api/v1/admin/system/role`。

**请求示例（创建角色）：**

```json
{
  "name": "业务管理员",
  "status": 1,
  "desc": "负责日常业务配置"
}
```

**响应示例（创建角色）：**

```json
{
  "code": 200,
  "status": "OK",
  "message": "请求成功",
  "data": {
    "id": 2,
    "tenant_id": 1,
    "name": "业务管理员",
    "desc": "负责日常业务配置",
    "status": 1
  },
  "timestamp": 1641002400
}
```

> 提示：用户管理中的角色选择列表仅包含本租户创建的角色。

### 7. 租户管理 **(超级管理员权限)**

> 注意：以下接口需要超级管理员权限

#### 7.1 获取租户列表

**接口描述：** 分页查询租户列表

**请求方式：** `GET`

**请求路径：** `/api/v1/admin/system/tenant`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

- `code` - 租户编码（可选）
- `name` - 租户名称（可选）
- `status` - 状态（可选）
- `page` - 页码
- `pageSize` - 每页数量

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "id": 1,
      "code": "platform",
      "name": "平台管理",
      "contact": "",
      "phone": "",
      "email": "",
      "status": 1,
      "created_at": 1640995200,
      "updated_at": 1640995200
    }
  ],
  "total": 1,
  "timestamp": 1640995200
}
```

#### 7.2 新增租户

**接口描述：** 创建新租户

**请求方式：** `POST`

**请求路径：** `/api/v1/admin/system/tenant`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

```json
{
  "code": "tenant_code",
  "name": "租户名称",
  "contact": "联系人",
  "phone": "联系电话",
  "email": "邮箱",
  "status": 1
}
```

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "message": "请求成功",
  "data": null,
  "timestamp": 1640995200
}
```

#### 7.3 更新租户

**接口描述：** 更新租户信息

**请求方式：** `PUT`

**请求路径：** `/api/v1/admin/system/tenant`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

```json
{
  "id": 1,
  "code": "tenant_code",
  "name": "租户名称更新",
  "contact": "联系人",
  "phone": "联系电话",
  "email": "邮箱",
  "status": 2
}
```

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "message": "请求成功",
  "data": null,
  "timestamp": 1641002400
}
```

#### 7.4 删除租户

**接口描述：** 删除租户

**请求方式：** `DELETE`

**请求路径：** `/api/v1/admin/system/tenant`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

```json
{
  "id": 1
}
```

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "message": "请求成功",
  "data": null,
  "timestamp": 1641002400
}
```

### 8. 登录日志

#### 8.1 获取登录日志列表

**接口描述：** 查询用户登录日志

**请求方式：** `GET`

**请求路径：** `/api/v1/admin/system/login/log`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

- `ip` - IP地址（可选）
- `username` - 用户名（可选）
- `page` - 页码
- `pageSize` - 每页数量

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "id": 1,
      "tenant_code": "platform",
      "user_name": "admin",
      "ip": "192.168.1.100",
      "login_status": "success",
      "created_at": 1640995200
    }
  ],
  "total": 1,
  "timestamp": 1640995200
}
```

---

## 错误处理

### 常见错误示例

#### 参数验证错误

```json
{
  "code": 400,
  "status": "INVALID_ARGUMENT",
  "message": "请求参数错误",
  "timestamp": 1640995200
}
```

#### 身份验证失败

```json
{
  "code": 401,
  "status": "UNAUTHENTICATED",
  "message": "身份验证失败",
  "timestamp": 1640995200
}
```

#### 权限不足

```json
{
  "code": 403,
  "status": "PERMISSION_DENIED",
  "message": "客户端权限不足",
  "timestamp": 1640995200
}
```

#### 资源不存在

```json
{
  "code": 404,
  "status": "NOT_FOUND",
  "message": "资源不存在",
  "timestamp": 1640995200
}
```

#### 服务器内部错误

```json
{
  "code": 500,
  "status": "DATA_LOSS",
  "message": "处理数据发生错误",
  "timestamp": 1640995200
}
```

---

## 中间件说明

### 1. 跨域处理中间件

- 自动处理 CORS 跨域请求
- 支持预检请求 OPTIONS

### 2. JWT 认证中间件

- 验证 Authorization Header
- 解析 JWT Token（HS256）
- 设置用户上下文信息（`tenant_id`、`user_id`、`account`）
- Token Claims 示例：
  ```json
  {
    "user_id": 1,
    "tenant_id": 1,
    "account": "admin",
    "exp": 1710000000,
    "iss": "server",
    "sub": "token",
    "aud": ["client"],
    "nbf": 1709000000,
    "iat": 1709000000,
    "jti": "<随机ID>"
  }
  ```

### 3. 超级管理员验证中间件

- 验证用户是否具有超级管理员权限
- 用于租户管理等高级功能

### 4. 限流中间件

- 登录接口限流保护（基于IP）
- 防止暴力破解攻击
- 默认值可通过 `config.yaml` 配置：
  - `rate_limit.login_rate_per_minute`（默认 5）
  - `rate_limit.login_burst_size`（默认 10）
  - `rate_limit.general_rate_per_sec`（默认 100）
  - `rate_limit.general_burst_size`（默认 200）

### 5. 分页中间件

- 统一处理分页参数
- 默认页码和页面大小设置

---

## 数据模型

### 用户模型 (SystemUser)

```go
type SystemUser struct {
    gorm.Model
    TenantID     uint   `json:"tenant_id"`
    DepartmentID uint   `json:"department_id"`
    RoleID       uint   `json:"role_id"`
    Name         string `json:"name"`
    Username     string `json:"username"`
    Account      string `json:"account"`
    Password     string `json:"-"`
    Phone        string `json:"phone"`
    Gender       uint   `json:"gender"`
    Status       uint   `json:"status"`
}
```

### 租户模型 (SystemTenant)

```go
type SystemTenant struct {
    gorm.Model
    Code      string     `json:"code"`
    Name      string     `json:"name"`
    Contact   string     `json:"contact"`
    Phone     string     `json:"phone"`
    Email     string     `json:"email"`
    Status    uint       `json:"status"`
}
```

### 角色模型 (SystemRole)

```go
type SystemRole struct {
    gorm.Model
    TenantID uint   `json:"tenant_id"`
    Name     string `json:"name"`
    Desc     string `json:"desc"`
    Status   uint   `json:"status"`
}
```

### 菜单模型 (SystemMenu)

```go
type SystemMenu struct {
    gorm.Model
    Path          string `json:"path"`
    Name          string `json:"name"`
    Component     string `json:"component"`
    Title         string `json:"title"`
    Icon          string `json:"icon"`
    ShowBadge     uint   `json:"show_badge"`
    ShowTextBadge string `json:"show_text_badge"`
    IsHide        uint   `json:"is_hide"`
    IsHideTab     uint   `json:"is_hide_tab"`
    Link          string `json:"link"`
    IsIframe      uint   `json:"is_iframe"`
    KeepAlive     uint   `json:"keep_alive"`
    IsFirstLevel  uint   `json:"is_in_main_container"`
    Status        uint   `json:"status"`
    Level         uint   `json:"level"`
    ParentID      uint   `json:"parent_id"`
    Sort          uint   `json:"sort"`
}
```

---

## 部署说明

### 环境要求

- Go 1.24.1+
- PostgreSQL 12+
- Redis 6+

### 配置文件

配置文件位置：`./config.yaml`

**主要配置项：**

- `server.port` - 服务端口（默认 8080）
- `jwt.key` - JWT 密钥（必须修改）
- `jwt.expiration` - Token 过期时间（如 `12h`）
- `redis.host` - Redis 地址
- `redis.password` - Redis 密码（生产必须设置）
- `postgres.*` - PostgreSQL 连接参数（host/user/password/dbname/port/sslmode/timezone）
- `admin.password` - 默认管理员密码（必须修改）
- `admin.salt` - 密码盐（必须修改）
- `rate_limit.login_rate_per_minute` - 登录每分钟限流
- `rate_limit.login_burst_size` - 登录突发请求数
- `rate_limit.general_rate_per_sec` - 通用接口每秒限流
- `rate_limit.general_burst_size` - 通用接口突发请求数

### 启动命令

```bash
# 开发环境
go run main.go --dev

# 数据库迁移
go run main.go --migrate

# 生产环境构建
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server

# 生产环境启动
nohup ./server &
```

### Docker 部署

```bash
# 启动配套服务（PostgreSQL + Redis）
docker-compose -f docker/docker-compose.yml up -d
```

---

## 安全注意事项

1. **生产环境必须修改默认密码和密钥**
2. **启用 HTTPS 传输加密**
3. **配置防火墙和访问控制**
4. **定期更新依赖包**
5. **启用日志审计**
6. **配置 Redis 密码认证**
7. **使用强密码策略**

---

## 更新日志

### 当前版本特性

- ✅ 多租户架构支持
- ✅ JWT 身份认证
- ✅ RBAC 模型（菜单/按钮权限）
- ✅ 用户、角色、部门管理
- ✅ 菜单权限管理
- ✅ 登录日志记录
- ✅ Redis 缓存支持
- ✅ 请求限流保护
- ✅ 统一错误处理
- ✅ API 响应格式统一

### 待开发功能

- ⏳ API 层权限管制完善
- ⏳ 单元测试覆盖
- ⏳ 持续的代码优化
- ⏳ 更多业务功能扩展

---

_文档最后更新时间：2025年_
