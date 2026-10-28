<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import JsonEditor from '@/components/editor/JsonEditor.vue'
import DataSourcePicker from '@/components/common/DataSourcePicker.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { useToolContext } from '@/composables/useToolContext'
import { useDebounced } from '@/composables/useDebounced'
import { usePrefsStore } from '@/stores/prefs'
import { useStatusStore } from '@/stores/status'
import { useToast } from '@/composables/useToast'
import { copyText, downloadText } from '@/utils/file'
import { byteSize, formatBytes, formatJson, minifyJson, parseJson } from '@/utils/json'

const { t } = useI18n()
const ctx = useToolContext()
const prefs = usePrefsStore()
const status = useStatusStore()
const toast = useToast()

const mode = ctx.option<'pretty' | 'minify'>('mode', 'pretty')
const debouncedInput = useDebounced(ctx.input, 180)

const result = computed(() => {
  const res = parseJson(debouncedInput.value)
  if (!res.ok) return { ok: false as const, error: res.error, text: '' }
  return {
    ok: true as const,
    error: null,
    text:
      mode.value === 'minify'
        ? minifyJson(res.value)
        : formatJson(res.value, prefs.indentText()),
  }
})

// 同时依赖 locale：切换语言后状态栏的校验信息也要跟着变
watch(
  [result, () => prefs.locale],
  () => {
    const r = result.value
    if (r.ok) {
      status.setMessage(
        t('jsonFormat.validSummary', { size: formatBytes(byteSize(debouncedInput.value)) }),
        'ok',
      )
    } else {
      status.setMessage(
        t('common.lineColMessage', {
          line: r.error.line,
          col: r.error.col,
          message: r.error.message,
        }),
        'err',
      )
    }
    ctx.output.value = r.text
  },
  { immediate: true },
)

function replaceInput() {
  if (!result.value.ok) {
    toast.err(t('common.invalidJson'))
    return
  }
  ctx.input.value = result.value.text
  toast.ok(t('common.replacedInput'))
}

async function copyResult() {
  if (!result.value.ok) {
    toast.err(t('common.noResultToCopy'))
    return
  }
  const ok = await copyText(result.value.text)
  ok ? toast.ok(t('common.copied')) : toast.err(t('common.copyFailed'))
}

function exportResult() {
  if (!result.value.ok) {
    toast.err(t('common.noResultToExport'))
    return
  }
  downloadText('formatted.json', result.value.text)
  toast.ok(t('common.downloadStarted'))
}
</script>

<template>
  <div class="view">
    <div class="tool-row">
      <DataSourcePicker />
      <span class="sep" />
      <div class="seg">
        <button class="seg-btn" :class="{ on: mode === 'pretty' }" @click="mode = 'pretty'">
          {{ t('jsonFormat.pretty') }}
        </button>
        <button class="seg-btn" :class="{ on: mode === 'minify' }" @click="mode = 'minify'">
          {{ t('jsonFormat.minify') }}
        </button>
      </div>
      <label class="field-inline">
        {{ t('jsonFormat.indent') }}
        <select v-model="prefs.indent" class="app-select">
          <option :value="2">{{ t('menu.indent2') }}</option>
          <option :value="4">{{ t('menu.indent4') }}</option>
          <option value="tab">{{ t('menu.indentTab') }}</option>
        </select>
      </label>
      <span class="sep" />
      <button class="app-btn sm" @click="replaceInput">
        <AppIcon name="arrowRight" :size="13" />
        {{ t('common.replaceInput') }}
      </button>
      <span class="spacer" />
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
          <span>{{ t('common.input') }}</span>
          <span class="spacer" />
          <span class="badge mono">{{ formatBytes(byteSize(ctx.input.value)) }}</span>
        </header>
        <div class="pane-body">
          <JsonEditor
            v-model="ctx.input.value"
            language="json"
            :placeholder="t('jsonFormat.placeholder')"
          />
        </div>
      </section>

      <section class="pane">
        <header class="pane-head">
          <span>{{ t('common.result') }}</span>
          <span class="spacer" />
          <span v-if="result.ok" class="badge ok">
            <AppIcon name="check" :size="12" />
            {{ t('jsonFormat.checkPassed') }}
          </span>
          <span v-else class="badge err">
            {{ t('common.lineBadge', { line: result.error?.line }) }}
          </span>
        </header>
        <div class="pane-body">
          <JsonEditor
            :model-value="result.text"
            language="json"
            readonly
            :report-cursor="false"
          />
        </div>
      </section>
    </div>
  </div>
</template>
