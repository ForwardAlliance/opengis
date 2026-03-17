import { feature, featureCollection } from '@turf/turf'
import { parse } from 'csv-parse/sync'
import proj4 from 'proj4'
import type { Provider } from '../../core/types'
import { DEFAULT_CRS } from '../../core/constants'

export function csv(
  { id, url }: { id: string; url: string },
  options: { x: string; y: string; crs?: string },
): Provider {
  return {
    id,
    resolve: async () => {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error()
      }

      const text = await response.text()

      const records = parse(text, {
        columns: true,
        skipEmptyLines: true,
      }) as Record<string, string>[]

      return featureCollection(
        records.map((record) => {
          const coords = [Number(record[options.x]), Number(record[options.y])]

          return feature(
            {
              type: 'Point',
              coordinates: options.crs
                ? proj4(options.crs, DEFAULT_CRS, coords)
                : coords,
            },
            record,
          )
        }),
      )
    },
  }
}
