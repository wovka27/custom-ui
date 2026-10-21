import preview from '@sb/preview'
import { UiUpload } from '@/components/upload'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({ title: 'Controls/Upload', component: UiUpload })

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiUpload, ShowcaseBoard, ShowcaseCase },
    setup: () => ({
      request: ({
        file,
        onProgress,
        signal,
      }: {
        file: File
        onProgress: (loaded: number, total: number) => void
        signal: AbortSignal
      }) =>
        new Promise<void>((resolve, reject) => {
          let loaded = 0
          const timer = window.setInterval(() => {
            if (signal.aborted) {
              window.clearInterval(timer)
              reject(new Error('Cancelled'))
              return
            }
            loaded += file.size / 5
            onProgress(Math.min(file.size, loaded), file.size)
            if (loaded >= file.size) {
              window.clearInterval(timer)
              resolve()
            }
          }, 180)
        }),
    }),
    template: `
      <ShowcaseBoard>
        <ShowcaseCase title="Local files"><UiUpload label="Drop files" /></ShowcaseCase>
        <ShowcaseCase title="Waiting on the request">
          <UiUpload label="Upload to the desk" :request="request" />
        </ShowcaseCase>
      </ShowcaseBoard>
    `,
  })),
)
