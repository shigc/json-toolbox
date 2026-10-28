<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import JsonEditor from '@/components/editor/JsonEditor.vue'
import DataSourcePicker from '@/components/common/DataSourcePicker.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { useToolContext } from '@/composables/useToolContext'
import { useDebounced } from '@/composables/useDebounced'
import { usePrefsStore } from '@/stores/prefs'
import { useToast } from '@/composables/useToast'
import { copyText, downloadText } from '@/utils/file'
import { formatJson, parseJson } from '@/utils/json'
import { MOCK_RULES, generateMock } from '@/utils/mock'

const { t } = useI18n()
const ctx = useToolContext()
const prefs = usePrefsStore()
const toast = useToast()

const arraySize = ctx.option<number>('arraySize', 2)
const showRules = ref(false)
const regenerateToken = ref(0)

const debouncedInput = useDebounced(ctx.input, 220)

const result = computed(() => {
  // 依赖 regenerateToken 以支持「重新生成」
  void regenerateToken.value
  const res = parseJson(debouncedInput.value)
  if (!res.ok) return { ok: false as const, error: res.error, text: '' }
  try {
    const mock = generateMock(res.value, { arraySize: Number(arraySize.value) || 0 })
    return { ok: true as const, error: null, text: formatJson(mock, prefs.indentText()) }
  } catch (e) {
    return {
      ok: false as const,
      error: { message: e instanceof Error ? e.message : String(e), line: 1, col: 1, index: -1 },
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

function regenerate() {
  regenerateToken.value += 1
  toast.ok(t('mock.regenerated'))
}

async function copyResult() {
  if (!result.value.ok) return toast.err(t('mock.invalidTemplate'))
  const ok = await copyText(result.value.text)
  ok ? toast.ok(t('common.copied')) : toast.err(t('common.copyFailed'))
}

function exportResult() {
  if (!result.value.ok) return toast.err(t('mock.invalidTemplate'))
  downloadText('mock.json', result.value.text)
  toast.ok(t('common.downloadStarted'))
}

function replaceInput() {
  if (!result.value.ok) return toast.err(t('mock.invalidTemplate'))
  ctx.input.value = result.value.text
  toast.ok(t('common.replacedInput'))
}
</script>

<template>
  <div class="view">
    <div class="tool-row">
      <DataSourcePicker />
      <span class="sep" />
      <label class="field-inline">
        {{ t('mock.arraySize') }}
        <input
          v-model.number="arraySize"
          type="number"
          min="0"
          max="50"
          class="app-input"
          style="width: 66px"
        />
      </label>
      <button class="app-btn sm primary" @click="regenerate">
        <AppIcon name="refresh" :size="13" />
        {{ t('mock.regenerate') }}
      </button>
      <button class="app-btn sm" @click="showRules = !showRules">
        <AppIcon name="info" :size="13" />
        {{ t(showRules ? 'mock.hideRules' : 'mock.showRules') }}
      </button>
      <span class="spacer" />
      <span v-if="result.ok" class="badge ok">{{ t('schema.generated') }}</span>
      <span v-else class="badge err">
        {{ t('common.lineError', { line: result.error?.line }) }}
      </span>
      <button class="app-btn sm" @click="copyResult">
        <AppIcon name="copy" :size="13" />
        {{ t('common.copyResult') }}
      </button>
      <button class="app-btn sm" @click="exportResult">
        <AppIcon name="download" :size="13" />
        {{ t('common.export') }}
      </button>
    </div>

    <div v-if="showRules" class="rules scroll-y">
      <span class="faint rules-hint">{{ t('mock.rulesHint') }}</span>
      <div class="rules-grid">
        <span v-for="item in MOCK_RULES" :key="item.rule" class="rule">
          <code class="mono">{{ item.rule }}</code>
          <span class="faint">{{ t(item.key) }}</span>
        </span>
      </div>
    </div>

    <div class="split cols-2" v-split>
      <section class="pane">
        <header class="pane-head">
          <span>{{ t('mock.template') }}</span>
          <span class="spacer" />
          <span class="faint">{{ t('mock.templateHint') }}</span>
        </header>
        <div class="pane-body">
          <JsonEditor v-model="ctx.input.value" language="json" />
        </div>
      </section>
      <section class="pane">
        <header class="pane-head">
          <span>{{ t('mock.output') }}</span>
          <span class="spacer" />
          <button class="app-btn ghost sm" @click="replaceInput">
            {{ t('mock.replaceTemplate') }}
          </button>
        </header>
        <div class="pane-body">
          <JsonEditor :model-value="result.text" language="json" readonly :report-cursor="false" />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.rules {
  max-height: 168px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-inset);
}
.rules-hint {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
}
.rules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 3px 14px;
}
.rule {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 12px;
}
.rule code {
  color: var(--accent);
}
</style>
