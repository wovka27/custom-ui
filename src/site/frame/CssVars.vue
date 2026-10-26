<script setup lang="ts">
import type { CssVariable } from '../reference'

const { rows } = defineProps<{
  rows: readonly CssVariable[]
}>()
</script>

<template>
  <div class="wrap">
    <table>
      <thead>
        <tr>
          <th scope="col">Variable</th>
          <th scope="col">Property</th>
          <th scope="col">Default or fallback</th>
          <th scope="col">What it paints</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.name">
          <th class="name" scope="row">{{ row.name }}</th>
          <td class="property">{{ row.property }}</td>
          <td class="value">{{ row.value }}</td>
          <td>{{ row.affects }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.wrap {
  overflow-x: auto;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-lg);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--ui-font-size-sm);
}

th,
td {
  padding: var(--ui-space-2) var(--ui-space-3);
  border-bottom: 1px solid var(--ui-color-border);
  text-align: left;
  vertical-align: top;
  line-height: 1.5;
}

tr:last-child td,
tr:last-child th {
  border-bottom: 0;
}

thead th {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
  font-weight: 560;
}

.name,
.property,
.value {
  font-family: var(--ui-font-mono);
  font-size: var(--ui-font-size-xs);
}

.name {
  white-space: nowrap;
}

.value {
  overflow-wrap: anywhere;
  color: var(--ui-color-muted);
}
</style>
