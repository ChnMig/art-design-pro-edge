import { fourDotsSpinnerSvg } from '@/assets/svg/loading'
import { getUserMenu } from './system/api'
import { MenuListType } from '@/types/menu'
import { processRoute } from '@/utils/menu'
import { ElLoading, ElMessage } from 'element-plus'
import { ApiStatus } from '@/utils/http/status'

// 菜单接口
export const menuService = {
  // 获取菜单列表，模拟网络请求
  async getMenuList(
    delay: number = 300
  ): Promise<{ menuList: MenuListType[]; closeLoading: () => void }> {
    const asyncRoutesData = await getUserMenu()
    if (asyncRoutesData.code === ApiStatus.success) {
      console.log('获取用户菜单成功:', asyncRoutesData.data)
    } else {
      ElMessage.error(asyncRoutesData.message)
      console.error('获取用户菜单失败:', asyncRoutesData.message)
      asyncRoutesData.data = []
    }
    // 获取到的菜单数据
    const menuList = asyncRoutesData.data
    // 处理后的菜单数据
    const processedMenuList: MenuListType[] = menuList.map((route: MenuListType) =>
      processRoute(route)
    )
    const loading = ElLoading.service({
      lock: true,
      background: 'rgba(0, 0, 0, 0)',
      svg: fourDotsSpinnerSvg,
      svgViewBox: '0 0 40 40'
    })

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          menuList: processedMenuList,
          closeLoading: () => loading.close()
        })
      }, delay)
    })
  }
}
