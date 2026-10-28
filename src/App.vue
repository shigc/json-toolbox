<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import MenuBar from '@/components/layout/MenuBar.vue'
import TabBar from '@/components/layout/TabBar.vue'
import StatusBar from '@/components/layout/StatusBar.vue'
import ToastHost from '@/components/common/ToastHost.vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { usePrefsStore } from '@/stores/prefs'
import { HOME_TOOL_ID, isToolId } from '@/tools/registry'
import { useShortcuts } from '@/composables/useShortcuts'

const { t } = useI18n()
const ws = useWorkspaceStore()
const prefs = usePrefsStore()
const route = useRoute()
const router = useRouter()

useShortcuts()

// 路由 → 标签：支持深链与浏览器前进/后退
// 路由用的是静态路径 /tool/<id>（见 router/index.ts），因此这里读 route.name
watch(
  () => route.name,
  (name) => {
    const id = typeof name === 'string' ? name : null
    if (id && isToolId(id)) {
      if (ws.activeTab?.toolId !== id) ws.openTool(id)
    } else if (!ws.tabs.length) {
      ws.openTool(HOME_TOOL_ID)
    }
  },
  { immediate: true },
)

// 标签 → 路由
watch(
  () => ws.activeTab?.toolId,
  (id) => {
    if (id && route.name !== id) router.replace(`/tool/${id}`)
  },
)
</script>

<template>
  <div class="app">
    <MenuBar />
    <TabBar />

    <main class="app-main">
      <router-view v-slot="{ Component }">
        <component :is="Component" v-if="ws.activeTab" :key="ws.activeTab.id" />
      </router-view>
      <div v-if="!ws.activeTab" class="empty">
        <p>{{ t('app.noTabs') }}</p>
        <button class="app-btn primary" @click="ws.openTool(HOME_TOOL_ID)">
          {{ t('app.openHome') }}
        </button>
      </div>
    </main>

    <StatusBar v-if="prefs.showStatusBar" />
    <ToastHost />
  </div>
</template>

<style scoped>
.app {
  height: 100%;
  display: grid;
  grid-template-rows: var(--menubar-h) var(--tabbar-h) 1fr auto;
  /* 必须显式约束列宽：只写 grid-template-rows 时那一列是 auto，
     宽度会被内容撑开（实测手机端菜单栏把它顶到 321px 导致整页横向溢出）。
     minmax(0, 1fr) 让子项可以正常收缩。 */
  grid-template-columns: minmax(0, 1fr);
  background: var(--bg-app);
}
.app-main {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: var(--bg-tab-active);
}

/* ---------- 手机：让出刘海/圆角与底部指示条的安全区 ---------- */
@media (max-width: 720px) {
  .app {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}
</style>
