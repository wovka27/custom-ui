import { readdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const DIST_DIR = fileURLToPath(new URL('../dist/', import.meta.url))

async function processDirectory(directory) {
  const entries = await readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const filePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      await processDirectory(filePath)
      continue
    }

    if (!entry.isFile() || !entry.name.endsWith('.d.ts')) {
      continue
    }

    const source = await readFile(filePath, 'utf8')

    const pattern =
      /declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;\s*declare const _default: typeof __VLS_export;\s*export default _default;/

    if (!pattern.test(source)) {
      continue
    }

    const result = source.replace(pattern, 'export default __VLS_base;')

    await writeFile(filePath, result, 'utf8')

    console.warn(`Fixed Vue declaration: ${filePath}`)
  }
}

await processDirectory(DIST_DIR)

async function findUnfixedDeclarations(directory) {
  const entries = await readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const filePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      await findUnfixedDeclarations(filePath)
      continue
    }

    if (!entry.isFile() || !entry.name.endsWith('.d.ts')) {
      continue
    }

    const source = await readFile(filePath, 'utf8')

    if (/__VLS_WithSlots<typeof __VLS_base, __VLS_Slots>/.test(source)) {
      console.warn(`Unfixed Vue declaration: ${filePath}`)
    }
  }
}

await findUnfixedDeclarations(DIST_DIR)
