<script setup lang="ts">
import type { SiteLink } from '../nav'

const {
  toc = [],
  previous,
  next,
} = defineProps<{
  toc?: readonly SiteLink[]
  previous?: SiteLink
  next?: SiteLink
}>()
</script>

<template>
  <div class="frame">
    <div class="sheet" :data-toc="toc.length > 0 || undefined">
      <div class="body">
        <slot />
        <nav v-if="previous || next" class="pager" aria-label="Adjacent pages">
          <a v-if="previous" class="step" :href="previous.href">
            <span>Previous</span>
            {{ previous.label }}
          </a>
          <span v-else />
          <a v-if="next" class="step next" :href="next.href">
            <span>Next</span>
            {{ next.label }}
          </a>
        </nav>
      </div>
      <nav v-if="toc.length > 0" class="toc" aria-label="On this page">
        <p>On this page</p>
        <a v-for="item in toc" :key="item.href" :href="item.href">{{ item.label }}</a>
      </nav>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sheet {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  gap: var(--ui-space-6);
}

.sheet[data-toc] {
  grid-template-columns: minmax(0, 1fr) 11.5rem;
}

.toc {
  position: sticky;
  top: 4.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding-top: 0.2rem;
}

.toc p {
  margin: 0 0 var(--ui-space-2);
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
  font-weight: 560;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.toc a {
  padding: var(--ui-space-1) 0;
  border-left: 1px solid var(--ui-color-border);
  padding-left: var(--ui-space-3);
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
  line-height: 1.4;
  text-decoration: none;
}

.toc a:hover {
  color: var(--ui-color-fg);
}

.pager {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--ui-space-3);
  margin-top: var(--ui-space-7);
  padding-top: var(--ui-space-5);
  border-top: 1px solid var(--ui-color-border);
}

.step {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-height: 4.25rem;
  padding: var(--ui-space-3) var(--ui-space-4);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);
  color: var(--ui-color-fg);
  text-decoration: none;
}

.step span {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
}

.next {
  text-align: end;
  align-items: flex-end;
}

.step:hover {
  border-color: var(--ui-color-border-strong);
  background: var(--ui-color-subtle);
}

.toc a:focus-visible,
.step:focus-visible {
  outline: 2px solid var(--ui-color-focus);
  outline-offset: 3px;
}

@media (max-width: 1100px) {
  .sheet[data-toc] {
    grid-template-columns: minmax(0, 1fr);
  }

  .toc {
    display: none;
  }
}
</style>
