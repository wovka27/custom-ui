<script setup lang="ts">
import { ledgerScore, UiButton, UiConfigProvider, UiInput, UiStack } from '@/index'

const { name } = defineProps<{ name: string }>()
</script>

<template>
  <ui-config-provider v-if="name === 'UiConfigProvider'" :score="ledgerScore">
    <ui-stack gap="sm">
      <p>This region wears Ledger. The rest of the page keeps the kit.</p>
      <ui-input aria-label="Name" placeholder="Ada" />
      <ui-button>Save</ui-button>
    </ui-stack>
  </ui-config-provider>
</template>

<style scoped lang="scss">
p {
  margin: 0;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}
</style>
