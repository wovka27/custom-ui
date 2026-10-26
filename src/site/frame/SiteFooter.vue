<script setup lang="ts">
import { version } from '../../../package.json'

const repo = 'https://github.com/wovka27/custom-ui'
const columns = [
  {
    title: 'Guide',
    links: [
      { href: '#/guide/installation', label: 'Installation' },
      { href: '#/guide/quick-start', label: 'Quick start' },
      { href: '#/guide/theming', label: 'Theming' },
      { href: '#/guide/tokens', label: 'Tokens' },
    ],
  },
  {
    title: 'Component',
    links: [
      { href: '#/component', label: 'All components' },
      { href: '#/component/button', label: 'Button' },
      { href: '#/component/form', label: 'Form' },
    ],
  },
  {
    title: 'Project',
    links: [
      { href: repo, label: 'GitHub', external: true },
      { href: 'https://www.npmjs.com/package/@wovka-dev/custom-ui', label: 'npm', external: true },
      { href: '#/resource', label: 'Resources' },
    ],
  },
] as const
</script>

<template>
  <footer class="colophon">
    <div class="site-measure">
      <div class="top">
        <p class="mark">Custom UI</p>
        <p class="lede">A Vue 3.5 interface kit. MIT licensed.</p>
      </div>
      <div class="cols">
        <section v-for="column in columns" :key="column.title">
          <h2>{{ column.title }}</h2>
          <ul>
            <li v-for="link in column.links" :key="link.href">
              <a
                :href="link.href"
                :target="'external' in link && link.external ? '_blank' : undefined"
                :rel="'external' in link && link.external ? 'noreferrer' : undefined"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </section>
      </div>
      <p>Custom UI {{ version }} · MIT License · Vue 3.5</p>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.colophon {
  padding-block: var(--ui-space-7);
  border-top: 1px solid var(--ui-color-border);
}

.top {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--ui-space-3);
  margin-bottom: var(--ui-space-6);
  padding-bottom: var(--ui-space-5);
  border-bottom: 1px solid var(--ui-color-border);
}

.mark {
  margin: 0;
  color: var(--ui-color-fg);
  font-family: var(--ui-font-display);
  font-size: var(--ui-font-size-lg);
  font-weight: 640;
  letter-spacing: -0.03em;
}

.lede {
  margin: 0;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}

.cols {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--ui-space-6);
  margin-bottom: var(--ui-space-6);
}

h2 {
  margin: 0 0 var(--ui-space-3);
  font-size: var(--ui-font-size-sm);
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

li + li {
  margin-top: var(--ui-space-2);
}

a {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
  text-decoration: none;
}

a:hover {
  color: var(--ui-color-fg);
}

p {
  margin: 0;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}

a:focus-visible {
  outline: 2px solid var(--ui-color-focus);
  outline-offset: 3px;
}

@media (max-width: 700px) {
  .cols {
    grid-template-columns: 1fr;
  }
}
</style>
