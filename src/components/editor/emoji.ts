export type EditorEmojiGroupId = 'status' | 'faces' | 'nature' | 'objects' | 'symbols'

export interface EditorEmoji {
  readonly glyph: string
  readonly name: string
}

export interface EditorEmojiGroup {
  readonly id: EditorEmojiGroupId
  readonly items: readonly EditorEmoji[]
}

export const editorEmojiGroups: readonly EditorEmojiGroup[] = [
  {
    id: 'status',
    items: [
      { glyph: '✅', name: 'done' },
      { glyph: '❌', name: 'no' },
      { glyph: '⚠️', name: 'warning' },
      { glyph: '⭐', name: 'star' },
      { glyph: '🔥', name: 'fire' },
      { glyph: '💡', name: 'idea' },
      { glyph: '📌', name: 'pin' },
      { glyph: '🎯', name: 'target' },
      { glyph: '🏁', name: 'finish' },
      { glyph: '🔔', name: 'bell' },
      { glyph: '🚀', name: 'launch' },
      { glyph: '💯', name: 'hundred' },
    ],
  },
  {
    id: 'faces',
    items: [
      { glyph: '😀', name: 'grin' },
      { glyph: '😁', name: 'smile' },
      { glyph: '😂', name: 'laugh' },
      { glyph: '🙂', name: 'calm' },
      { glyph: '😉', name: 'wink' },
      { glyph: '😍', name: 'love' },
      { glyph: '🤔', name: 'think' },
      { glyph: '😎', name: 'cool' },
      { glyph: '😮', name: 'surprise' },
      { glyph: '😴', name: 'sleep' },
      { glyph: '🙏', name: 'thanks' },
      { glyph: '👏', name: 'clap' },
      { glyph: '👍', name: 'yes' },
      { glyph: '👎', name: 'down' },
      { glyph: '👋', name: 'wave' },
      { glyph: '💪', name: 'strong' },
    ],
  },
  {
    id: 'nature',
    items: [
      { glyph: '🌙', name: 'moon' },
      { glyph: '☀️', name: 'sun' },
      { glyph: '🌧️', name: 'rain' },
      { glyph: '❄️', name: 'snow' },
      { glyph: '🌊', name: 'wave' },
      { glyph: '🌿', name: 'leaf' },
      { glyph: '🌸', name: 'flower' },
      { glyph: '🍀', name: 'clover' },
      { glyph: '🌈', name: 'rainbow' },
      { glyph: '⚡', name: 'bolt' },
    ],
  },
  {
    id: 'objects',
    items: [
      { glyph: '📝', name: 'note' },
      { glyph: '📎', name: 'clip' },
      { glyph: '📁', name: 'folder' },
      { glyph: '📷', name: 'camera' },
      { glyph: '🖼️', name: 'picture' },
      { glyph: '🔒', name: 'lock' },
      { glyph: '🔑', name: 'key' },
      { glyph: '✉️', name: 'mail' },
      { glyph: '📦', name: 'box' },
      { glyph: '🕒', name: 'time' },
      { glyph: '📅', name: 'calendar' },
      { glyph: '⚓', name: 'anchor' },
      { glyph: '🚢', name: 'ship' },
      { glyph: '🛠️', name: 'tools' },
    ],
  },
  {
    id: 'symbols',
    items: [
      { glyph: '➕', name: 'plus' },
      { glyph: '➖', name: 'minus' },
      { glyph: '✔️', name: 'check' },
      { glyph: '❗', name: 'alert' },
      { glyph: '❓', name: 'question' },
      { glyph: '💬', name: 'comment' },
      { glyph: '🔗', name: 'link' },
      { glyph: '➡️', name: 'right' },
      { glyph: '⬅️', name: 'left' },
      { glyph: '⬆️', name: 'up' },
      { glyph: '⬇️', name: 'down' },
      { glyph: '♻️', name: 'recycle' },
    ],
  },
]
