<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import JsonEditor from '@/components/editor/JsonEditor.vue'
import DataSourcePicker from '@/components/common/DataSourcePicker.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { useToolContext } from '@/composables/useToolContext'
import { useDebounced } from '@/composables/useDebounced'
import { useToast } from '@/composables/useToast'
import { copyText, downloadText } from '@/utils/file'
import {
  FORMATS,
  FORMAT_EXT,
  FORMAT_LABEL,
  parseAs,
  serializeAs,
  type DataFormat,
} from '@/utils/convert'

const { t } = useI18n()
const ctx = useToolContext()
const toast = useToast()

const from = ctx.option<DataFormat>('from', 'json')
const to = ctx.option<DataFormat>('to', 'yaml')

const debouncedInput = useDebounced(ctx.input, 220)

const result = computed(() => {
  if (from.value === to.value) {
    return { ok: true as const, error: '', text: debouncedInput.value }
  }
  try {
    const value = parseAs(from.value, debouncedInput.value)
    return { ok: true as const, error: '', text: serializeAs(to.value, value) }
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : String(e),
      text: '',
    }
  }
})

watch(
  result,
  (r) => {
    ctx.output.value = r.text
  },
  { immediate: true },
)

function swap() {
  const out = result.value.ok ? result.value.text : ''
  const prevFrom = from.value
  from.value = to.value
  to.value = prevFrom
  if (out) ctx.input.value = out
  toast.ok(t('formatConvert.swapped'))
}

async function copyResult() {
  if (!result.value.ok) return toast.err(t('formatConvert.convertFailed'))
  const ok = await copyText(result.value.text)
  ok ? toast.ok(t('common.copied')) : toast.err(t('common.copyFailed'))
}

function exportResult() {
  if (!result.value.ok) return toast.err(t('formatConvert.convertFailed'))
  downloadText(
    `converted.${FORMAT_EXT[to.value]}`,
    result.value.text,
    to.value === 'json' ? 'application/json' : 'text/plain',
  )
  toast.ok(t('common.downloadStarted'))
}
</script>

<template>
  <div class="view">
    <div class="tool-row">
      <DataSourcePicker />
      <span class="sep" />
      <label class="field-inline">
        {{ t('formatConvert.from') }}
        <select v-model="from" class="app-select">
          <option v-for="f in FORMATS" :key="f" :value="f">{{ FORMAT_LABEL[f] }}</option>
        </select>
      </label>
      <button class="app-btn ghost sm" :title="t('formatConvert.swapTip')" @click="swap">
        <AppIcon name="swap" :size="14" />
      </button>
      <label class="field-inline">
        {{ t('formatConvert.to') }}
        <select v-model="to" class="app-select">
          <option v-for="f in FORMATS" :key="f" :value="f">{{ FORMAT_LABEL[f] }}</option>
        </select>
      </label>
      <span class="spacer" />
      <span v-if="result.ok" class="badge ok">{{ t('formatConvert.convertOk') }}</span>
      <span v-else class="badge err">{{ t('formatConvert.convertFailed') }}</span>
      <button class="app-btn sm" @click="copyResult">
        <AppIcon name="copy" :size="13" />
        {{ t('common.copyResult') }}
      </button>
      <button class="app-btn sm" @click="exportResult">
        <AppIcon name="download" :size="13" />
        {{ t('common.export') }}
      </button>
    </div>

    <div class="split cols-2" v-split>
      <section class="pane">
        <header class="pane-head">
          <span>{{ t('formatConvert.inputLabel', { format: FORMAT_LABEL[from] }) }}</span>
        </header>
        <div class="pane-body">
          <JsonEditor
            v-model="ctx.input.value"
            :language="from === 'json' ? 'json' : 'text'"
            :placeholder="t('formatConvert.inputPlaceholder', { format: FORMAT_LABEL[from] })"
          />
        </div>
      </section>

      <section class="pane">
        <header class="pane-head">
          <span>{{ t('formatConvert.outputLabel', { format: FORMAT_LABEL[to] }) }}</span>
        </header>
        <div class="pane-body">
          <div v-if="!result.ok" class="empty">
            <AppIcon name="info" :size="20" />
            <p class="err-text">{{ result.error }}</p>
          </div>
          <JsonEditor
            v-else
            :model-value="result.text"
            :language="to === 'json' ? 'json' : 'text'"
            readonly
            :report-cursor="false"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.err-text {
  max-width: 420px;
  color: var(--danger);
  font-family: var(--font-mono);
  font-size: 12px;
  word-break: break-all;
}
</style>
