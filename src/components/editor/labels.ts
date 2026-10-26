export interface EditorLabels {
  label: string
  placeholder: string
  blockType: string
  paragraph: string
  heading1: string
  heading2: string
  heading3: string
  quote: string
  code: string
  bullet: string
  number: string
  check: string
  divider: string
  image: string
  emoji: string
  bold: string
  italic: string
  underline: string
  strike: string
  inlineCode: string
  highlight: string
  sub: string
  sup: string
  alignStart: string
  alignCenter: string
  alignEnd: string
  link: string
  clear: string
  undo: string
  redo: string
  moveUp: string
  moveDown: string
  words: string
  linkTitle: string
  linkDescription: string
  linkField: string
  linkSave: string
  linkRemove: string
  linkInvalid: string
  emojiSearch: string
  emojiEmpty: string
  emojiStatus: string
  emojiFaces: string
  emojiNature: string
  emojiObjects: string
  emojiSymbols: string
  imageTitle: string
  imageDescription: string
  imageFile: string
  imageField: string
  imageAlt: string
  imageCaption: string
  imageSave: string
  imageRemove: string
  imageInvalid: string
  imageLarge: string
}

export const defaultEditorLabels: EditorLabels = {
  label: 'Editor',
  placeholder: 'Write something',
  blockType: 'Block',
  paragraph: 'Paragraph',
  heading1: 'Heading 1',
  heading2: 'Heading 2',
  heading3: 'Heading 3',
  quote: 'Quote',
  code: 'Code',
  bullet: 'Bulleted list',
  number: 'Numbered list',
  check: 'Checklist',
  divider: 'Divider',
  image: 'Image',
  emoji: 'Emoji',
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strike: 'Strike',
  inlineCode: 'Inline code',
  highlight: 'Highlight',
  sub: 'Subscript',
  sup: 'Superscript',
  alignStart: 'Align start',
  alignCenter: 'Align center',
  alignEnd: 'Align end',
  link: 'Link',
  clear: 'Clear',
  undo: 'Undo',
  redo: 'Redo',
  moveUp: 'Move up',
  moveDown: 'Move down',
  words: 'words',
  linkTitle: 'Link',
  linkDescription: 'Where this text should go.',
  linkField: 'Address',
  linkSave: 'Save link',
  linkRemove: 'Remove link',
  linkInvalid: 'Enter a link.',
  emojiSearch: 'Find an emoji',
  emojiEmpty: 'No emoji',
  emojiStatus: 'Status',
  emojiFaces: 'Faces',
  emojiNature: 'Nature',
  emojiObjects: 'Objects',
  emojiSymbols: 'Symbols',
  imageTitle: 'Image',
  imageDescription: 'Add a picture from a file or an address.',
  imageFile: 'File',
  imageField: 'Address',
  imageAlt: 'Description',
  imageCaption: 'Caption',
  imageSave: 'Save image',
  imageRemove: 'Remove image',
  imageInvalid: 'Choose an image.',
  imageLarge: 'Use an image under 1.5 MB.',
}
