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

- `code` - HTTP状态码
- `status` - 状态标识
- `message` - 响应消息
- `data` - 响应数据
- `timestamp` - 响应时间戳
- `total` - 数据总数（分页接口）

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
| 504    | DEADLINE_EXCEED     | 请求超时                     |

### 认证机制

除登录和验证码接口外，所有接口都需要在 Header 中携带 JWT Token：

```
Authorization: Bearer {your_jwt_token}
```

### 分页参数

支持分页的接口通用参数：

- `page` - 页码，从1开始，默认1
- `page_size` - 每页数量，默认10

### 多租户支持

系统支持多租户架构，需要在登录时提供 `tenant_code` 租户编码。

---

## 系统管理接口

### 1. 用户认证

#### 1.1 获取登录验证码

**接口描述：** 获取图片验证码

**请求方式：** `GET`

**请求路径：** `/api/v1/admin/system/user/login/captcha`

**请求参数：** 无

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "message": "请求成功",
  "data": {
    "captcha_id": "Nz0z0L7c5t9GxOXLiVWV",
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
  "tenant_code": "default",
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
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires": 1640995200
  },
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
    "username": "admin",
    "name": "管理员",
    "email": "admin@example.com",
    "phone": "13800138000",
    "avatar": "/static/avatar/default.png",
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
  "name": "新用户名",
  "email": "newemail@example.com",
  "phone": "13900139000",
  "avatar": "/static/avatar/new.png"
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
- `status` - 状态（可选）
- `page` - 页码
- `page_size` - 每页数量

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "id": 1,
      "username": "admin",
      "name": "管理员",
      "email": "admin@example.com",
      "status": 1,
      "created_at": 1640995200
    }
  ],
  "total": 1,
  "timestamp": 1640995200
}
```

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
- `page_size` - 每页数量

#### 2.5 新增用户

**接口描述：** 创建新用户

**请求方式：** `POST`

**请求路径：** `/api/v1/admin/system/user`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

```json
{
  "username": "newuser",
  "name": "新用户",
  "password": "123456",
  "email": "newuser@example.com",
  "phone": "13800138001",
  "role_id": 2,
  "department_id": 1,
  "status": 1
}
```

#### 2.6 更新用户

**接口描述：** 更新用户信息

**请求方式：** `PUT`

**请求路径：** `/api/v1/admin/system/user`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

```json
{
  "id": 1,
  "name": "更新后用户名",
  "email": "updated@example.com",
  "status": 1
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

### 3. 菜单管理

#### 3.1 获取用户菜单列表

**接口描述：** 获取当前用户的菜单权限

**请求方式：** `GET`

**请求路径：** `/api/v1/admin/system/user/menu`

**请求头：** `Authorization: Bearer {token}`

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "id": 1,
      "name": "系统管理",
      "path": "/system",
      "icon": "setting",
      "sort": 1,
      "children": [
        {
          "id": 2,
          "name": "用户管理",
          "path": "/system/user",
          "icon": "user",
          "sort": 1
        }
      ]
    }
  ],
  "timestamp": 1640995200
}
```

#### 3.2 获取菜单列表

**接口描述：** 获取所有菜单列表（管理员）

**请求方式：** `GET`

**请求路径：** `/api/v1/admin/system/menu`

**请求头：** `Authorization: Bearer {token}`

#### 3.3 新增菜单

**接口描述：** 创建新菜单

**请求方式：** `POST`

**请求路径：** `/api/v1/admin/system/menu`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

```json
{
  "parent_id": 0,
  "name": "菜单名称",
  "path": "/menu/path",
  "icon": "menu-icon",
  "type": 1,
  "sort": 1,
  "status": 1
}
```

#### 3.4 更新菜单

**接口描述：** 更新菜单信息

**请求方式：** `PUT`

**请求路径：** `/api/v1/admin/system/menu`

**请求头：** `Authorization: Bearer {token}`

#### 3.5 删除菜单

**接口描述：** 删除菜单

**请求方式：** `DELETE`

**请求路径：** `/api/v1/admin/system/menu`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

```json
{
  "id": 1
}
```

### 4. 菜单权限管理

#### 4.1 获取菜单权限列表

**接口描述：** 获取菜单权限配置

**请求方式：** `GET`

**请求路径：** `/api/v1/admin/system/menu/auth`

**请求头：** `Authorization: Bearer {token}`

#### 4.2 新增菜单权限

**接口描述：** 添加菜单权限

**请求方式：** `POST`

**请求路径：** `/api/v1/admin/system/menu/auth`

**请求头：** `Authorization: Bearer {token}`

#### 4.3 更新菜单权限

**接口描述：** 更新菜单权限

**请求方式：** `PUT`

**请求路径：** `/api/v1/admin/system/menu/auth`

**请求头：** `Authorization: Bearer {token}`

#### 4.4 删除菜单权限

**接口描述：** 删除菜单权限

**请求方式：** `DELETE`

**请求路径：** `/api/v1/admin/system/menu/auth`

**请求头：** `Authorization: Bearer {token}`

#### 4.5 根据角色获取菜单

**接口描述：** 获取指定角色的菜单权限

**请求方式：** `GET`

**请求路径：** `/api/v1/admin/system/menu/role`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

- `role_id` - 角色ID

#### 4.6 更新角色菜单权限

**接口描述：** 批量更新角色的菜单权限

**请求方式：** `PUT`

**请求路径：** `/api/v1/admin/system/menu/role`

**请求头：** `Authorization: Bearer {token}`

### 5. 部门管理

#### 5.1 获取部门列表

**接口描述：** 获取部门列表

**请求方式：** `GET`

**请求路径：** `/api/v1/admin/system/department`

**请求头：** `Authorization: Bearer {token}`

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "id": 1,
      "parent_id": 0,
      "name": "技术部",
      "code": "tech",
      "leader": "张三",
      "phone": "13800138000",
      "email": "tech@example.com",
      "status": 1,
      "sort": 1,
      "children": []
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
  "parent_id": 0,
  "name": "部门名称",
  "code": "dept_code",
  "leader": "部门负责人",
  "phone": "联系电话",
  "email": "dept@example.com",
  "status": 1,
  "sort": 1
}
```

#### 5.3 更新部门

**接口描述：** 更新部门信息

**请求方式：** `PUT`

**请求路径：** `/api/v1/admin/system/department`

**请求头：** `Authorization: Bearer {token}`

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

### 6. 角色管理

#### 6.1 获取角色列表

**接口描述：** 分页查询角色列表

**请求方式：** `GET`

**请求路径：** `/api/v1/admin/system/role`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

- `name` - 角色名称（可选）
- `status` - 状态（可选）
- `page` - 页码
- `page_size` - 每页数量

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "id": 1,
      "name": "超级管理员",
      "code": "super_admin",
      "description": "系统超级管理员",
      "status": 1,
      "created_at": 1640995200
    }
  ],
  "total": 1,
  "timestamp": 1640995200
}
```

#### 6.2 新增角色

**接口描述：** 创建新角色

**请求方式：** `POST`

**请求路径：** `/api/v1/admin/system/role`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

```json
{
  "name": "角色名称",
  "code": "role_code",
  "description": "角色描述",
  "status": 1
}
```

#### 6.3 更新角色

**接口描述：** 更新角色信息

**请求方式：** `PUT`

**请求路径：** `/api/v1/admin/system/role`

**请求头：** `Authorization: Bearer {token}`

#### 6.4 删除角色

**接口描述：** 删除角色

**请求方式：** `DELETE`

**请求路径：** `/api/v1/admin/system/role`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

```json
{
  "id": 1
}
```

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
- `page_size` - 每页数量

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "id": 1,
      "code": "default",
      "name": "默认租户",
      "description": "系统默认租户",
      "status": 1,
      "created_at": 1640995200,
      "expires_at": 1672531200
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
  "description": "租户描述",
  "status": 1,
  "expires_at": 1672531200
}
```

#### 7.3 更新租户

**接口描述：** 更新租户信息

**请求方式：** `PUT`

**请求路径：** `/api/v1/admin/system/tenant`

**请求头：** `Authorization: Bearer {token}`

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

### 8. 登录日志

#### 8.1 获取登录日志列表

**接口描述：** 查询用户登录日志

**请求方式：** `GET`

**请求路径：** `/api/v1/admin/system/login/log`

**请求头：** `Authorization: Bearer {token}`

**请求参数：**

- `username` - 用户名（可选）
- `status` - 登录状态（可选）
- `start_time` - 开始时间（可选）
- `end_time` - 结束时间（可选）
- `page` - 页码
- `page_size` - 每页数量

**响应示例：**

```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "id": 1,
      "tenant_code": "default",
      "username": "admin",
      "ip": "192.168.1.100",
      "login_status": "success",
      "user_agent": "Mozilla/5.0...",
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
- 解析 JWT Token
- 设置用户上下文信息

### 3. 超级管理员验证中间件

- 验证用户是否具有超级管理员权限
- 用于租户管理等高级功能

### 4. 限流中间件

- 登录接口限流保护
- 防止暴力破解攻击

### 5. 分页中间件

- 统一处理分页参数
- 默认页码和页面大小设置

---

## 数据模型

### 用户模型 (SystemUser)

```go
type SystemUser struct {
    gorm.Model
    TenantID      uint   `json:"tenant_id"`
    Username      string `json:"username"`
    Name          string `json:"name"`
    Password      string `json:"-"`
    Email         string `json:"email"`
    Phone         string `json:"phone"`
    Avatar        string `json:"avatar"`
    Status        uint   `json:"status"`
    RoleID        uint   `json:"role_id"`
    DepartmentID  uint   `json:"department_id"`
}
```

### 租户模型 (SystemTenant)

```go
type SystemTenant struct {
    gorm.Model
    Code        string    `json:"code"`
    Name        string    `json:"name"`
    Description string    `json:"description"`
    Status      uint      `json:"status"`
    ExpiresAt   time.Time `json:"expires_at"`
}
```

### 角色模型 (SystemRole)

```go
type SystemRole struct {
    gorm.Model
    Name        string `json:"name"`
    Code        string `json:"code"`
    Description string `json:"description"`
    Status      uint   `json:"status"`
}
```

### 菜单模型 (SystemMenu)

```go
type SystemMenu struct {
    gorm.Model
    ParentID uint   `json:"parent_id"`
    Name     string `json:"name"`
    Path     string `json:"path"`
    Icon     string `json:"icon"`
    Type     uint   `json:"type"`
    Sort     uint   `json:"sort"`
    Status   uint   `json:"status"`
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

**重要配置项：**

- `JWT_KEY` - JWT密钥（必须修改）
- `ADMIN_PASSWORD` - 默认管理员密码（必须修改）
- `PWD_SALT` - 密码盐值（必须修改）
- `REDIS_PASSWORD` - Redis密码（生产环境必须设置）
- `PGSQL_DSN` - PostgreSQL连接字符串

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
- ✅ RBAC 权限控制
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
