import { kml as kmlToGeoJson } from '@tmcw/togeojson'
import { DOMParser } from 'xmldom'
import type { ColumnMap, Features, IdColumn, Provider } from '../../core/types'

function toKmlUrl(url: string) {
  const parsed = new URL(url)

  if (
    parsed.hostname === 'www.google.com' &&
    parsed.pathname.startsWith('/maps/d/')
  ) {
    const mid = parsed.searchParams.get('mid')

    if (mid) {
      return `https://www.google.com/maps/d/kml?mid=${encodeURIComponent(mid)}&forcekml=1`
    }
  }

  return url
}

export function kml({
  id,
  url,
  columnMap,
  idColumn,
}: {
  id: string
  url: string
  columnMap?: ColumnMap
  idColumn?: IdColumn
}): Provider {
  return {
    id,
    columnMap,
    idColumn,
    resolve: async () => {
      const response = await fetch(toKmlUrl(url))

      if (!response.ok) {
        throw new Error(`Failed to fetch KML for ${id}: ${response.status}`)
      }

      const text = await response.text()
      const parser = new DOMParser()
      const doc = parser.parseFromString(text, 'text/xml')

      return kmlToGeoJson(doc, { skipNullGeometry: true }) as Features
    },
  }
}
