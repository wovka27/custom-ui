<script setup lang="ts">
import type { ApiRow } from '../reference'

const { rows, defaults = false } = defineProps<{
  rows: readonly ApiRow[]
  defaults?: boolean
}>()
</script>

<template>
  <div class="wrap">
    <table>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Description</th>
          <th scope="col">Type</th>
          <th v-if="defaults" scope="col">Default</th>
          <th v-if="defaults" scope="col">Required</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.name">
          <th class="name" scope="row">{{ row.name }}</th>
          <td>{{ row.description }}</td>
          <td class="type">{{ row.type || '—' }}</td>
          <td v-if="defaults" class="default">{{ row.default || '—' }}</td>
          <td v-if="defaults" :class="row.required ? 'yes' : 'no'">
            {{ row.required ? 'Yes' : 'No' }}
          </td>
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
.type,
.default {
  font-family: var(--ui-font-mono);
  font-size: var(--ui-font-size-xs);
}

.name {
  white-space: nowrap;
}

.type {
  overflow-wrap: anywhere;
  color: var(--ui-color-muted);
}

.no {
  color: var(--ui-color-muted);
}
</style>
