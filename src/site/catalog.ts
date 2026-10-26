export interface CatalogGroup {
  readonly id: string
  readonly title: string
  readonly note: string
  readonly names: readonly string[]
}

export const catalog: readonly CatalogGroup[] = [
  {
    id: 'forms',
    title: 'Forms',
    note: 'Fields and the action that commits them.',
    names: [
      'UiAutocomplete',
      'UiButton',
      'UiCheckbox',
      'UiColorPicker',
      'UiDatePicker',
      'UiDateTimePicker',
      'UiField',
      'UiForm',
      'UiInput',
      'UiInputOtp',
      'UiInputTag',
      'UiNumberField',
      'UiRadioGroup',
      'UiRate',
      'UiSearch',
      'UiSegmented',
      'UiSelect',
      'UiSlider',
      'UiSwitch',
      'UiTextarea',
      'UiTimeField',
      'UiUpload',
    ],
  },
  {
    id: 'controls',
    title: 'Controls',
    note: 'Time, navigation, and long documents.',
    names: [
      'UiBackTop',
      'UiCalendar',
      'UiCarousel',
      'UiCollapse',
      'UiCollapseItem',
      'UiCountdown',
      'UiEditor',
      'UiMenu',
      'UiPagination',
      'UiSteps',
      'UiTabs',
      'UiTree',
    ],
  },
  {
    id: 'feedback',
    title: 'Feedback',
    note: 'Status, overlays, and messages that leave the flow.',
    names: [
      'UiAlert',
      'UiBadge',
      'UiBanner',
      'UiChip',
      'UiDialog',
      'UiDrawer',
      'UiEmpty',
      'UiMessage',
      'UiMessageBox',
      'UiNotification',
      'UiPopconfirm',
      'UiPopover',
      'UiProgress',
      'UiResult',
      'UiSpinner',
      'UiStatus',
      'UiTooltip',
      'UiTour',
    ],
  },
  {
    id: 'data',
    title: 'Data',
    note: 'Numbers, rows, and the shape of a record.',
    names: [
      'UiDataTable',
      'UiDescription',
      'UiImage',
      'UiList',
      'UiMeter',
      'UiSpark',
      'UiStat',
      'UiTable',
      'UiTimeline',
    ],
  },
  {
    id: 'layout',
    title: 'Layout',
    note: 'Frames that hold the rest of the page.',
    names: [
      'UiAffix',
      'UiAppShell',
      'UiAspectRatio',
      'UiCard',
      'UiCluster',
      'UiContainer',
      'UiDivider',
      'UiGrid',
      'UiPageHeader',
      'UiScrollArea',
      'UiSeparator',
      'UiSkeleton',
      'UiStack',
      'UiToolbar',
      'UiWatermark',
    ],
  },
  {
    id: 'patterns',
    title: 'Patterns',
    note: 'Type, links, and the small marks around them.',
    names: [
      'UiAnchor',
      'UiAvatar',
      'UiBreadcrumb',
      'UiCloseButton',
      'UiCode',
      'UiCopy',
      'UiKbd',
      'UiLink',
      'UiNav',
      'UiQuote',
      'UiText',
      'UiVisuallyHidden',
    ],
  },
  {
    id: 'instruments',
    title: 'Instruments',
    note: 'Pieces that are not in any other kit.',
    names: [
      'UiBalance',
      'UiBorderBeam',
      'UiChord',
      'UiCompare',
      'UiCycle',
      'UiIndex',
      'UiMark',
      'UiPair',
      'UiQrCode',
      'UiScan',
      'UiStamp',
      'UiWhisper',
    ],
  },
  {
    id: 'desk',
    title: 'Desk',
    note: 'A redacted value and a signed line.',
    names: ['UiRedact', 'UiWitness'],
  },
  {
    id: 'score',
    title: 'Score',
    note: 'The compiler that restyles one region.',
    names: ['UiConfigProvider'],
  },
]

export const componentCount = catalog.reduce((sum, group) => sum + group.names.length, 0)

const titles: Readonly<Record<string, string>> = {
  UiInputOtp: 'Input OTP',
  UiQrCode: 'QR Code',
}

export function componentSlug(name: string): string {
  const body = name.startsWith('Ui') ? name.slice(2) : name
  return body.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

export function componentTitle(name: string): string {
  return titles[name] ?? name.replace(/^Ui/, '').replace(/([a-z0-9])([A-Z])/g, '$1 $2')
}

export function componentHref(name: string): string {
  return `#/component/${componentSlug(name)}`
}

export function groupHref(id: string): string {
  return `#/component/${id}`
}

export function findComponent(name: string): { group: CatalogGroup } | undefined {
  const group = catalog.find((item) => item.names.includes(name))
  return group === undefined ? undefined : { group }
}

export function componentBySlug(slug: string): string | undefined {
  for (const group of catalog) {
    for (const name of group.names) {
      if (componentSlug(name) === slug) return name
    }
  }
  return undefined
}

export function groupById(id: string): CatalogGroup | undefined {
  return catalog.find((group) => group.id === id)
}
