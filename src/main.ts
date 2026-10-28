import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { i18n } from './i18n'
import { usePrefsStore } from './stores/prefs'
import { useWorkspaceStore } from './stores/workspace'
import { vSplit } from './directives/split'
import './styles/variables.css'
import './styles/global.css'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.use(i18n)
app.use(router)
app.directive('split', vSplit)

setActivePinia(pinia)
// 先定主题与语言，再挂载，避免首屏语言/配色闪烁
usePrefsStore().init()
useWorkspaceStore().load()

router.isReady().then(() => app.mount('#app'))
