<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/common/AppIcon.vue'
import { CATEGORY_KEY, CATEGORY_ORDER } from '@/tools/types'
import { LISTABLE_TOOLS, toolDesc, toolTitle } from '@/tools/registry'
import { useWorkspaceStore } from '@/stores/workspace'
import { sizeText } from '@/utils/json'

const { t } = useI18n()
const ws = useWorkspaceStore()

const sharedSize = computed(() => sizeText(ws.sharedText))

const groups = computed(() =>
  CATEGORY_ORDER.map((cat) => ({
    cat,
    label: t(CATEGORY_KEY[cat]),
    tools: LISTABLE_TOOLS.filter((tool) => tool.category === cat),
  })),
)
</script>

<template>
  <div class="view dash">
    <div class="dash-hero">
      <h1>{{ t('app.name') }}</h1>
      <p>{{ t('app.hero', { count: LISTABLE_TOOLS.length }) }}</p>
      <div class="dash-meta">
        <span class="badge">
          <AppIcon name="layers" :size="12" />
          {{ t('status.sharedData', { size: sharedSize }) }}
        </span>
        <span class="badge">
          <AppIcon name="schema" :size="12" />
          {{ t('dashboard.tabsOpen', { count: ws.tabs.length }) }}
        </span>
      </div>
    </div>

    <div class="dash-body scroll-y">
      <section v-for="group in groups" :key="group.cat" class="dash-group">
        <h2>{{ group.label }}</h2>
        <div class="dash-grid">
          <button
            v-for="tool in group.tools"
            :key="tool.id"
            class="dash-card"
            @click="ws.openTool(tool.id)"
          >
            <span class="card-icon">
              <AppIcon :name="tool.icon" :size="18" />
            </span>
            <span class="card-text">
              <span class="card-title">{{ toolTitle(tool.id) }}</span>
              <span class="card-desc">{{ toolDesc(tool.id) }}</span>
            </span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.dash {
  overflow: hidden;
}
.dash-hero {
  padding: 22px 24px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-panel);
}
.dash-hero h1 {
  margin: 0 0 6px;
  font-size: 20px;
}
.dash-hero p {
  margin: 0 0 10px;
  color: var(--fg-muted);
  line-height: 1.7;
  max-width: 660px;
}
.dash-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.dash-body {
  padding: 16px 24px 28px;
}
.dash-group {
  margin-bottom: 22px;
}
.dash-group h2 {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--fg-muted);
}
.dash-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 10px;
}
.dash-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-panel);
  text-align: left;
  cursor: pointer;
  box-shadow: var(--shadow-panel);
}
.dash-card:hover {
  border-color: var(--accent);
  background: var(--bg-hover);
}
.card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex: none;
  border-radius: 6px;
  background: var(--bg-active);
  color: var(--accent);
}
.card-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.card-title {
  font-weight: 600;
}
.card-desc {
  font-size: 12px;
  color: var(--fg-muted);
  line-height: 1.5;
}

/* ---------- 手机 ---------- */
@media (max-width: 720px) {
  .dash-hero {
    padding: 16px 14px 12px;
  }
  .dash-hero h1 {
    font-size: 18px;
  }
  .dash-hero p {
    font-size: 13px;
  }
  .dash-body {
    padding: 12px 14px 22px;
  }
  .dash-group {
    margin-bottom: 16px;
  }
  .dash-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .dash-card {
    padding: 11px;
  }
}
</style>
