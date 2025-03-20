// import request from '@/utils/http'
// import { BaseResult } from '@/types/axios'
import { SystemInfo } from '@/config/setting'
import { BaseResult } from '@/types/axios'

export class UserService {
  // 模拟登录接口
  static login(options: { body: string }): Promise<BaseResult> {
    return new Promise((resolve) => {
      const { username, password } = JSON.parse(options.body)

      if (username === SystemInfo.login.username && password === SystemInfo.login.password) {
        resolve({
          code: 200,
          message: '登录成功',
          data: {
            accessToken:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkpvaG4gU25vdyIsImlhdCI6MTcwNjg2NTYwMCwiZXhwIjoxNzA2OTUyMDAwfQ.8f9D4kJ2m3XlH5Q0y6Z1r2Y3n4X5pL6q8K9v2W3n4X5'
          }
        })
      } else {
        resolve({
          code: 401,
          message: '用户名或密码错误',
          data: null
        })
      }
    })
  }
}
