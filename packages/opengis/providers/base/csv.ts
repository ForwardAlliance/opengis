import { parse } from 'csv-parse/sync'
import type { ColumnMap, IdColumn, Provider } from '../../core/types'
import { pointFeatures } from './points'

export function csv(
  {
    id,
    url,
    columnMap,
    idColumn,
    encoding,
  }: {
    id: string
    url: string
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
        throw new Error()
      }

      const buffer = await response.arrayBuffer()
      const text = new TextDecoder(encoding ?? 'utf-8').decode(buffer)

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
