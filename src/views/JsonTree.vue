<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import JsonEditor from '@/components/editor/JsonEditor.vue'
import DataSourcePicker from '@/components/common/DataSourcePicker.vue'
import TreeNode from '@/components/tree/TreeNode.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { useToolContext } from '@/composables/useToolContext'
import { useDebounced } from '@/composables/useDebounced'
import { parseJson } from '@/utils/json'

const { t } = useI18n()
const ctx = useToolContext()

const filter = ref('')
const showType = ctx.option<boolean>('showType', true)
const expandDepth = ctx.option<number>('expandDepth', 2)
const expandToken = ref(0)
const collapseToken = ref(0)

const debouncedInput = useDebounced(ctx.input, 220)

const parsed = computed(() => parseJson(debouncedInput.value))

/** 一次性算出所有命中路径（含命中节点的祖先），避免每个节点各自遍历子树 */
const matchPaths = computed(() => {
  const set = new Set<string>()
  const keyword = filter.value.trim().toLowerCase()
  if (!keyword || !parsed.value.ok) return set

  const walk = (value: unknown, path: string, key: string): boolean => {
    let hit = key.toLowerCase().includes(keyword)
    if (!hit && (value === null || typeof value !== 'object')) {
      hit = String(value).toLowerCase().includes(keyword)
    }
    let childHit = false
    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (walk(v, `${path}[${i}]`, String(i))) childHit = true
      })
    } else if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        const childPath = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k)
          ? `${path}.${k}`
          : `${path}['${k.replace(/'/g, "\\'")}']`
        if (walk(v, childPath, k)) childHit = true
      }
    }
    if (hit || childHit) set.add(path)
    return hit || childHit
  }

  walk(parsed.value.value, '$', '')
  return set
})

/** 展开/折叠：通过 key 变化强制 TreeNode 重建，从而重置其内部展开状态 */
const treeKey = computed(() => `${expandToken.value}-${collapseToken.value}`)

function expandAll() {
  expandDepth.value = 99
  expandToken.value += 1
}
function collapseAll() {
  expandDepth.value = 0
  collapseToken.value += 1
}
</script>

<template>
  <div class="view">
    <div class="tool-row">
      <DataSourcePicker />
      <span class="sep" />
      <button class="app-btn sm" @click="expandAll">
        <AppIcon name="chevronDown" :size="13" />
        {{ t('jsonTree.expandAll') }}
      </button>
      <button class="app-btn sm" @click="collapseAll">
        <AppIcon name="chevronRight" :size="13" />
        {{ t('jsonTree.collapseAll') }}
      </button>
      <span class="sep" />
      <label class="field-inline">
        {{ t('jsonTree.filter') }}
        <input
          v-model="filter"
          class="app-input"
          style="width: 170px"
          :placeholder="t('jsonTree.filterPlaceholder')"
        />
      </label>
      <label class="app-checkbox">
        <input v-model="showType" type="checkbox" />{{ t('jsonTree.showType') }}
      </label>
      <span class="spacer" />
      <span v-if="filter.trim()" class="badge">
        {{ t('jsonTree.hitNodes', { count: matchPaths.size }) }}
      </span>
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
          <span>{{ t('jsonTree.treeLabel') }}</span>
          <span class="spacer" />
          <span class="faint">{{ t('jsonTree.rootPath') }}</span>
        </header>
        <div class="pane-body tree-body">
          <TreeNode
            v-if="parsed.ok"
            :key="treeKey"
            node-key="$"
            path="$"
            :value="parsed.value"
            :depth="0"
            :expand-depth="expandDepth"
            :filter="filter"
            :match-paths="matchPaths"
            :show-type="showType"
          />
          <div v-else class="empty">
            <AppIcon name="info" :size="20" />
            <p>{{ t('jsonTree.cannotBuild') }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.tree-body {
  padding: 4px 0;
}
</style>
