import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { TOOLS, HOME_TOOL_ID } from '@/tools/registry'

/**
 * hash 模式：file:// 下 pushState 会抛异常，hash 让「静态托管」与「双击 index.html」
 * 两种场景都能直接跑，且不需要服务端 SPA fallback 配置。
 */
const routes: RouteRecordRaw[] = [
  ...TOOLS.map((t) => ({
    path: `/tool/${t.id}`,
    name: t.id,
    component: t.component,
  })),
  { path: '/', redirect: `/tool/${HOME_TOOL_ID}` },
  { path: '/:pathMatch(.*)*', redirect: `/tool/${HOME_TOOL_ID}` },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
