<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/common/AppIcon.vue'
import { copyText } from '@/utils/file'
import { useToast } from '@/composables/useToast'
import { jsonType, typeLabel } from '@/utils/json'

const props = defineProps<{
  nodeKey: string
  path: string
  value: unknown
  depth: number
  expandDepth: number
  filter: string
  matchPaths: Set<string>
  showType: boolean
}>()

const { t } = useI18n()
const toast = useToast()
const manualOpen = ref<boolean | null>(null)

const type = computed(() => jsonType(props.value))
const isBranch = computed(() => type.value === 'object' || type.value === 'array')
const entries = computed<Array<[string, unknown]>>(() => {
  if (!isBranch.value) return []
  if (Array.isArray(props.value)) {
    return props.value.map((v, i) => [String(i), v] as [string, unknown])
  }
  return Object.entries(props.value as Record<string, unknown>)
})

const filterActive = computed(() => props.filter.trim().length > 0)

/** 过滤时自动展开命中分支 */
const open = computed(() => {
  if (filterActive.value && isBranch.value && props.matchPaths.has(props.path)) return true
  if (manualOpen.value !== null) return manualOpen.value
  return props.depth < props.expandDepth
})

const visible = computed(() => !filterActive.value || props.matchPaths.has(props.path))

const preview = computed(() => {
  if (type.value === 'array') return `[${(props.value as unknown[]).length}]`
  if (type.value === 'object') return `{${Object.keys(props.value as object).length}}`
  if (type.value === 'string') return JSON.stringify(props.value)
  return String(props.value)
})

function childPath(key: string, isIndex: boolean): string {
  if (isIndex) return `${props.path}[${key}]`
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
    ? `${props.path}.${key}`
    : `${props.path}['${key.replace(/'/g, "\\'")}']`
}

async function copyPath() {
  const ok = await copyText(props.path)
  ok ? toast.ok(t('tree.copiedPath', { path: props.path })) : toast.err(t('common.copyFailed'))
}

async function copyValue() {
  const ok = await copyText(
    typeof props.value === 'string' ? props.value : JSON.stringify(props.value, null, 2),
  )
  ok ? toast.ok(t('tree.copiedValue')) : toast.err(t('common.copyFailed'))
}
</script>

<template>
  <div v-if="visible" class="node">
    <div class="row" :style="{ paddingLeft: `calc(var(--tree-indent) * ${depth} + 6px)` }">
      <button
        v-if="isBranch"
        class="twist"
        :class="{ open }"
        @click="manualOpen = !open"
      >
        <AppIcon name="chevronRight" :size="12" />
      </button>
      <span v-else class="twist placeholder" />

      <span class="key">{{ nodeKey }}</span>
      <span class="colon">:</span>

      <template v-if="isBranch">
        <span class="summary" @click="manualOpen = !open">
          {{ open ? (type === 'array' ? '[' : '{') : preview }}
        </span>
      </template>
      <template v-else>
        <span class="value" :class="type">{{ preview }}</span>
      </template>

      <span v-if="showType" class="type faint">{{ typeLabel(value) }}</span>

      <span class="actions">
        <button class="act" :title="t('tree.copyPathTip')" @click="copyPath">
          {{ t('tree.path') }}
        </button>
        <button class="act" :title="t('tree.copyValueTip')" @click="copyValue">
          {{ t('tree.value') }}
        </button>
      </span>
    </div>

    <template v-if="isBranch && open">
      <TreeNode
        v-for="[k, v] in entries"
        :key="k"
        :node-key="k"
        :path="childPath(k, Array.isArray(value))"
        :value="v"
        :depth="depth + 1"
        :expand-depth="expandDepth"
        :filter="filter"
        :match-paths="matchPaths"
        :show-type="showType"
      />
      <div
        v-if="!entries.length"
        class="row empty-row"
        :style="{ paddingLeft: `calc(var(--tree-indent) * ${depth} + 20px)` }"
      >
        <span class="faint">
          {{ t(type === 'array' ? 'tree.emptyArray' : 'tree.emptyObject') }}
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 22px;
  padding-right: 8px;
  font-family: var(--font-mono);
  font-size: 12.5px;
  white-space: nowrap;
}
.row:hover {
  background: var(--bg-hover);
}
.twist {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  flex: none;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: var(--fg-muted);
  cursor: pointer;
  transition: transform 0.12s;
}
.twist.open {
  transform: rotate(90deg);
}
.twist.placeholder {
  cursor: default;
}
.key {
  color: var(--json-key);
}
.colon {
  color: var(--json-punct);
}
.summary {
  color: var(--fg-muted);
  cursor: pointer;
}
.value.string {
  color: var(--json-string);
}
.value.number {
  color: var(--json-number);
}
.value.boolean,
.value.null {
  color: var(--json-literal);
}
.type {
  font-size: 11px;
}
.actions {
  display: none;
  gap: 4px;
  margin-left: 6px;
}
.row:hover .actions {
  display: inline-flex;
}
.act {
  height: 17px;
  padding: 0 5px;
  border: 1px solid var(--border-strong);
  border-radius: 3px;
  background: var(--bg-panel);
  color: var(--fg-muted);
  font-size: 11px;
  cursor: pointer;
}
.act:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.empty-row {
  color: var(--fg-faint);
}

/* ---------- 触屏 ---------- */
/* 触屏没有 hover，复制按钮必须常显，否则手机上根本点不到 */
@media (hover: none) {
  .actions {
    display: inline-flex;
  }
  .act {
    height: 26px;
    padding: 0 8px;
    font-size: 12px;
  }
}

/* ---------- 手机 ---------- */
@media (max-width: 720px) {
  .row {
    font-size: 13.5px;
    min-height: 26px;
  }
  .twist {
    width: 20px;
    height: 20px;
  }
}
</style>
