module.exports = () => ({
  version: 2.2,
  getLanguageId(fileName) {
    const path = String(fileName).replaceAll('\\', '/')
    if (path.endsWith('.scss')) return 'scss'
    if (path.endsWith('.css')) return 'css'
    return undefined
  },
})
