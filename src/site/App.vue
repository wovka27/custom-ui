<script setup lang="ts">
import { computed, nextTick, onMounted, onScopeDispose, ref, watch } from 'vue'
import type { DesignScore } from '@/index'
import { UiConfigProvider, UiMessage, UiMessageBox, UiNotification, useTheme } from '@/index'
import { componentBySlug, componentTitle } from './catalog'
import SiteFooter from './frame/SiteFooter.vue'
import SiteHeader from './frame/SiteHeader.vue'
import Docs from './frame/Docs.vue'
import ComponentsPage from './pages/Components.vue'
import GuidePage from './pages/Guide.vue'
import HomePage from './pages/Home.vue'
import ResourcePage from './pages/Resource.vue'
import { documentTitle, parseHash, sectionOf } from './route'

const { theme, setTheme } = useTheme()
const worn = ref<DesignScore | undefined>()
const hash = ref(window.location.hash)
const route = computed(() => parseHash(hash.value))
const section = computed(() => sectionOf(route.value))

function sync(): void {
  hash.value = window.location.hash
}

onMounted(() => {
  window.addEventListener('hashchange', sync)
})

onScopeDispose(() => {
  window.removeEventListener('hashchange', sync)
})

watch(
  route,
  async (next) => {
    const name = next.kind === 'component' ? componentBySlug(next.slug) : undefined
    document.title = documentTitle(next, name === undefined ? undefined : componentTitle(name))
    await nextTick()
    if (next.kind === 'components' && next.group) return
    window.scrollTo(0, 0)
  },
  { immediate: true },
)
</script>

<template>
  <ui-config-provider :theme="theme" :score="worn">
    <ui-message />
    <ui-notification />
    <ui-message-box />
    <div class="site">
      <site-header :theme="theme" :section="section" @update:theme="setTheme" />
      <home-page v-if="route.kind === 'home'" />
      <docs v-else-if="route.kind === 'guide'" mode="guide" :current="route.page">
        <guide-page :page="route.page" :score="worn" @update:score="worn = $event" />
      </docs>
      <docs
        v-else-if="route.kind === 'components' || route.kind === 'component'"
        mode="component"
        :current="route.kind === 'component' ? componentBySlug(route.slug) : undefined"
      >
        <components-page
          :slug="route.kind === 'component' ? route.slug : undefined"
          :group="route.kind === 'components' ? route.group : undefined"
        />
      </docs>
      <docs v-else mode="resource" current="project">
        <resource-page />
      </docs>
      <site-footer />
    </div>
  </ui-config-provider>
</template>

<style scoped lang="scss">
.site {
  min-height: 100%;
}
</style>
