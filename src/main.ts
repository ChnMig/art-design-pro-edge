import App from './App.vue'
import { createApp } from 'vue'
import { initStore } from './store'                 // Store
import { initRouter } from './router'               // Router
import '@styles/reset.scss'                         // 重置HTML样式
import '@styles/app.scss'                           // 全局样式
import '@styles/el-ui.scss'                         // 优化element样式
import '@styles/mobile.scss'                        // 移动端样式优化
import '@styles/change.scss'                        // 主题切换过渡优化
import '@styles/theme-animation.scss'               // 主题切换动画
import '@styles/el-light.scss'                      // Element 自定义主题（亮色）
import '@styles/el-dark.scss'                       // Element 自定义主题（暗色）
import '@styles/dark.scss'                          // 系统主题
import '@icons/system/iconfont.js'                  // 系统彩色图标
import '@icons/system/iconfont.css'                 // 系统图标
import '@utils/sys/console.ts'                      // 控制台输出内容
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { setupGlobDirectives } from './directives'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import ElementPlus from 'element-plus'

document.addEventListener(
  'touchstart',
  function () {},
  { passive: false }
)

const app = createApp(App)
app.use(ElementPlus, {
  locale: zhCn,
})
initStore(app)
initRouter(app)
setupGlobDirectives(app)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.mount('#app')
