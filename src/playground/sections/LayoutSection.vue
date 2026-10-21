<script setup lang="ts">
import {
  UiBadge,
  UiButton,
  UiCluster,
  UiContainer,
  UiGrid,
  UiSeparator,
  UiStack,
} from '@/index'

const cards = [
  { id: 'stack', title: 'Stack', copy: 'Vertical rhythm with a tokenized gap scale.' },
  { id: 'cluster', title: 'Cluster', copy: 'Wrapping rows for actions and metadata.' },
  { id: 'grid', title: 'Grid', copy: 'Intrinsic columns that collapse without a breakpoint map.' },
] as const
</script>

<template>
  <section id="layout" class="section" aria-labelledby="layout-title">
    <UiContainer width="100%">
      <UiStack gap="md">
        <header>
          <h2 id="layout-title" class="section-title">Layout</h2>
          <p class="lede">Shell, container, stack, cluster, and grid share one spacing scale.</p>
        </header>
        <UiGrid class="panel" min-column="14rem">
          <article v-for="card in cards" :key="card.id">
            <UiStack gap="sm">
              <UiCluster justify="between">
                <h3>{{ card.title }}</h3>
                <UiBadge tone="accent">Layout</UiBadge>
              </UiCluster>
              <UiSeparator />
              <p class="lede">{{ card.copy }}</p>
            </UiStack>
          </article>
        </UiGrid>
        <div class="panel">
          <UiStack gap="sm">
            <p class="lede">A parent can restyle a button with `--ui-button-radius`.</p>
            <UiCluster>
              <UiButton>Default radius</UiButton>
              <div class="radius-sample">
                <UiButton>Overridden radius</UiButton>
              </div>
            </UiCluster>
          </UiStack>
        </div>
      </UiStack>
    </UiContainer>
  </section>
</template>

<style scoped lang="scss">
h3 {
  margin: 0;
  font-size: var(--ui-font-size-lg);
}

.radius-sample {
  --ui-button-radius: 2px;
}
</style>
