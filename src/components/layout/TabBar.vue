<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '../common/AppIcon.vue'
import MenuDropdown from './MenuDropdown.vue'
import type { MenuItem } from './menu'
import { useWorkspaceStore } from '@/stores/workspace'
import { getTool, toolTitle } from '@/tools/registry'
import { toolMenuItems } from '@/composables/useAppMenu'
import { useDismissable } from '@/composables/useDismissable'

const { t } = useI18n()
const ws = useWorkspaceStore()

const plusOpen = ref(false)
const plusPos = ref({ x: 0, y: 0 })
const ctxOpen = ref(false)
const ctxPos = ref({ x: 0, y: 0 })
const ctxTabId = ref<string | null>(null)
const dragIndex = ref(-1)

const toolItems = computed<MenuItem[]>(() => toolMenuItems())

/** 点弹层外部或按 Esc 关闭；标签栏自身的点击留给下面的开/关切换处理 */
useDismissable(
  () => plusOpen.value || ctxOpen.value,
  () => {
    plusOpen.value = false
    ctxOpen.value = false
  },
  ['.tabbar'],
)

function openPlus(ev: MouseEvent) {
  if (plusOpen.value) {
    plusOpen.value = false
    return
  }
  const r = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  plusPos.value = { x: Math.max(6, r.right - 240), y: r.bottom + 2 }
  plusOpen.value = true
}

function openContext(ev: MouseEvent, id: string) {
  ev.preventDefault()
  // 右键已打开的那个标签时收起菜单，避免只能靠点别处关闭
  if (ctxOpen.value && ctxTabId.value === id) {
    ctxOpen.value = false
    return
  }
  ctxTabId.value = id
  ctxPos.value = { x: ev.clientX, y: ev.clientY }
  ctxOpen.value = true
}

const ctxItems = computed<MenuItem[]>(() => {
  const id = ctxTabId.value
  if (!id) return []
  const index = ws.tabs.findIndex((tab) => tab.id === id)
  return [
    { label: t('menu.close'), shortcut: 'Ctrl+Alt+W', action: () => ws.closeTab(id) },
    {
      label: t('menu.closeOthers'),
      disabled: ws.tabs.length < 2,
      action: () => ws.closeOthers(id),
    },
    {
      label: t('menu.closeRight'),
      disabled: index === ws.tabs.length - 1,
      action: () => ws.closeToRight(id),
    },
    { kind: 'separator' },
    { label: t('menu.closeAll'), action: () => ws.closeAll() },
  ]
})

function onDragStart(index: number, ev: DragEvent) {
  dragIndex.value = index
  ev.dataTransfer?.setData('text/plain', String(index))
}

function onDrop(index: number) {
  if (dragIndex.value >= 0 && dragIndex.value !== index) ws.moveTab(dragIndex.value, index)
  dragIndex.value = -1
}

function iconOf(toolId: string): string {
  return getTool(toolId)?.icon ?? 'info'
}
</script>

<template>
  <div class="tabbar no-select">
    <div class="tabs">
      <div
        v-for="(tab, i) in ws.tabs"
        :key="tab.id"
        class="tab"
        :class="{ active: tab.id === ws.activeId }"
        draggable="true"
        :title="toolTitle(tab.toolId)"
        @click="ws.activate(tab.id)"
        @auxclick.middle.prevent="ws.closeTab(tab.id)"
        @contextmenu="openContext($event, tab.id)"
        @dragstart="onDragStart(i, $event)"
        @dragover.prevent
        @drop="onDrop(i)"
      >
        <AppIcon :name="iconOf(tab.toolId)" :size="13" class="tab-icon" />
        <span class="tab-title">{{ toolTitle(tab.toolId) }}</span>
        <button class="tab-close" :title="t('menu.closeTabTip')" @click.stop="ws.closeTab(tab.id)">
          <AppIcon name="close" :size="12" />
        </button>
      </div>

      <button class="tab-add" :title="t('menu.newTabTip')" @click="openPlus">
        <AppIcon name="plus" :size="14" />
      </button>
    </div>

    <MenuDropdown
      v-if="plusOpen"
      :items="toolItems"
      :x="plusPos.x"
      :y="plusPos.y"
      @close="plusOpen = false"
    />
    <MenuDropdown
      v-if="ctxOpen"
      :items="ctxItems"
      :x="ctxPos.x"
      :y="ctxPos.y"
      @close="ctxOpen = false"
    />
  </div>
</template>

<style scoped>
.tabbar {
  display: flex;
  align-items: stretch;
  height: var(--tabbar-h);
  background: var(--bg-tabbar);
  border-bottom: 1px solid var(--border);
  user-select: none;
}
.tabs {
  display: flex;
  align-items: stretch;
  gap: 1px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 3px 6px 0;
  scrollbar-width: none;
}
.tabs::-webkit-scrollbar {
  height: 0;
}
.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 200px;
  min-width: 110px;
  padding: 0 6px 0 10px;
  border: 1px solid transparent;
  border-bottom: 0;
  border-radius: 5px 5px 0 0;
  background: transparent;
  color: var(--fg-muted);
  cursor: pointer;
  position: relative;
}
.tab:hover {
  background: var(--bg-hover);
}
/* 活动标签与工作区同底色，制造「连接」感 */
.tab.active {
  background: var(--bg-tab-active);
  border-color: var(--border);
  color: var(--fg);
}
.tab.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: var(--bg-tab-active);
}
.tab-icon {
  flex: none;
  opacity: 0.85;
}
.tab-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}
.tab-close {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0;
}
.tab:hover .tab-close,
.tab.active .tab-close {
  opacity: 0.7;
}
.tab-close:hover {
  background: var(--bg-active);
  opacity: 1;
}
.tab-add {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  margin: 3px 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--fg-muted);
  cursor: pointer;
}
.tab-add:hover {
  background: var(--bg-hover);
  color: var(--fg);
}

/* 触屏设备（含宽屏平板）：关闭按钮常显 */
@media (hover: none) {
  .tab .tab-close {
    opacity: 0.6;
  }
}

/* ---------- 手机 ---------- */
@media (max-width: 720px) {
  .tab {
    min-width: 96px;
    max-width: 150px;
    padding: 0 4px 0 9px;
  }
  /* 触屏没有 hover，关闭按钮必须常显，否则只有活动标签能关 */
  .tab .tab-close {
    opacity: 0.6;
    width: 22px;
    height: 22px;
  }
  .tab-add {
    width: 32px;
  }
}
</style>
