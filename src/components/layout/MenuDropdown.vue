<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppIcon from '../common/AppIcon.vue'
import type { MenuItem } from './menu'

const props = defineProps<{ items: MenuItem[]; x: number; y: number }>()
const emit = defineEmits<{ close: [] }>()

const root = ref<HTMLElement | null>(null)
const pos = ref({ x: props.x, y: props.y })
const openSub = ref(-1)
const subPos = ref({ x: 0, y: 0 })

onMounted(() => {
  const node = root.value
  if (!node) return
  // 贴边时向内收，避免弹出层超出视口
  const r = node.getBoundingClientRect()
  pos.value = {
    x: Math.max(4, Math.min(props.x, window.innerWidth - r.width - 6)),
    y: Math.max(4, Math.min(props.y, window.innerHeight - r.height - 6)),
  }
})

function enter(item: MenuItem, index: number, ev: MouseEvent) {
  if (item.kind || item.disabled) {
    openSub.value = -1
    return
  }
  if (item.children?.length) {
    const r = (ev.currentTarget as HTMLElement).getBoundingClientRect()
    subPos.value = { x: r.right - 6, y: r.top - 5 }
    openSub.value = index
  } else {
    openSub.value = -1
  }
}

function run(item: MenuItem) {
  if (item.kind || item.disabled || item.children?.length) return
  item.action?.()
  emit('close')
}
</script>

<template>
  <div
    ref="root"
    class="popup menu-popup"
    :style="{ left: `${pos.x}px`, top: `${pos.y}px` }"
    @contextmenu.prevent
  >
    <template v-for="(item, i) in items" :key="i">
      <div v-if="item.kind === 'separator'" class="menu-sep" />
      <div v-else-if="item.kind === 'header'" class="menu-header">{{ item.label }}</div>
      <button
        v-else
        class="menu-item"
        :class="{ disabled: item.disabled, sub: !!item.children?.length }"
        :disabled="item.disabled"
        @mouseenter="enter(item, i, $event)"
        @click="run(item)"
      >
        <span class="check">
          <AppIcon v-if="item.checked" name="check" :size="13" />
        </span>
        <span class="label">{{ item.label }}</span>
        <span v-if="item.shortcut" class="shortcut">{{ item.shortcut }}</span>
        <AppIcon v-if="item.children?.length" name="chevronRight" :size="13" class="chev" />
      </button>
    </template>

    <MenuDropdown
      v-if="openSub >= 0 && items[openSub]?.children"
      :items="items[openSub].children!"
      :x="subPos.x"
      :y="subPos.y"
      @close="emit('close')"
    />
  </div>
</template>

<style scoped>
.menu-popup {
  min-width: 220px;
}
.menu-header {
  padding: 5px 10px 3px;
  font-size: 11px;
  color: var(--fg-faint);
  user-select: none;
}
.menu-sep {
  height: 1px;
  margin: 4px 6px;
  background: var(--border);
}
.menu-item {
  display: grid;
  grid-template-columns: 16px 1fr auto 14px;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 5px 8px;
  border: 0;
  border-radius: 3px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
}
.menu-item:hover:not(.disabled) {
  background: var(--accent);
  color: var(--fg-on-accent);
}
.menu-item:hover:not(.disabled) .shortcut,
.menu-item:hover:not(.disabled) .chev {
  color: var(--fg-on-accent);
}
.menu-item.disabled {
  opacity: 0.4;
  cursor: default;
}
.check {
  display: flex;
  justify-content: center;
  color: inherit;
}
.label {
  overflow: hidden;
  text-overflow: ellipsis;
}
.shortcut {
  font-size: 11px;
  color: var(--fg-faint);
  font-family: var(--font-mono);
}
.chev {
  color: var(--fg-faint);
}

/* ---------- 手机 ---------- */
/* 220px 的弹层在 320px 屏上会让子菜单没地方展开（子菜单从父项右侧弹出），
   收窄后父菜单 + 子菜单能并排放下。同时加大条目高度便于点按。 */
@media (max-width: 720px) {
  .menu-popup {
    min-width: 150px;
    max-width: 62vw;
  }
  .menu-item {
    padding: 9px 8px;
  }
  .menu-header {
    padding: 7px 10px 4px;
  }
}
</style>
