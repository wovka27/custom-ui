<script setup lang="ts">
const { title, note } = defineProps<{
  title: string
  note?: string
}>()

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <section class="sb-case">
    <header>
      <h3>{{ title }}</h3>
      <p v-if="note">{{ note }}</p>
    </header>
    <div class="sb-case__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.sb-case {
  display: grid;
  gap: 0.75rem;
}

.sb-case h3,
.sb-case p {
  margin: 0;
}

.sb-case h3 {
  color: var(--ui-color-muted);
  font-size: 0.75rem;
  font-weight: 560;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sb-case p {
  color: var(--ui-color-muted);
  font-size: 0.8125rem;
}

.sb-case__body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}
</style>
