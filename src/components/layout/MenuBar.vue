<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MenuDropdown from './MenuDropdown.vue'
import AppIcon from '../common/AppIcon.vue'
import AppModal from '../common/AppModal.vue'
import type { MenuItem } from './menu'
import { SHORTCUT_ROWS, useAppMenu } from '@/composables/useAppMenu'
import { useAppDialog } from '@/composables/useAppDialog'
import { useDismissable } from '@/composables/useDismissable'
import { usePrefsStore } from '@/stores/prefs'
import { LOCALES, localeMeta } from '@/i18n'

const { t } = useI18n()
const { menus } = useAppMenu()
const dialog = useAppDialog()
const prefs = usePrefsStore()

const openIndex = ref(-1)
const pos = ref({ x: 0, y: 0 })

const langOpen = ref(false)
const langPos = ref({ x: 0, y: 0 })

/**
 * 手机端：5 个文字菜单放不下（实测 320px 视口下会溢出到 355px），
 * 收进一个 ☰ 按钮，点开后把各级菜单作为子菜单列出。
 * 桌面端该按钮被 CSS 隐藏，不需要额外的断点判断。
 */
const collapsedOpen = ref(false)
const collapsedPos = ref({ x: 0, y: 0 })

function toggleCollapsed(ev: MouseEvent) {
  if (collapsedOpen.value) {
    collapsedOpen.value = false
    return
  }
  const r = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  collapsedPos.value = { x: r.left, y: r.bottom + 2 }
  collapsedOpen.value = true
}

const collapsedItems = (): MenuItem[] =>
  menus.value.map((menu) => ({ label: menu.label, children: menu.items }))

function open(index: number, ev: MouseEvent) {
  const r = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  pos.value = { x: r.left, y: r.bottom + 2 }
  openIndex.value = index
}

function onMenuClick(index: number, ev: MouseEvent) {
  if (openIndex.value === index) {
    openIndex.value = -1
    return
  }
  open(index, ev)
}

/** 菜单已展开时，鼠标滑过其它菜单直接切换（桌面软件习惯） */
function onMenuHover(index: number, ev: MouseEvent) {
  if (openIndex.value < 0 || openIndex.value === index) return
  open(index, ev)
}

function toggleLang(ev: MouseEvent) {
  if (langOpen.value) {
    langOpen.value = false
    return
  }
  const r = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  langPos.value = { x: r.right - 200, y: r.bottom + 2 }
  langOpen.value = true
}

const langItems = (): MenuItem[] =>
  LOCALES.map((l) => ({
    label: l.label,
    checked: prefs.locale === l.code,
    action: () => prefs.setLocale(l.code),
  }))

function closeMenu() {
  openIndex.value = -1
  langOpen.value = false
  collapsedOpen.value = false
}

/** 点菜单外部或按 Esc 关闭；菜单栏自身的点击留给各按钮的开/关切换处理 */
useDismissable(
  () => openIndex.value >= 0 || langOpen.value || collapsedOpen.value,
  closeMenu,
  ['.menubar'],
)

/** Esc 还要关掉快捷键 / 关于弹窗 */
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') dialog.close()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <header class="menubar no-select">
    <div class="brand">
      <span class="logo mono">{ }</span>
      <span class="name">{{ t('app.name') }}</span>
    </div>

    <button
      class="menu-collapsed app-btn ghost sm icon-btn"
      :class="{ active: collapsedOpen }"
      :title="t('menu.menuTip')"
      @click="toggleCollapsed"
    >
      <AppIcon name="menu" :size="16" />
    </button>

    <nav class="menus">
      <button
        v-for="(menu, i) in menus"
        :key="menu.label"
        class="menu-btn"
        :class="{ active: openIndex === i }"
        @click="onMenuClick(i, $event)"
        @mouseenter="onMenuHover(i, $event)"
      >
        {{ menu.label }}
      </button>
    </nav>

    <div class="spacer" />

    <button
      class="app-btn ghost sm icon-btn"
      :title="prefs.locale"
      @click="toggleLang"
    >
      <AppIcon name="globe" :size="14" />
      <span class="lang-short">{{ localeMeta(prefs.locale).short }}</span>
    </button>

    <button
      class="app-btn ghost sm icon-btn"
      :title="
        prefs.resolvedTheme === 'dark' ? t('menu.switchToLight') : t('menu.switchToDark')
      "
      @click="prefs.toggleTheme()"
    >
      <AppIcon :name="prefs.resolvedTheme === 'dark' ? 'sun' : 'moon'" :size="14" />
    </button>

    <MenuDropdown
      v-if="openIndex >= 0"
      :items="menus[openIndex].items"
      :x="pos.x"
      :y="pos.y"
      @close="closeMenu"
    />
    <MenuDropdown
      v-if="collapsedOpen"
      :items="collapsedItems()"
      :x="collapsedPos.x"
      :y="collapsedPos.y"
      @close="closeMenu"
    />
    <MenuDropdown
      v-if="langOpen"
      :items="langItems()"
      :x="langPos.x"
      :y="langPos.y"
      @close="closeMenu"
    />

    <AppModal
      v-if="dialog.current.value === 'shortcuts'"
      :title="t('dialog.shortcutsTitle')"
      :width="460"
      @close="dialog.close()"
    >
      <table class="shortcut-table">
        <tbody>
          <tr v-for="row in SHORTCUT_ROWS" :key="row.keys">
            <td class="keys mono">{{ row.keys }}</td>
            <td>{{ t(row.key) }}</td>
          </tr>
        </tbody>
      </table>
      <p class="hint">{{ t('dialog.shortcutsNote') }}</p>
    </AppModal>

    <AppModal
      v-if="dialog.current.value === 'about'"
      :title="t('dialog.aboutTitle')"
      :width="500"
      @close="dialog.close()"
    >
      <h3 class="about-title">{{ t('app.name') }}</h3>
      <p class="about-desc">{{ t('dialog.aboutDesc') }}</p>
      <ul class="about-list">
        <li>{{ t('dialog.aboutPoint1') }}</li>
        <li>{{ t('dialog.aboutPoint2') }}</li>
        <li>{{ t('dialog.aboutPoint3') }}</li>
      </ul>
    </AppModal>
  </header>
</template>

<style scoped>
.menubar {
  display: flex;
  align-items: center;
  gap: 4px;
  height: var(--menubar-h);
  padding: 0 6px;
  background: var(--bg-menubar);
  border-bottom: 1px solid var(--border);
  user-select: none;
}
.brand {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px 0 2px;
  font-weight: 600;
  font-size: 12px;
  color: var(--fg-muted);
}
.logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: var(--accent);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
}
.menus {
  display: flex;
  align-items: center;
  gap: 1px;
}
.menu-btn {
  height: 22px;
  padding: 0 9px;
  border: 0;
  border-radius: 3px;
  background: transparent;
  cursor: pointer;
}
.menu-btn:hover {
  background: var(--bg-hover);
}
.menu-btn.active {
  background: var(--bg-active);
}
.spacer {
  flex: 1;
}
.icon-btn {
  color: var(--fg-muted);
}
/* 手机端的折叠菜单按钮，桌面端隐藏 */
.menu-collapsed {
  display: none;
  color: var(--fg-muted);
}
.lang-short {
  font-size: 11px;
}
.shortcut-table {
  width: 100%;
  border-collapse: collapse;
}
.shortcut-table td {
  padding: 5px 4px;
  border-bottom: 1px solid var(--border);
}
.keys {
  /* 快捷键列按内容自适应：写死 160px 时，窄屏 14px 字号下的
     "Ctrl + Shift + F" 会顶出格子压到描述文字上 */
  width: 1%;
  padding-right: 12px;
  color: var(--accent);
  white-space: nowrap;
}
.hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: var(--fg-muted);
  line-height: 1.6;
}
.about-title {
  margin: 0 0 8px;
  font-size: 15px;
}
.about-desc {
  margin: 0 0 10px;
  line-height: 1.7;
  color: var(--fg-muted);
}
.about-list {
  margin: 0;
  padding-left: 18px;
  line-height: 1.9;
  color: var(--fg-muted);
}

/* ---------- 手机：收起文字菜单，改用 ☰ ---------- */
@media (max-width: 720px) {
  .menubar {
    padding: 0 4px;
    gap: 2px;
  }
  .brand {
    padding: 0 4px 0 2px;
  }
  .menus {
    display: none;
  }
  .menu-collapsed {
    display: inline-flex;
  }
  .menu-collapsed.active {
    background: var(--bg-active);
  }
  .icon-btn {
    padding: 0 8px;
  }
  .lang-short {
    font-size: 12px;
  }
  .shortcut-table .keys {
    padding-right: 10px;
  }
}

/* 极窄屏（如 320px）：品牌只留图标 */
@media (max-width: 400px) {
  .brand .name {
    display: none;
  }
}
</style>
