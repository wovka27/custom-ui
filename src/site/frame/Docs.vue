<script setup lang="ts">
import { ref } from 'vue'
import { UiButton } from '@/index'
import { catalog, componentHref, componentTitle, groupHref } from '../catalog'
import { guidePages } from '../route'

const { mode, current } = defineProps<{
  mode: 'guide' | 'component' | 'resource'
  current?: string
}>()

const open = ref(false)

const guideGroups = ['Start', 'Customization'] as const
const resources = [{ id: 'project', href: '#/resource', label: 'Project' }]
</script>

<template>
  <div class="docs site-measure">
    <div class="side-bar">
      <ui-button class="menu" size="sm" variant="secondary" @click="open = !open">
        {{ open ? 'Hide menu' : 'Menu' }}
      </ui-button>
      <nav
        class="side"
        :data-open="open || undefined"
        :aria-label="mode === 'guide' ? 'Guide' : 'Components'"
      >
        <template v-if="mode === 'guide'">
          <section v-for="group in guideGroups" :key="group">
            <h2>{{ group }}</h2>
            <a
              v-for="page in guidePages.filter((item) => item.group === group)"
              :key="page.id"
              :href="`#/guide/${page.id}`"
              :aria-current="current === page.id ? 'page' : undefined"
              @click="open = false"
            >
              {{ page.title }}
            </a>
          </section>
        </template>
        <template v-else-if="mode === 'component'">
          <a
            href="#/component"
            :aria-current="current === undefined ? 'page' : undefined"
            @click="open = false"
          >
            Overview
          </a>
          <section v-for="group in catalog" :key="group.id">
            <h2>
              <a :href="groupHref(group.id)" @click="open = false">{{ group.title }}</a>
            </h2>
            <a
              v-for="name in group.names"
              :key="name"
              :href="componentHref(name)"
              :aria-current="current === name ? 'page' : undefined"
              @click="open = false"
            >
              {{ componentTitle(name) }}
            </a>
          </section>
        </template>
        <template v-else>
          <section>
            <h2>Resource</h2>
            <a v-for="item in resources" :key="item.id" :href="item.href" aria-current="page">
              {{ item.label }}
            </a>
          </section>
        </template>
      </nav>
    </div>
    <div id="content" class="article" tabindex="-1">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.docs {
  display: grid;
  grid-template-columns: var(--ui-sidebar-width) minmax(0, 1fr);
  align-items: start;
}

.side-bar {
  position: sticky;
  top: 3.5rem;
  max-height: calc(100vh - 3.5rem);
  overflow: auto;
  border-right: 1px solid var(--ui-color-border);
}

.menu {
  display: none;
  margin: var(--ui-space-3);
}

.side {
  padding: var(--ui-space-4) var(--ui-space-3) var(--ui-space-6);
}

.side h2 {
  margin: var(--ui-space-4) 0 var(--ui-space-1);
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
  font-weight: 560;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.side h2 a {
  color: inherit;
  font-size: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
}

.side > a,
.side section > a {
  display: block;
  padding: var(--ui-space-1) var(--ui-space-2);
  border-radius: var(--ui-radius-sm);
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-sm);
  text-decoration: none;
}

.side a:hover {
  background: var(--ui-color-subtle);
}

.side a[aria-current='page'] {
  background: transparent;
  box-shadow: inset 2px 0 0 var(--ui-color-accent);
  color: var(--ui-color-fg);
  font-weight: 600;
}

.side a[aria-current='page']:hover {
  background: var(--ui-color-subtle);
}

.article {
  min-width: 0;
  padding: var(--ui-space-6) var(--ui-space-6) var(--ui-space-7);
}

.article:focus {
  outline: none;
}

.side a:focus-visible {
  outline: 2px solid var(--ui-color-focus);
  outline-offset: 2px;
}

@media (max-width: 900px) {
  .docs {
    grid-template-columns: 1fr;
  }

  .side-bar {
    position: static;
    max-height: none;
    border-right: 0;
    border-bottom: 1px solid var(--ui-color-border);
  }

  .menu {
    display: inline-flex;
  }

  .side {
    display: none;
  }

  .side[data-open] {
    display: block;
  }
}
</style>
