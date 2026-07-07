import { DOMParser } from 'xmldom'
import type { ColumnMap, IdColumn, Provider } from '../../core/types'
import { pointFeatures } from './points'

// Flatten an element into a `{ tag: text }` record. Nested wrapper elements
// (e.g. MOTC's <RoadSection><Start/><End/>) are merged up so their leaf tags
// become top-level keys usable by columnMap.
function toRecord(element: any): Record<string, string> {
  const record: Record<string, string> = {}

  for (const child of Array.from(element.childNodes) as any[]) {
    if (child.nodeType !== 1) {
      continue
    }

    const hasElementChild = Array.from(child.childNodes as any[]).some(
      (n: any) => n.nodeType === 1,
    )

    if (hasElementChild) {
      Object.assign(record, toRecord(child))
    } else {
      record[child.tagName] = child.textContent?.trim() ?? ''
    }
  }

  return record
}

export function xml(
  {
    id,
    url,
    recordTag,
    columnMap,
    idColumn,
    encoding,
  }: {
    id: string
    url: string
    /** Tag name of the repeating record element, e.g. `CCTV`. */
    recordTag: string
    columnMap?: ColumnMap
    idColumn?: IdColumn
    encoding?: string
  },
  options: { x: string; y: string; crs?: string },
): Provider {
  return {
    id,
    columnMap,
    idColumn,
    resolve: async () => {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch XML for ${id}: ${response.status}`)
      }

      const buffer = await response.arrayBuffer()
      const text = new TextDecoder(encoding ?? 'utf-8').decode(buffer)

      const doc = new DOMParser().parseFromString(text, 'text/xml')
      const elements = Array.from(
        doc.getElementsByTagName(recordTag) as any,
      ) as any[]
      const records = elements.map(toRecord)

      return pointFeatures(records, options, id)
    },
  }
}
