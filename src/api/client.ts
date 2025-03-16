import axios from 'axios'

const API_URL = 'http://127.0.0.1:8080/api/v1/admin' // Replace with your actual API URL

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 发送 GET 请求的示例函数
export const getMethod = async (endpoint: string, params?: any): Promise<any> => {
  try {
    const response = await apiClient.get(endpoint, { params })
    return response.data
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

// 发送 POST 请求的示例函数
export const postMethod = async (endpoint: string, data: any, params?: any): Promise<any> => {
  try {
    const response = await apiClient.post(endpoint, data, { params })
    return response.data
  } catch (error) {
    console.error('Error posting data:', error)
    throw error
  }
}

// 发送 DELETE 请求的示例函数
export const deleteMethod = async (endpoint: string, params?: any): Promise<any> => {
  try {
    const response = await apiClient.delete(endpoint, { params })
    return response.data
  } catch (error) {
    console.error('Error deleting data:', error)
    throw error
  }
}

// 发送 PATCH 请求的示例函数
export const patchMethod = async (endpoint: string, data: any, params?: any): Promise<any> => {
  try {
    const response = await apiClient.patch(endpoint, data, { params })
    return response.data
  } catch (error) {
    console.error('Error patching data:', error)
    throw error
  }
}
