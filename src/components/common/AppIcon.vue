<script setup lang="ts">
import { computed } from 'vue'

/**
 * 内联 SVG 图标集。刻意不引图标库/字体：单文件构建下 file:// 无法 fetch 外部资源。
 * 全部为静态字符串，v-html 无注入风险。
 */
const ICONS: Record<string, string> = {
  // ---- 工具图标 ----
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/>',
  format:
    '<path d="M9 4H7.5A2.5 2.5 0 0 0 5 6.5v2A2.5 2.5 0 0 1 2.5 11 2.5 2.5 0 0 1 5 13.5v2A2.5 2.5 0 0 0 7.5 18H9"/><path d="M15 4h1.5A2.5 2.5 0 0 1 19 6.5v2A2.5 2.5 0 0 0 21.5 11 2.5 2.5 0 0 0 19 13.5v2A2.5 2.5 0 0 1 16.5 18H15"/>',
  tree: '<circle cx="7" cy="5" r="2"/><circle cx="17" cy="12" r="2"/><circle cx="7" cy="19" r="2"/><path d="M7 7v10"/><path d="M9 5h4a2 2 0 0 1 2 2v3"/>',
  diff: '<rect x="3" y="4" width="7.5" height="16" rx="1.5"/><rect x="13.5" y="4" width="7.5" height="16" rx="1.5"/><path d="M6.75 9.5h-1M6.75 9.5h1M6.75 9.5v-1M6.75 9.5v1"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-3.6-3.6"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
  sort: '<path d="M4 7h10M4 12h7M4 17h4"/><path d="M17 5v14"/><path d="m14 16 3 3 3-3"/>',
  schema: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
  dice: '<rect x="3" y="3" width="18" height="18" rx="3.5"/><circle cx="8.5" cy="8.5" r="1.1"/><circle cx="15.5" cy="15.5" r="1.1"/><circle cx="12" cy="12" r="1.1"/>',
  swap: '<path d="M4 8h13"/><path d="m14 5 3 3-3 3"/><path d="M20 16H7"/><path d="m10 13-3 3 3 3"/>',
  sheet: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
  escape: '<path d="m11 5-5 14"/><path d="M15 9h4M15 13h4M15 17h4"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',

  // ---- UI 图标 ----
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5.5A2.5 2.5 0 0 1 7.5 3H15"/>',
  download: '<path d="M12 4v11"/><path d="m7 12 5 5 5-5"/><path d="M5 20h14"/>',
  upload: '<path d="M12 20V9"/><path d="m7 12 5-5 5 5"/><path d="M5 4h14"/>',
  trash: '<path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M6 7l1 13h10l1-13"/>',
  check: '<path d="m5 13 4.5 4.5L19 7"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>',
  save: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h7V3"/><path d="M8 21v-6h8v6"/>',
  refresh: '<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20 4v4h-4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  keyboard:
    '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>',
  eraser: '<path d="m6 17 8-8 5 5-4 4H7z"/><path d="M4 21h16"/>',
  arrowRight: '<path d="M4 12h15"/><path d="m14 7 5 5-5 5"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3.5 12h17"/><path d="M12 3c2.6 2.6 2.6 15.4 0 18"/><path d="M12 3c-2.6 2.6-2.6 15.4 0 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
}

const props = withDefaults(defineProps<{ name: string; size?: number }>(), { size: 16 })

const markup = computed(() => ICONS[props.name] ?? ICONS.info)
</script>

<template>
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="markup"
  />
</template>

<style scoped>
.app-icon {
  flex: none;
  display: block;
}
</style>
