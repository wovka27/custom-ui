<script setup lang="ts">
const repo = 'https://github.com/wovka27/custom-ui'
const columns = [
  {
    title: 'Project',
    links: [
      { href: repo, label: 'GitHub', external: true },
      { href: 'https://www.npmjs.com/package/@wovka-dev/custom-ui', label: 'npm', external: true },
    ],
  },
  {
    title: 'Learn',
    links: [
      { href: '#/guide/installation', label: 'Installation' },
      { href: '#/guide/theming', label: 'Theming' },
      { href: '#/component', label: 'Components' },
    ],
  },
  {
    title: 'Design',
    links: [
      { href: '#/guide/tokens', label: 'Tokens' },
      { href: '#/component/config-provider', label: 'Config provider' },
      { href: '#/component/chord', label: 'Chord' },
    ],
  },
]
</script>

<template>
  <article>
    <h1>Resources</h1>
    <p>The kit is MIT licensed. Vue 3.5 is the peer. Storybook remains the prop catalog.</p>
    <div class="cols">
      <section v-for="column in columns" :key="column.title">
        <h2>{{ column.title }}</h2>
        <ul>
          <li v-for="link in column.links" :key="link.href">
            <a
              :href="link.href"
              :target="'external' in link ? '_blank' : undefined"
              :rel="'external' in link ? 'noreferrer' : undefined"
            >
              {{ link.label }}
            </a>
          </li>
        </ul>
      </section>
    </div>
  </article>
</template>

<style scoped lang="scss">
h1 {
  margin: 0 0 var(--ui-space-3);
  font-family: var(--ui-font-display);
  font-size: var(--ui-font-size-2xl);
}

p {
  margin: 0 0 var(--ui-space-6);
  color: var(--ui-color-muted);
}

.cols {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--ui-space-5);
}

h2 {
  margin: 0 0 var(--ui-space-3);
  padding-bottom: var(--ui-space-2);
  border-bottom: 1px solid var(--ui-color-border);
  font-size: var(--ui-font-size-sm);
  font-weight: 560;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ui-color-muted);
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
  display: inline-flex;
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-sm);
  text-decoration: none;
}

a:hover {
  color: var(--ui-color-accent);
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
