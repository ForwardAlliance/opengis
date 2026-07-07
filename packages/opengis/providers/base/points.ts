import { feature, featureCollection } from '@turf/turf'
import proj4 from 'proj4'
import { DEFAULT_CRS } from '../../core/constants'
import type { Features } from '../../core/types'

/**
 * Build a point FeatureCollection from flat records, sharing the coordinate
 * handling used by the csv() and xml() base providers.
 *
 * - Throws if the configured coordinate columns are missing, so a renamed
 *   source column fails loudly instead of returning an empty collection.
 * - Drops rows whose coordinates are non-finite or 0 (empty fields parse to 0,
 *   and no Taiwan point legitimately sits on a 0 coordinate).
 */
export function pointFeatures(
  records: Record<string, string>[],
  { x, y, crs }: { x: string; y: string; crs?: string },
  id: string,
): Features {
  const firstRecord = records[0]
  if (firstRecord) {
    for (const column of [x, y]) {
      if (!(column in firstRecord)) {
        throw new Error(`Coordinate column "${column}" not found in ${id}`)
      }
    }
  }

  return featureCollection(
    records
      .map((record) => ({
        record,
        coords: [Number(record[x]), Number(record[y])],
      }))
      .filter(
        ({ coords: [lng, lat] }) =>
          Number.isFinite(lng) &&
          Number.isFinite(lat) &&
          lng !== 0 &&
          lat !== 0,
      )
      .map(({ record, coords }) =>
        feature(
          {
            type: 'Point',
            coordinates: crs ? proj4(crs, DEFAULT_CRS, coords) : coords,
          },
          record,
        ),
      ),
  )
}
