<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import JsonEditor from '@/components/editor/JsonEditor.vue'
import DataSourcePicker from '@/components/common/DataSourcePicker.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { useToolContext } from '@/composables/useToolContext'
import { useDebounced } from '@/composables/useDebounced'
import { useToast } from '@/composables/useToast'
import { copyText } from '@/utils/file'
import { describeDelta, diffJson, diffStats, formatDiffValue, type DiffKind } from '@/utils/diff'
import { parseJson } from '@/utils/json'
import { sampleCompareRight } from '@/locales/samples'

const { t } = useI18n()
const ctx = useToolContext()
const toast = useToast()

const rightText = ctx.option<string>('right', sampleCompareRight())

const leftDebounced = useDebounced(ctx.input, 240)
const rightDebounced = useDebounced(rightText, 240)

const leftParsed = computed(() => parseJson(leftDebounced.value))
const rightParsed = computed(() => parseJson(rightDebounced.value))

const comparison = computed(() => {
  if (!leftParsed.value.ok) {
    return {
      ok: false as const,
      error: t('jsonCompare.leftError', { message: leftParsed.value.error.message }),
      entries: [],
    }
  }
  if (!rightParsed.value.ok) {
    return {
      ok: false as const,
      error: t('jsonCompare.rightError', { message: rightParsed.value.error.message }),
      entries: [],
    }
  }
  const delta = diffJson(leftParsed.value.value, rightParsed.value.value)
  return { ok: true as const, error: '', entries: describeDelta(delta) }
})

const stats = computed(() => diffStats(comparison.value.entries))

const KIND_KEY: Record<DiffKind, string> = {
  add: 'jsonCompare.kindAdd',
  remove: 'jsonCompare.kindRemove',
  modify: 'jsonCompare.kindModify',
  move: 'jsonCompare.kindMove',
}

const KIND_SIGN: Record<DiffKind, string> = {
  add: '+',
  remove: '-',
  modify: '~',
  move: '→',
}

function diffText(): string {
  if (!comparison.value.ok) return ''
  const lines = [t('jsonCompare.copyHeader', { count: comparison.value.entries.length }), '']
  for (const e of comparison.value.entries) {
    if (e.kind === 'add') {
      lines.push(t('jsonCompare.copyAdd', { path: e.path, value: formatDiffValue(e.right) }))
    } else if (e.kind === 'remove') {
      lines.push(t('jsonCompare.copyRemove', { path: e.path, value: formatDiffValue(e.left) }))
    } else if (e.kind === 'modify') {
      lines.push(
        t('jsonCompare.copyModify', {
          path: e.path,
          from: formatDiffValue(e.left),
          to: formatDiffValue(e.right),
        }),
      )
    } else {
      lines.push(t('jsonCompare.copyMove', { path: e.path, note: e.note ?? '' }))
    }
  }
  return lines.join('\n')
}

async function copyDiff() {
  if (!comparison.value.ok || !comparison.value.entries.length) {
    return toast.err(t('jsonCompare.noDiff'))
  }
  const ok = await copyText(diffText())
  ok ? toast.ok(t('jsonCompare.copiedDiff')) : toast.err(t('common.copyFailed'))
}

function swap() {
  const left = ctx.input.value
  ctx.input.value = rightText.value
  rightText.value = left
  toast.ok(t('jsonCompare.swapped'))
}
</script>

<template>
  <div class="view">
    <div class="tool-row">
      <DataSourcePicker />
      <span class="sep" />
      <span class="faint">{{ t('jsonCompare.hint') }}</span>
      <span class="spacer" />
      <span v-if="comparison.ok" class="badge" :class="comparison.entries.length ? '' : 'ok'">
        {{
          comparison.entries.length
            ? t('jsonCompare.diffCount', { count: comparison.entries.length })
            : t('jsonCompare.identical')
        }}
      </span>
      <span v-else class="badge err">{{ t('jsonCompare.cannotCompare') }}</span>
      <button class="app-btn sm" @click="swap">
        <AppIcon name="swap" :size="13" />
        {{ t('jsonCompare.swapSides') }}
      </button>
      <button class="app-btn sm" @click="copyDiff">
        <AppIcon name="copy" :size="13" />
        {{ t('jsonCompare.copyDiff') }}
      </button>
    </div>

    <div class="cmp">
      <div class="split cols-2" v-split>
        <section class="pane">
          <header class="pane-head">
            <span>{{ t('jsonCompare.leftLabel') }}</span>
            <span class="spacer" />
            <span v-if="leftParsed.ok" class="badge ok">{{ t('common.valid') }}</span>
            <span v-else class="badge err">
              {{ t('common.lineBadge', { line: leftParsed.error.line }) }}
            </span>
          </header>
          <div class="pane-body">
            <JsonEditor v-model="ctx.input.value" language="json" />
          </div>
        </section>

        <section class="pane">
          <header class="pane-head">
            <span>{{ t('jsonCompare.rightLabel') }}</span>
            <span class="spacer" />
            <span v-if="rightParsed.ok" class="badge ok">{{ t('common.valid') }}</span>
            <span v-else class="badge err">
              {{ t('common.lineBadge', { line: rightParsed.error.line }) }}
            </span>
          </header>
          <div class="pane-body">
            <JsonEditor v-model="rightText" language="json" :report-cursor="false" />
          </div>
        </section>
      </div>

      <section class="pane diff-pane">
        <header class="pane-head">
          <span>{{ t('jsonCompare.detail') }}</span>
          <span class="spacer" />
          <span v-if="comparison.ok" class="badge">
            {{
              t('jsonCompare.statsLine', {
                add: stats.add,
                remove: stats.remove,
                modify: stats.modify,
                move: stats.move,
              })
            }}
          </span>
        </header>
        <div class="pane-body scroll-y">
          <div v-if="!comparison.ok" class="empty">
            <AppIcon name="info" :size="20" />
            <p>{{ comparison.error }}</p>
          </div>
          <div v-else-if="!comparison.entries.length" class="empty">
            <AppIcon name="check" :size="20" />
            <p>{{ t('jsonCompare.allIdentical') }}</p>
          </div>
          <div
            v-for="(entry, i) in comparison.entries"
            v-else
            :key="i"
            class="diff-row"
            :class="entry.kind"
          >
            <span class="sign">{{ KIND_SIGN[entry.kind] }}</span>
            <span class="kind">{{ t(KIND_KEY[entry.kind]) }}</span>
            <span class="path mono">{{ entry.path }}</span>
            <span v-if="entry.kind === 'modify'" class="values mono">
              <span class="old">{{ formatDiffValue(entry.left) }}</span>
              <span class="arrow">→</span>
              <span class="new">{{ formatDiffValue(entry.right) }}</span>
            </span>
            <span v-else-if="entry.kind === 'move'" class="values mono faint">
              {{ entry.note }}
            </span>
            <span v-else class="values mono">
              {{ formatDiffValue(entry.right ?? entry.left) }}
            </span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.cmp {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.cmp > .split {
  flex: 1;
  min-height: 0;
}
.diff-pane {
  flex: 0 0 34%;
  min-height: 140px;
  margin: 0 8px 8px;
}
.diff-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 3px 10px;
  border-bottom: 1px solid var(--border);
  font-size: 12px;
}
.diff-row.add {
  background: var(--diff-add-bg);
}
.diff-row.remove {
  background: var(--diff-del-bg);
}
.diff-row.modify {
  background: var(--diff-mod-bg);
}
.sign {
  width: 12px;
  flex: none;
  font-weight: 700;
  text-align: center;
}
.diff-row.add .sign,
.diff-row.add .values {
  color: var(--diff-add-fg);
}
.diff-row.remove .sign,
.diff-row.remove .values {
  color: var(--diff-del-fg);
}
.kind {
  /* 不要把宽度写死：英文的 Removed/Modified 比中文的「删除/修改」宽，
     固定 40px 会让文字溢出到右侧 path 上，和首字母重叠。
     用 min-width 只保证最短对齐，实际宽度交给内容（配合 nowrap 不换行）。 */
  flex: none;
  min-width: 40px;
  white-space: nowrap;
  color: var(--fg-muted);
}
.path {
  flex: none;
  max-width: 34%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--json-key);
}
.values {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.old {
  text-decoration: line-through;
  opacity: 0.75;
}
.arrow {
  margin: 0 6px;
  color: var(--fg-muted);
}

/* ---------- 手机 ---------- */
/* 三个面板（左右编辑器 + 差异明细）在窄屏很挤：
   上面的双栏由全局规则改成上下等分，这里把差异区压缩到 32% 并收紧行内间距。 */
@media (max-width: 720px) {
  .diff-pane {
    flex: 0 0 32%;
    min-height: 100px;
    margin: 0 6px 6px;
  }
  .diff-row {
    gap: 6px;
    padding: 3px 8px;
    font-size: 11.5px;
  }
  .kind {
    min-width: 34px;
  }
  .path {
    max-width: 38%;
  }
  .arrow {
    margin: 0 3px;
  }
}
</style>
