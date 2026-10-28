<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStatusStore } from '@/stores/status'
import { useWorkspaceStore } from '@/stores/workspace'
import { usePrefsStore } from '@/stores/prefs'
import { toolTitle } from '@/tools/registry'
import { localeMeta } from '@/i18n'
import { sizeText } from '@/utils/json'

const { t } = useI18n()
const status = useStatusStore()
const ws = useWorkspaceStore()
const prefs = usePrefsStore()

const inputSize = computed(() => sizeText(ws.activeInput))
const sharedSize = computed(() => sizeText(ws.sharedText))
const activeTitle = computed(() => (ws.activeTab ? toolTitle(ws.activeTab.toolId) : '—'))
</script>

<template>
  <footer class="statusbar no-select">
    <span class="cell tool">{{ activeTitle }}</span>
    <span v-if="status.message" class="cell msg" :class="status.level">
      {{ status.message }}
    </span>

    <span class="spacer" />

    <span class="cell optional" :title="t('status.sharedDataTip')">
      {{ t('status.sharedData', { size: sharedSize }) }}
    </span>
    <span class="cell optional" :title="t('status.inputTip')">
      {{ t('status.input', { size: inputSize }) }}
    </span>
    <span v-if="status.selLen > 0" class="cell optional">
      {{ t('status.selected', { count: status.selLen }) }}
    </span>
    <span class="cell cursor">
      {{ t('status.cursor', { line: status.line, col: status.col }) }}
    </span>
    <span class="cell">{{ localeMeta(prefs.locale).short }}</span>
    <span class="cell">{{ t(prefs.resolvedTheme === 'dark' ? 'menu.themeDark' : 'menu.themeLight') }}</span>
  </footer>
</template>

<style scoped>
.statusbar {
  display: flex;
  align-items: center;
  gap: 14px;
  height: var(--statusbar-h);
  padding: 0 10px;
  background: var(--bg-statusbar);
  color: var(--fg-statusbar);
  font-size: 11px;
  user-select: none;
}
.cell {
  white-space: nowrap;
  opacity: 0.92;
}
.tool {
  font-weight: 600;
  opacity: 1;
}
.msg.err {
  color: #ffd7d7;
  font-weight: 600;
}
.msg.ok {
  color: #d6ffe0;
}
.spacer {
  flex: 1;
}
.cursor {
  font-variant-numeric: tabular-nums;
}

/* ---------- 手机 ---------- */
/* 6 个单元格在 320px 视口下总宽 505px 会溢出，只保留关键信息：
   当前工具、光标位置、语言、主题；体积与选中数在窄屏隐藏。 */
@media (max-width: 720px) {
  .statusbar {
    gap: 10px;
    padding: 0 8px;
    font-size: 11px;
  }
  .statusbar .optional {
    display: none;
  }
  .tool {
    max-width: 42%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
