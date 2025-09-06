# API成功消息配置指南

本项目提供了完整的API成功消息配置系统，可以为API请求自动显示操作成功的提示消息。

## 功能特性

- 🎯 **智能识别** - 根据HTTP方法和URL路径自动识别操作类型
- 🔧 **灵活配置** - 支持手动配置成功消息内容和显示方式
- 📝 **预设消息** - 内置常用操作的默认成功消息
- 🎨 **批量操作** - 支持批量操作的成功消息配置
- ⚡ **高性能** - 轻量级实现，不影响请求性能

## 使用方法

### 1. 基础用法

```typescript
import api from '@/utils/http'
import { withSuccessMessage } from '@/utils/http/success'

// 显示默认成功消息
const config = withSuccessMessage({ url: '/api/users', method: 'post' })
api.post(config)

// 显示自定义成功消息
const config = withSuccessMessage(
  { url: '/api/users', method: 'post' }, 
  '用户创建成功'
)
api.post(config)

// 布尔值控制是否显示
const config = withSuccessMessage(
  { url: '/api/users', method: 'post' }, 
  true // 显示默认消息
)
api.post(config)
```

### 2. 预设操作消息

```typescript
import { 
  withCreateSuccess,
  withUpdateSuccess,
  withDeleteSuccess,
  withSaveSuccess 
} from '@/utils/http/success'

// 创建操作 - 显示"创建成功"
const createConfig = withCreateSuccess({ url: '/api/users', method: 'post' })

// 更新操作 - 显示"更新成功"  
const updateConfig = withUpdateSuccess({ url: '/api/users/1', method: 'put' })

// 删除操作 - 显示"删除成功"
const deleteConfig = withDeleteSuccess({ url: '/api/users/1', method: 'delete' })

// 保存操作 - 显示"保存成功"
const saveConfig = withSaveSuccess({ url: '/api/settings', method: 'post' })
```

### 3. 自动检测操作类型

```typescript
import { withAutoSuccess } from '@/utils/http/success'

// 根据方法和URL自动检测操作类型
const config1 = withAutoSuccess({ url: '/api/users', method: 'post' })        // "创建成功"
const config2 = withAutoSuccess({ url: '/api/users/1', method: 'put' })       // "更新成功"
const config3 = withAutoSuccess({ url: '/api/users/1', method: 'delete' })    // "删除成功"
const config4 = withAutoSuccess({ url: '/api/files/upload', method: 'post' }) // "上传成功"
```

### 4. 批量操作

```typescript
import { withBatchSuccess } from '@/utils/http/success'

// 批量删除
const batchConfig = withBatchSuccess(
  { url: '/api/users/batch', method: 'delete' },
  'delete',
  5, // 操作数量
  '批量删除5个用户成功' // 自定义消息(可选)
)
```

### 5. 状态切换操作

```typescript
import { withStatusChangeSuccess } from '@/utils/http/success'

// 启用用户
const enableConfig = withStatusChangeSuccess(
  { url: '/api/users/1/enable', method: 'put' },
  'enable'
)

// 禁用用户  
const disableConfig = withStatusChangeSuccess(
  { url: '/api/users/1/disable', method: 'put' },
  'disable'
)
```

### 6. 在HTTP客户端中使用

```typescript
// 直接在请求配置中添加
api.post({
  url: '/api/users',
  data: userData,
  showSuccessMessage: true,
  successMessage: '用户创建成功'
})

// 或使用扩展配置接口
interface ExtendedConfig extends AxiosRequestConfig {
  showSuccessMessage?: boolean
  successMessage?: string
}

const config: ExtendedConfig = {
  url: '/api/users',
  method: 'post',
  showSuccessMessage: true,
  successMessage: '操作完成'
}
```

### 7. 在API客户端中使用

```typescript
import { ApiClient, RestfulClient } from '@/utils/api/client'

// 创建API客户端
const apiClient = new ApiClient({
  baseUrl: '/api',
  defaults: {
    showSuccessMessage: true // 默认显示成功消息
  }
})

// RESTful客户端自动配置成功消息
const userClient = new RestfulClient('users', {
  baseUrl: '/api',
  defaults: {
    showSuccessMessage: true
  }
})

// 使用时会自动显示相应的成功消息
await userClient.create(userData)     // "创建成功"
await userClient.update(1, userData)  // "更新成功" 
await userClient.remove(1)           // "删除成功"
```

## 内置操作消息

| 操作类型 | 默认消息 | 触发条件 |
|---------|---------|----------|
| create | 创建成功 | POST方法 |
| update | 更新成功 | PUT/PATCH方法 |
| delete | 删除成功 | DELETE方法 |
| save | 保存成功 | 包含save的URL |
| upload | 上传成功 | 包含upload的URL |
| download | 下载成功 | 包含download的URL |
| enable | 启用成功 | 包含enable的URL |
| disable | 禁用成功 | 包含disable的URL |
| import | 导入成功 | 包含import的URL |
| export | 导出成功 | 包含export的URL |

## 高级配置

### 成功消息配置接口

```typescript
interface SuccessMessageConfig {
  /** 是否显示成功消息 */
  show: boolean
  /** 成功消息文本 */  
  message?: string
  /** 消息显示时长（毫秒） */
  duration?: number
  /** 是否可关闭 */
  closable?: boolean
}
```

### 预设配置常量

```typescript
import { SuccessConfigs } from '@/utils/http/success'

// 使用预设配置
const config = {
  ...requestConfig,
  ...SuccessConfigs.CREATE  // { show: true, message: '创建成功' }
}
```

### 禁用成功消息

```typescript
import { withoutSuccessMessage } from '@/utils/http/success'

// 禁用成功消息显示
const config = withoutSuccessMessage(requestConfig)
```

## 最佳实践

1. **查询操作不显示成功消息** - GET请求默认不显示成功消息
2. **关键操作显示成功消息** - 创建、更新、删除等操作建议显示成功反馈
3. **批量操作包含数量信息** - 批量操作的成功消息建议包含操作数量
4. **自定义业务消息** - 对于特殊业务场景，使用自定义成功消息
5. **状态切换明确反馈** - 启用/禁用等状态切换操作提供明确反馈

## 示例场景

```typescript
// 用户管理
await api.post(withCreateSuccess(
  { url: '/api/users', data: userForm }, 
  '用户添加成功'
))

// 批量删除
await api.delete(withBatchSuccess(
  { url: '/api/users/batch', data: { ids: [1,2,3] } },
  'delete',
  3
))

// 文件上传
await api.post(withUploadSuccess(
  { url: '/api/files/upload', data: formData },
  '文件上传完成'
))

// 状态切换
await api.put(withStatusChangeSuccess(
  { url: '/api/users/1/status', data: { status: 'active' } },
  'enable',
  '用户已激活'
))
```

通过这套成功消息系统，可以为用户提供更好的操作反馈体验，提升应用的易用性。