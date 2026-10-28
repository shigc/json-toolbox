<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import JsonEditor from '@/components/editor/JsonEditor.vue'
import DataSourcePicker from '@/components/common/DataSourcePicker.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { JSONPath } from 'jsonpath-plus'
import { useToolContext } from '@/composables/useToolContext'
import { useDebounced } from '@/composables/useDebounced'
import { usePrefsStore } from '@/stores/prefs'
import { useToast } from '@/composables/useToast'
import { copyText } from '@/utils/file'
import { formatJson, parseJson } from '@/utils/json'

const { t } = useI18n()
const ctx = useToolContext()
const prefs = usePrefsStore()
const toast = useToast()

const path = ctx.option<string>('path', '$..*')
const onlyPaths = ctx.option<boolean>('onlyPaths', false)

const debouncedInput = useDebounced(ctx.input, 220)
const debouncedPath = useDebounced(path, 220)

const parsed = computed(() => parseJson(debouncedInput.value))

interface Match {
  path: string
  value: unknown
  preview: string
  kind: string
}

const query = computed<{ ok: boolean; error: string; matches: Match[] }>(() => {
  if (!parsed.value.ok) return { ok: false, error: t('common.invalidJson'), matches: [] }
  const expr = debouncedPath.value.trim()
  if (!expr) return { ok: false, error: t('jsonPath.emptyExpression'), matches: [] }

  try {
    const raw = JSONPath({
      path: expr,
      json: parsed.value.value as object,
      resultType: 'all',
    }) as Array<{ path: string; value: unknown }>
    const list = Array.isArray(raw) ? raw : []
    const matches: Match[] = list.map((item) => {
      const value = item.value
      const kind =
        value === null ? 'null' : Array.isArray(value) ? `array(${value.length})` : typeof value
      return {
        path: String(item.path ?? ''),
        value,
        preview: typeof value === 'object' ? JSON.stringify(value) : String(value),
        kind,
      }
    })
    return { ok: true, error: '', matches }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), matches: [] }
  }
})

const outputText = computed(() => {
  if (!query.value.ok) return ''
  if (onlyPaths.value) return query.value.matches.map((m) => m.path).join('\n')
  return formatJson(
    query.value.matches.map((m) => m.value),
    prefs.indentText(),
  )
})

watch(outputText, (v) => {
  ctx.output.value = v
})

const PRESETS: Array<{ labelKey: string; expr: string }> = [
  { labelKey: 'jsonPath.presetAll', expr: '$..*' },
  { labelKey: 'jsonPath.presetArray', expr: '$[*]' },
  { labelKey: 'jsonPath.presetSameKey', expr: '$..name' },
  { labelKey: 'jsonPath.presetFilter', expr: '$[?(@.age > 30)]' },
  { labelKey: 'jsonPath.presetFirst3', expr: '$[0:3]' },
  { labelKey: 'jsonPath.presetValues', expr: '$.*' },
]

async function copyResult() {
  if (!outputText.value) return toast.err(t('common.noResultToCopy'))
  const ok = await copyText(outputText.value)
  ok ? toast.ok(t('common.copied')) : toast.err(t('common.copyFailed'))
}

async function copyOne(m: Match) {
  const ok = await copyText(m.path)
  ok ? toast.ok(t('jsonPath.copiedPath', { path: m.path })) : toast.err(t('common.copyFailed'))
}
</script>

<template>
  <div class="view">
    <div class="tool-row">
      <DataSourcePicker />
      <span class="sep" />
      <label class="field-inline">
        {{ t('jsonPath.expression') }}
        <input
          v-model="path"
          class="app-input mono"
          style="width: 250px"
          placeholder="$..*"
          spellcheck="false"
        />
      </label>
      <label class="app-checkbox">
        <input v-model="onlyPaths" type="checkbox" />{{ t('jsonPath.onlyPaths') }}
      </label>
      <span class="spacer" />
      <span v-if="query.ok" class="badge ok">
        {{ t('jsonPath.hitItems', { count: query.matches.length }) }}
      </span>
      <span v-else-if="parsed.ok" class="badge err">{{ query.error }}</span>
      <button class="app-btn sm" @click="copyResult">
        <AppIcon name="copy" :size="13" />
        {{ t('common.copyResult') }}
      </button>
    </div>

    <div class="tool-row presets">
      <span class="faint">{{ t('jsonPath.presets') }}</span>
      <button
        v-for="preset in PRESETS"
        :key="preset.expr"
        class="app-btn sm"
        @click="path = preset.expr"
      >
        {{ t(preset.labelKey) }}
      </button>
    </div>

    <div class="split cols-2" v-split>
      <section class="pane">
        <header class="pane-head">
          <span>{{ t('jsonTree.inputLabel') }}</span>
          <span class="spacer" />
          <span v-if="parsed.ok" class="badge ok">{{ t('common.valid') }}</span>
          <span v-else class="badge err">
            {{ t('common.lineBadge', { line: parsed.error.line }) }}
          </span>
        </header>
        <div class="pane-body">
          <JsonEditor v-model="ctx.input.value" language="json" />
        </div>
      </section>

      <section class="pane">
        <header class="pane-head">
          <span>{{ t('jsonPath.results') }}</span>
          <span class="spacer" />
          <span class="faint">{{ t('jsonPath.clickRowTip') }}</span>
        </header>
        <div class="pane-body results scroll-y">
          <div v-if="!query.ok" class="empty">
            <AppIcon name="search" :size="20" />
            <p>{{ query.error }}</p>
          </div>
          <div v-else-if="!query.matches.length" class="empty">
            <AppIcon name="info" :size="20" />
            <p>{{ t('jsonPath.noMatch') }}</p>
          </div>
          <div
            v-for="(m, i) in query.matches"
            v-else
            :key="i"
            class="result-row"
            @click="copyOne(m)"
          >
            <span class="idx faint">{{ i + 1 }}</span>
            <span class="rpath mono">{{ m.path }}</span>
            <span class="rkind badge">{{ m.kind }}</span>
            <span class="rvalue mono">{{ m.preview }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.presets {
  min-height: 32px;
  padding: 3px 8px;
  background: var(--bg-inset);
}
.results {
  padding: 4px 0;
}
.result-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 3px 10px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  font-size: 12px;
}
.result-row:hover {
  background: var(--bg-hover);
}
.idx {
  /* 同上：结果序号会到 4~5 位，写死宽度会让数字溢出压到路径上 */
  min-width: 26px;
  flex: none;
  text-align: right;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.rpath {
  flex: none;
  max-width: 46%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--json-key);
}
.rkind {
  flex: none;
}
.rvalue {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--fg-muted);
}

/* ---------- 手机 ---------- */
@media (max-width: 720px) {
  .presets {
    min-height: 40px;
  }
  .result-row {
    gap: 6px;
    padding: 4px 8px;
    font-size: 11.5px;
  }
  .idx {
    min-width: 20px;
  }
  .rpath {
    max-width: 36%;
  }
}
</style>
