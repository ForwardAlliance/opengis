import { feature, featureCollection } from '@turf/turf'
import { parse } from 'csv-parse/sync'
import proj4 from 'proj4'
import type { ColumnMap, IdColumn, Provider } from '../../core/types'
import { DEFAULT_CRS } from '../../core/constants'

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

      // Fail loudly if the coordinate columns are missing (e.g. the source
      // renamed them); otherwise every row would parse to NaN and be silently
      // filtered out, leaving an empty FeatureCollection.
      const firstRecord = records[0]
      if (firstRecord) {
        for (const column of [options.x, options.y]) {
          if (!(column in firstRecord)) {
            throw new Error(`Coordinate column "${column}" not found in ${id}`)
          }
        }
      }

      return featureCollection(
        records
          .map((record) => {
            const coords = [
              Number(record[options.x]),
              Number(record[options.y]),
            ]

            return { record, coords }
          })
          // Drop rows whose coordinates are missing or blank; empty CSV fields
          // become 0, so any 0 coordinate (including a partial [lng, 0]) is
          // treated as invalid — no Taiwan point legitimately sits on 0.
          .filter(
            ({ coords: [x, y] }) =>
              Number.isFinite(x) &&
              Number.isFinite(y) &&
              x !== 0 &&
              y !== 0,
          )
          .map(({ record, coords }) =>
            feature(
              {
                type: 'Point',
                coordinates: options.crs
                  ? proj4(options.crs, DEFAULT_CRS, coords)
                  : coords,
              },
              record,
            ),
          ),
      )
    },
  }
}
