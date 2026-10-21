import { describe, expect, it, beforeEach } from 'vitest'
import {
  activateDialog,
  cancelDialogClose,
  requestDialogClose,
  resetDialogStack,
} from './dialog-stack'

function deferred(): { promise: Promise<boolean>; resolve: (value: boolean) => void } {
  let resolve: (value: boolean) => void = () => {}
  const promise = new Promise<boolean>((settle) => {
    resolve = settle
  })
  return { promise, resolve }
}

async function flush(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

describe('dialog stack', () => {
  beforeEach(() => {
    resetDialogStack()
  })

  it('closes the top dialog before a lower one that was requested first', async () => {
    activateDialog('contract')
    activateDialog('witness')
    const order: string[] = []
    const witnessGate = deferred()
    const contractGate = deferred()

    const contract = requestDialogClose('contract', () => {
      order.push('contract')
      return contractGate.promise
    })
    await flush()
    const witness = requestDialogClose('witness', () => {
      order.push('witness')
      return witnessGate.promise
    })

    expect(order).toEqual(['witness'])
    witnessGate.resolve(true)
    await witness
    await flush()
    expect(order).toEqual(['witness', 'contract'])
    contractGate.resolve(true)
    await expect(contract).resolves.toBe(true)
  })

  it('keeps a lower dialog waiting when the top close is refused', async () => {
    activateDialog('contract')
    activateDialog('witness')
    const order: string[] = []

    const witness = requestDialogClose('witness', () => false)
    const contract = requestDialogClose('contract', () => {
      order.push('contract')
      return true
    })

    await expect(witness).resolves.toBe(false)
    await flush()
    expect(order).toEqual([])

    const retry = requestDialogClose('witness', () => true)
    await expect(retry).resolves.toBe(true)
    await expect(contract).resolves.toBe(true)
    expect(order).toEqual(['contract'])
  })

  it('treats a thrown guard as a refused close', async () => {
    activateDialog('notice')
    await expect(
      requestDialogClose('notice', () => {
        throw new Error('save failed')
      }),
    ).resolves.toBe(false)
  })

  it('cancels an in-flight close and allows a later one', async () => {
    activateDialog('notice')
    const gate = deferred()
    const pending = requestDialogClose('notice', () => gate.promise)
    cancelDialogClose('notice')
    await expect(pending).resolves.toBe(false)
    gate.resolve(true)
    await flush()
    await expect(requestDialogClose('notice', () => true)).resolves.toBe(true)
  })

  it('closes immediately when the dialog was never opened', async () => {
    await expect(requestDialogClose('missing', () => false)).resolves.toBe(true)
  })
})
