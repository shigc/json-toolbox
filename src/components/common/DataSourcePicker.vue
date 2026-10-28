<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from './AppIcon.vue'
import { useToolContext } from '@/composables/useToolContext'
import { useToast } from '@/composables/useToast'
import { sizeText } from '@/utils/json'

const { t } = useI18n()
const ctx = useToolContext()
const toast = useToast()

const sharedSize = computed(() => sizeText(ctx.ws.sharedText))

function pick(mode: 'shared' | 'own') {
  if (mode === ctx.source.value) return
  if (mode === 'shared') ctx.attach()
  else ctx.detach()
}

function push() {
  ctx.pushToShared()
  toast.ok(t('dataSource.pushed'))
}
</script>

<template>
  <div class="ds-picker" :title="t('dataSource.tip')">
    <span class="ds-label">{{ t('dataSource.label') }}</span>
    <div class="ds-seg">
      <button
        class="ds-btn"
        :class="{ on: ctx.source.value === 'shared' }"
        @click="pick('shared')"
      >
        {{ t('dataSource.shared') }}
      </button>
      <button class="ds-btn" :class="{ on: ctx.source.value === 'own' }" @click="pick('own')">
        {{ t('dataSource.own') }}
      </button>
    </div>
    <button
      v-if="ctx.source.value === 'own'"
      class="app-btn sm"
      :title="t('dataSource.pushTip')"
      @click="push"
    >
      <AppIcon name="upload" :size="13" />
      {{ t('dataSource.push') }}
    </button>
    <span v-else class="ds-size faint mono">{{ sharedSize }}</span>
  </div>
</template>

<style scoped>
.ds-picker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ds-label {
  color: var(--fg-muted);
  font-size: 12px;
}
.ds-seg {
  display: inline-flex;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius);
  overflow: hidden;
}
.ds-btn {
  height: 24px;
  padding: 0 9px;
  border: 0;
  background: var(--bg-panel);
  color: var(--fg-muted);
  cursor: pointer;
  font-size: 12px;
}
.ds-btn + .ds-btn {
  border-left: 1px solid var(--border-strong);
}
.ds-btn:hover {
  background: var(--bg-hover);
}
.ds-btn.on {
  background: var(--accent);
  color: var(--fg-on-accent);
}
.ds-size {
  font-size: 11px;
}
</style>
