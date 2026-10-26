import preview from '@sb/preview'
import { UiUpload } from '@/components/upload'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Controls/Upload',
  component: UiUpload,
  args: { label: 'Drop files' },
})

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
      <showcase-board>
        <showcase-case title="Drop zone">
          <ui-upload label="Drop files" accept="image/*" />
        </showcase-case>
        <showcase-case title="Button">
          <ui-upload variant="button" label="Choose a file" />
        </showcase-case>
        <showcase-case title="Picture">
          <ui-upload variant="picture" label="Add a picture" accept="image/*" />
        </showcase-case>
        <showcase-case title="Portrait">
          <ui-upload variant="picture" shape="circle" label="Portrait" accept="image/*" />
        </showcase-case>
        <showcase-case title="Gallery">
          <ui-upload variant="gallery" label="Add" accept="image/*" />
        </showcase-case>
        <showcase-case title="Waiting on the request">
          <ui-upload label="Upload to the desk" accept="image/*" :request="request" />
        </showcase-case>
      </showcase-board>
    `,
  })),
)
