import preview from '@sb/preview'
import TokenCatalog from '@/stories/TokenCatalog.vue'

const meta = preview.meta({
  title: 'Utilities/Tokens',
  component: TokenCatalog,
})

export const Reference = meta.story({
  name: 'Reference',
  render: () => ({
    components: { TokenCatalog },
    template: '<token-catalog />',
  }),
})
