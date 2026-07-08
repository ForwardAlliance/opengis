import { parse } from 'csv-parse/sync'
import { unzipSync } from 'fflate'
import type { ColumnMap, IdColumn, Provider } from '../../core/types'
import { pointFeatures, type Bbox } from './points'

export function csv(
  {
    id,
    url,
    columnMap,
    idColumn,
    encoding,
    zipEntry,
  }: {
    id: string
    url: string
    columnMap?: ColumnMap
    idColumn?: IdColumn
    encoding?: string
    /** If the URL returns a zip, the entry to read from it (name or matcher). */
    zipEntry?: string | RegExp
  },
  options: { x: string; y: string; crs?: string; bbox?: Bbox | null },
): Provider {
  return {
    id,
    columnMap,
    idColumn,
    resolve: async () => {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error()
      }

      let bytes = new Uint8Array(await response.arrayBuffer())

      if (zipEntry) {
        const files = unzipSync(bytes)
        const name = Object.keys(files).find((entry) =>
          typeof zipEntry === 'string' ? entry === zipEntry : zipEntry.test(entry),
        )
        const entry = name ? files[name] : undefined
        if (!entry) {
          throw new Error(`No zip entry matching ${zipEntry} in ${id}`)
        }
        bytes = entry
      }

      const text = new TextDecoder(encoding ?? 'utf-8').decode(bytes)

      const records = parse(text, {
        // Some source files have trailing blank headers; give them unique
        // placeholder names so they can't collide with the real columns.
        columns: (header: string[]) =>
          header.map((h, i) => (h && h.trim() ? h.trim() : `__empty_${i}`)),
        bom: true,
        skipEmptyLines: true,
      }) as Record<string, string>[]

      return pointFeatures(records, options, id)
    },
  }
}
