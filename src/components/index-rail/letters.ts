export interface UiIndexItem {
  id: string
  label: string
}

export function indexLetters(items: readonly UiIndexItem[]): string[] {
  const letters: string[] = []
  for (const item of items) {
    const letter = item.label.trim().charAt(0).toLocaleUpperCase()
    if (letter.length === 0 || letters.includes(letter)) continue
    letters.push(letter)
  }
  return letters
}
