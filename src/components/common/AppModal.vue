<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppIcon from './AppIcon.vue'

defineProps<{ title: string; width?: number }>()
const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
</script>

<template>
  <div class="modal-mask" @click.self="emit('close')">
    <div class="modal" :style="{ width: (width ?? 520) + 'px' }" role="dialog">
      <header class="modal-head">
        <span>{{ title }}</span>
        <button class="app-btn ghost sm" :title="t('menu.close')" @click="emit('close')">
          <AppIcon name="close" :size="14" />
        </button>
      </header>
      <div class="modal-body">
        <slot />
      </div>
      <footer v-if="$slots.footer" class="modal-foot">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 4000;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-panel);
  box-shadow: var(--shadow-popup);
  overflow: hidden;
}
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 8px 8px 14px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-inset);
  font-weight: 600;
  user-select: none;
}
.modal-body {
  padding: 14px;
  overflow: auto;
  min-height: 0;
}
.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid var(--border);
}

/* ---------- 手机：接近全屏，宽度覆盖组件传入的固定值 ---------- */
@media (max-width: 720px) {
  .modal {
    /* 需要 !important 才能盖掉模板里的内联 width */
    width: calc(100vw - 20px) !important;
    max-height: calc(100vh - 40px);
  }
  .modal-head {
    padding: 10px 8px 10px 12px;
  }
  .modal-body {
    padding: 12px;
  }
}
</style>
