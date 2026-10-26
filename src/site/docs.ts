export interface ComponentDoc {
  readonly summary: string
  readonly usage: string
}

export const componentDocs: Readonly<Record<string, ComponentDoc>> = {
  UiAutocomplete: {
    summary: 'Finds a value from a list as you type.',
    usage: '<ui-autocomplete v-model="client" label="Client" :options="clients" />',
  },
  UiButton: {
    summary: 'Starts an action. At rest it is a hairline outline. Hover is an accent wash.',
    usage: '<ui-button>Save</ui-button>',
  },
  UiCheckbox: {
    summary: 'A boolean choice, including an indeterminate state.',
    usage: '<ui-checkbox v-model="agreed" label="I agree" />',
  },
  UiColorPicker: {
    summary: 'Edits a color in a panel, inline, or as swatches.',
    usage: '<ui-color-picker v-model="color" />',
  },
  UiDatePicker: {
    summary: 'Picks one day, or a start and an end.',
    usage: '<ui-date-picker v-model="day" />',
  },
  UiDateTimePicker: {
    summary: 'Adds a time to one day, or to a range.',
    usage: '<ui-date-time-picker v-model="slot" />',
  },
  UiField: {
    summary: 'Connects a label, hint, and error to a control. The error reveals by height.',
    usage: '<ui-field label="Name" hint="As it should be filed"><ui-input /></ui-field>',
  },
  UiForm: {
    summary: 'Renders a schema of fields, groups, queries, and a table.',
    usage: '<ui-form :schema="profile" label="Profile" submit-label="Save" @submit="onSubmit" />',
  },
  UiInput: {
    summary: 'A text field with formats, a clear button, and a password reveal.',
    usage: '<ui-input v-model="name" label="Name" placeholder="Ada" />',
  },
  UiInputOtp: {
    summary: 'A fixed row of cells that accepts a paste.',
    usage: '<ui-input-otp label="Code" />',
  },
  UiInputTag: {
    summary: 'Commits a tag on Enter or a separator.',
    usage: '<ui-input-tag v-model="names" placeholder="Name" />',
  },
  UiNumberField: {
    summary: 'Steps a number between a minimum and a maximum.',
    usage: '<ui-number-field v-model="quantity" label="Quantity" :min="0" :max="12" />',
  },
  UiRadioGroup: {
    summary: 'One choice from a list of options.',
    usage: '<ui-radio-group v-model="watch" legend="Watch" :options="watches" />',
  },
  UiRate: {
    summary: 'A score made of symbols.',
    usage: '<ui-rate v-model="score" label="Satisfaction" />',
  },
  UiSearch: {
    summary: 'A search region. The field inside stays a real input.',
    usage: '<ui-search label="Clients"><ui-input type="search" placeholder="Client" /></ui-search>',
  },
  UiSegmented: {
    summary: 'A single choice drawn as a segment.',
    usage: '<ui-segmented v-model="view" label="View" :options="views" />',
  },
  UiSelect: {
    summary: 'A listbox opened from a button. all-option can mean every value, including null.',
    usage: '<ui-select v-model="status" :options="statuses" all-option name="status" />',
  },
  UiSlider: {
    summary: 'One value, or two thumbs that can pass through each other.',
    usage: '<ui-slider v-model="volume" label="Volume" />',
  },
  UiSwitch: {
    summary: 'On and off. The thumb follows the state.',
    usage: '<ui-switch v-model="open" label="Open" />',
  },
  UiTextarea: {
    summary: 'A multiline field.',
    usage: '<ui-textarea v-model="note" label="Note" />',
  },
  UiTimeField: {
    summary: 'A time of day.',
    usage: '<ui-time-field v-model="when" label="Call time" />',
  },
  UiUpload: {
    summary: 'Drop, button, picture, or gallery. An image is shown as soon as it is chosen.',
    usage: '<ui-upload variant="picture" label="Portrait" accept="image/*" />',
  },
  UiBackTop: {
    summary: 'Returns to the top of the page after you have scrolled.',
    usage: '<ui-back-top />',
  },
  UiCalendar: {
    summary: 'Month, week, day, and agenda. Events are added and edited in a dialog form.',
    usage: '<ui-calendar v-model="day" :events="events" />',
  },
  UiCarousel: {
    summary: 'Slides with arrows and pagination along the bottom.',
    usage: '<ui-carousel label="Slides"><article>One</article><article>Two</article></ui-carousel>',
  },
  UiCollapse: {
    summary: 'A disclosure of one item, or several when multiple is set.',
    usage: '<ui-collapse :default-value="[\'one\']"><ui-collapse-item name="one" title="Schedule">Opens at nine.</ui-collapse-item></ui-collapse>',
  },
  UiCollapseItem: {
    summary: 'One row inside a collapse. The name is the value the parent stores.',
    usage: '<ui-collapse-item name="one" title="Schedule">Opens at nine.</ui-collapse-item>',
  },
  UiCountdown: {
    summary: 'Counts down to a moment.',
    usage: '<ui-countdown :ends-at="endsAt" label="Filing window" />',
  },
  UiEditor: {
    summary: 'A document of blocks, marks, emoji, images, and lists.',
    usage: '<ui-editor v-model="document" label="Note" />',
  },
  UiMenu: {
    summary: 'A list of actions opened from a button.',
    usage: '<ui-menu :items="items" label="More" @select="onSelect" />',
  },
  UiPagination: {
    summary: 'Pages as squares, with a select for how many rows to show.',
    usage: '<ui-pagination v-model:page="page" :page-count="8" />',
  },
  UiSteps: {
    summary: 'A sequence of titled stages.',
    usage: '<ui-steps :items="steps" :current="1" />',
  },
  UiTabs: {
    summary: 'Panels switched by a tab list. Each panel is a slot named after the tab id.',
    usage: '<ui-tabs v-model="tab" label="Notes" :tabs="tabs"><template #one>First</template></ui-tabs>',
  },
  UiTree: {
    summary: 'A nested list with a selected node.',
    usage: '<ui-tree v-model="selected" :nodes="nodes" label="Desk" />',
  },
  UiAlert: {
    summary: 'A title and a description, with an optional close button.',
    usage: '<ui-alert title="Filed" description="The brief is on the desk." tone="success" />',
  },
  UiBadge: {
    summary: 'A short status word, colored by tone.',
    usage: '<ui-badge tone="success">Filed</ui-badge>',
  },
  UiBanner: {
    summary: 'A page-wide notice that can be dismissed.',
    usage: '<ui-banner title="Night watch" description="Three berths are open." dismissible />',
  },
  UiChip: {
    summary: 'A compact choice that can be selected or removed.',
    usage: '<ui-chip label="This week" default-selected />',
  },
  UiDialog: {
    summary: 'A native dialog teleported to the body. Several dialogs close from the top down.',
    usage: '<ui-dialog v-model:open="open" title="Contract">Terms</ui-dialog>',
  },
  UiDrawer: {
    summary: 'A panel that enters from the side.',
    usage: '<ui-drawer v-model:open="open" title="Filters">Narrow the desk.</ui-drawer>',
  },
  UiEmpty: {
    summary: 'An empty state, plain, framed, or dashed.',
    usage: '<ui-empty variant="panel" title="Nothing filed" description="The desk is clear." />',
  },
  UiMessage: {
    summary: 'A short confirmation. Mount the host once, then call showMessage.',
    usage: "showMessage({ title: 'Saved', tone: 'success' })",
  },
  UiMessageBox: {
    summary: 'A question in a dialog: confirm, alert, or prompt. Mount the host once.',
    usage: "const yes = await confirmBox({ title: 'Discard the draft?' })",
  },
  UiNotification: {
    summary: 'A note that enters from the right and stacks downward. Mount the host once.',
    usage: "showNotification({ title: 'Build finished', tone: 'info' })",
  },
  UiPopconfirm: {
    summary: 'Asks for confirmation beside the trigger.',
    usage: '<ui-popconfirm title="Discard?" @confirm="discard"><template #trigger="{ toggle }"><ui-button @click="toggle">Discard</ui-button></template></ui-popconfirm>',
  },
  UiPopover: {
    summary: 'A note anchored to its trigger.',
    usage: '<ui-popover><template #trigger="{ open }"><ui-button :aria-expanded="open">Note</ui-button></template>Beside the trigger.</ui-popover>',
  },
  UiProgress: {
    summary: 'A line, bar, circle, or steps meter.',
    usage: '<ui-progress variant="line" :value="64" label="Upload" />',
  },
  UiResult: {
    summary: 'The outcome of a task, with a title and an optional action.',
    usage: '<ui-result title="Filed" description="The brief left the desk." tone="success" />',
  },
  UiSpinner: {
    summary: 'Announces that work is in progress, unless it is decorative.',
    usage: '<ui-spinner label="Syncing" />',
  },
  UiStatus: {
    summary: 'A live state, with an optional pulse.',
    usage: '<ui-status label="Live" tone="success" pulse />',
  },
  UiTooltip: {
    summary: 'A short hint anchored to its trigger.',
    usage: '<ui-tooltip content="Shown beside the trigger"><ui-button>Hint</ui-button></ui-tooltip>',
  },
  UiTour: {
    summary: 'Walks through steps pointed at elements on the page.',
    usage: '<ui-tour v-model="open" :steps="steps" />',
  },
  UiDataTable: {
    summary: 'A table rendered from a defineTable schema, including page size and an empty state.',
    usage: '<ui-data-table :schema="table" :rows="rows" />',
  },
  UiDescription: {
    summary: 'Term and detail pairs.',
    usage: '<ui-description :items="facts" label="Invoice" />',
  },
  UiImage: {
    summary: 'A picture with loading, error, ratio, and an optional preview.',
    usage: '<ui-image :src="src" alt="Harbor" ratio="16 / 9" />',
  },
  UiList: {
    summary: 'A list of strings, or a custom item slot.',
    usage: '<ui-list :items="[\'Draft\', \'Review\', \'File\']" />',
  },
  UiMeter: {
    summary: 'A labeled measure against a maximum.',
    usage: '<ui-meter label="Capacity" :value="64" />',
  },
  UiSpark: {
    summary: 'A series drawn as a single line.',
    usage: '<ui-spark label="Invoices" :values="[2, 4, 3, 8, 6, 9]" />',
  },
  UiStat: {
    summary: 'One number, with a label and an optional hint.',
    usage: '<ui-stat label="Open" value="18" hint="+3 this week" tone="success" />',
  },
  UiTable: {
    summary: 'Rows and columns, with sort, selection, an empty slot, and room for a form in a cell.',
    usage: '<ui-table :columns="columns" :rows="rows" :row-key="rowKey" caption="Invoices" />',
  },
  UiTimeline: {
    summary: 'Events in order.',
    usage: '<ui-timeline :items="day" label="Desk day" />',
  },
  UiAffix: {
    summary: 'Pins its content once the page scrolls past it.',
    usage: '<ui-affix :offset="72"><ui-button>Pinned</ui-button></ui-affix>',
  },
  UiAppShell: {
    summary: 'Header, sidebar, and content, with a navigation toggle.',
    usage: '<ui-app-shell sidebar-label="Desk" content-label="Work"><p>Content</p></ui-app-shell>',
  },
  UiAspectRatio: {
    summary: 'Holds its slot to a ratio.',
    usage: '<ui-aspect-ratio ratio="16 / 9">Harbor</ui-aspect-ratio>',
  },
  UiCard: {
    summary: 'A title, a description, and a body.',
    usage: '<ui-card title="North dock" description="Three berths are open tonight." />',
  },
  UiCluster: {
    summary: 'A row that wraps.',
    usage: '<ui-cluster gap="sm"><ui-button>Save</ui-button><ui-button variant="secondary">Cancel</ui-button></ui-cluster>',
  },
  UiContainer: {
    summary: 'Limits the width of a section.',
    usage: '<ui-container>The brief stays in the measure.</ui-container>',
  },
  UiDivider: {
    summary: 'A rule, with an optional label.',
    usage: '<ui-divider>Or continue</ui-divider>',
  },
  UiGrid: {
    summary: 'Columns that wrap from a minimum size.',
    usage: '<ui-grid min-column="12rem"><p>One</p><p>Two</p></ui-grid>',
  },
  UiPageHeader: {
    summary: 'The title of a view, with a description and actions.',
    usage: '<ui-page-header title="Desk" description="Tonight\'s watch." />',
  },
  UiScrollArea: {
    summary: 'A named region that scrolls inside a maximum height.',
    usage: '<ui-scroll-area label="Notes" max-height="8rem">A long note.</ui-scroll-area>',
  },
  UiSeparator: {
    summary: 'A hairline between sections.',
    usage: '<ui-separator />',
  },
  UiSkeleton: {
    summary: 'A placeholder while content is loading.',
    usage: '<ui-skeleton :lines="3" />',
  },
  UiStack: {
    summary: 'A vertical stack.',
    usage: '<ui-stack gap="md"><p>First</p><p>Second</p></ui-stack>',
  },
  UiToolbar: {
    summary: 'A row of tools, with an optional end slot.',
    usage: '<ui-toolbar label="Tools"><ui-button size="sm">Edit</ui-button></ui-toolbar>',
  },
  UiWatermark: {
    summary: 'Repeats a word behind its content.',
    usage: '<ui-watermark text="Draft">The brief is not filed.</ui-watermark>',
  },
  UiAnchor: {
    summary: 'Links to element ids and marks the section in view.',
    usage: '<ui-anchor :items="items" label="On this page" />',
  },
  UiAvatar: {
    summary: 'A person, from a name or an image.',
    usage: '<ui-avatar name="Ada Lovelace" />',
  },
  UiBreadcrumb: {
    summary: 'The path to the current page.',
    usage: '<ui-breadcrumb :items="items" />',
  },
  UiCloseButton: {
    summary: 'A close control with an accessible name.',
    usage: '<ui-close-button label="Close" @click="close" />',
  },
  UiCode: {
    summary: 'Inline or block code.',
    usage: '<ui-code block code="npm i @wovka-dev/custom-ui" />',
  },
  UiCopy: {
    summary: 'Copies a value.',
    usage: '<ui-copy value="INV-1042" label="Copy reference">Copy</ui-copy>',
  },
  UiKbd: {
    summary: 'A keyboard key.',
    usage: '<ui-kbd>Ctrl</ui-kbd>',
  },
  UiLink: {
    summary: 'A text link.',
    usage: '<ui-link href="#/guide/installation">Installation</ui-link>',
  },
  UiNav: {
    summary: 'A list of links, with the current page marked.',
    usage: '<ui-nav label="Site" :items="items" />',
  },
  UiQuote: {
    summary: 'A quotation with a citation.',
    usage: '<ui-quote cite="North dock">Three berths are open tonight.</ui-quote>',
  },
  UiText: {
    summary: 'A paragraph or span with a size and a tone.',
    usage: '<ui-text tone="muted" size="sm">A quiet line.</ui-text>',
  },
  UiVisuallyHidden: {
    summary: 'Keeps text in the accessibility tree and removes it from the screen.',
    usage: '<ui-button icon-only label="Close"><ui-visually-hidden>Close</ui-visually-hidden>×</ui-button>',
  },
  UiBalance: {
    summary: 'Splits one bar between two amounts.',
    usage: '<ui-balance :start="18" :end="6" start-label="Open" end-label="Closed" />',
  },
  UiBorderBeam: {
    summary: 'A light that follows the rim, shortens at random, and can glow.',
    usage: '<ui-border-beam mirror glow>The brief stays inside.</ui-border-beam>',
  },
  UiChord: {
    summary: 'Tunes a score. Hue, ground, shape, density, motion, elevation, and voice.',
    usage: '<ui-chord v-model="score" label="Chord"><ui-button>Save</ui-button></ui-chord>',
  },
  UiCompare: {
    summary: 'Reveals one layer over another.',
    usage: '<ui-compare label="Draft against filed"><template #before>Draft</template><template #after>Filed</template></ui-compare>',
  },
  UiCycle: {
    summary: 'Steps through named states.',
    usage: '<ui-cycle v-model="phase" :states="states" label="Filing state" />',
  },
  UiIndex: {
    summary: 'Jumps a list by its first letter.',
    usage: '<ui-index :items="people" label="People" />',
  },
  UiMark: {
    summary: 'Highlights a phrase.',
    usage: 'The berth is <ui-mark>open tonight</ui-mark>.',
  },
  UiPair: {
    summary: 'Keeps two ends ordered and can swap them.',
    usage: '<ui-pair v-model="range" label="Berth range" :min="0" :max="12" />',
  },
  UiQrCode: {
    summary: 'Encodes text as a symbol. Shape, level, and tone change the drawing.',
    usage: '<ui-qr-code value="berth:desk/18" label="Berth desk" />',
  },
  UiScan: {
    summary: 'Reads across a frame.',
    usage: '<ui-scan active label="Reading the brief">North dock, filed at dusk.</ui-scan>',
  },
  UiStamp: {
    summary: 'Seals a document.',
    usage: '<ui-stamp text="Filed" tone="success" />',
  },
  UiWhisper: {
    summary: 'Opens a note under a word.',
    usage: '<ui-whisper note="A berth is one mooring on the dock.">berth</ui-whisper>',
  },
  UiRedact: {
    summary: 'Hides a value until it is asked for.',
    usage: '<ui-redact label="Account" value="GB29 NWBK 6016 1331 9268 19" />',
  },
  UiWitness: {
    summary: 'Records who signed a statement, and when.',
    usage: '<ui-witness v-model="mark" statement="The brief reached the desk." />',
  },
  UiConfigProvider: {
    summary: 'Sets the theme, the language, and an optional score for everything inside it.',
    usage: '<ui-config-provider theme="system" :score="score"><app /></ui-config-provider>',
  },
}

export function docFor(name: string): ComponentDoc {
  return (
    componentDocs[name] ?? {
      summary: 'A component in the kit.',
      usage: `<${name} />`,
    }
  )
}
