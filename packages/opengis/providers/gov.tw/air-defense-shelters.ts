import { kml } from '../base/kml'
import { join } from '../utils'

function getAttribute(tag: string, name: string) {
  const match = tag.match(new RegExp(`${name}=["']([^"']+)["']`, 'i'))

  if (!match?.[1]) {
    return null
  }

  return match[1]
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}

export const airDefenseShelters = join({
  id: 'air-defense-shelters',
  idColumn: '電腦編號',
  columnMap: {
    address: '地址',
  },
  preprocessing: async () => {
    const response = await fetch('https://adr.npa.gov.tw/')
    const html = await response.text()

    const links = Array.from(html.matchAll(/<a\b[^>]*>/gi))
      .map(([tag]) =>
        getAttribute(tag, 'title') === '請點選(Google My Maps鏈結)'
          ? getAttribute(tag, 'href')
          : null,
      )
      .filter((l) => l !== null)

    return links
  },
  getProviders: (links) => {
    return links.map((link) => kml({ id: link, url: link }))
  },
})
