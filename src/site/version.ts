import { onMounted, onScopeDispose, ref, type Ref } from 'vue'
import { version as packaged } from '../../package.json'

const releaseVersion = /^[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/
const registry = 'https://registry.npmjs.org/@wovka-dev/custom-ui/latest'

export function readPublishedVersion(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null || !('version' in body)) return undefined
  const next = body.version
  if (typeof next !== 'string' || !releaseVersion.test(next)) return undefined
  return next
}

export async function publishedVersion(signal: AbortSignal): Promise<string | undefined> {
  try {
    const response = await fetch(registry, {
      signal,
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) return undefined
    return readPublishedVersion(await response.json())
  } catch {
    return undefined
  }
}

export function usePackageVersion(): Ref<string> {
  const version = ref(packaged)
  const controller = new AbortController()

  onMounted(() => {
    void publishedVersion(controller.signal).then((next) => {
      if (next !== undefined) version.value = next
    })
  })

  onScopeDispose(() => controller.abort())
  return version
}
