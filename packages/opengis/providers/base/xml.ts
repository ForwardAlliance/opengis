import { DOMParser } from 'xmldom'
import type { ColumnMap, IdColumn, Provider } from '../../core/types'
import { pointFeatures } from './points'

// Flatten an element into a `{ tag: text }` record. Nested wrapper elements
// (e.g. MOTC's <RoadSection><Start/><End/>) are merged up so their leaf tags
// become top-level keys usable by columnMap.
//
// Limitation: this assumes a simple, non-repeating nested structure. If the
// same leaf tag appears more than once (repeated siblings, or a nested tag that
// collides with an outer one), the last value wins and the earlier ones are
// lost. That holds for the current MOTC point datasets; a source with repeating
// child elements would need a richer strategy (e.g. arrays or parent-prefixed
// keys) before reusing this base.
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

      // xmldom reports problems through this handler rather than throwing or
      // inserting a <parsererror> node, and returns undefined for empty input.
      // Collect fatal problems so malformed XML fails loudly instead of
      // silently yielding an empty FeatureCollection.
      const errors: string[] = []
      const doc = new DOMParser({
        errorHandler: {
          warning: () => {},
          error: (message: string) => errors.push(message),
          fatalError: (message: string) => errors.push(message),
        },
      }).parseFromString(text, 'text/xml')

      if (!doc?.documentElement || errors.length > 0) {
        throw new Error(
          `Failed to parse XML for ${id}: ${errors.join('; ') || 'empty document'}`,
        )
      }

      const elements = Array.from(
        doc.getElementsByTagName(recordTag) as any,
      ) as any[]
      const records = elements.map(toRecord)

      return pointFeatures(records, options, id)
    },
  }
}
