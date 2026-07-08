import { feature, featureCollection } from '@turf/turf'
import proj4 from 'proj4'
import { DEFAULT_CRS } from '../../core/constants'
import type { Features } from '../../core/types'

/** `[minLng, minLat, maxLng, maxLat]` (WGS84). */
export type Bbox = readonly [number, number, number, number]

// Generous bounds covering the main island plus outlying groups
// (金門 ~118.2, 馬祖/東引 ~26.4, 澎湖, 蘭嶼/綠島). Wide enough to keep every real
// point while catching corrupt source coordinates (e.g. a row where POINT_Y was
// duplicated from POINT_X and reprojects to the equator).
const TAIWAN_BBOX: Bbox = [118, 21.5, 122.5, 26.5]

/**
 * Build a point FeatureCollection from flat records, sharing the coordinate
 * handling used by the csv() and xml() base providers.
 *
 * - Throws if the configured coordinate columns are missing, so a renamed
 *   source column fails loudly instead of returning an empty collection.
 * - Reprojects (when `crs` is set), then drops points that are non-finite, at
 *   `(0, 0)`, or outside `bbox` (default Taiwan; pass `null` to disable).
 */
export function pointFeatures(
  records: Record<string, string>[],
  {
    x,
    y,
    crs,
    bbox = TAIWAN_BBOX,
  }: { x: string; y: string; crs?: string; bbox?: Bbox | null },
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
        raw: [Number(record[x]), Number(record[y])],
      }))
      // Drop non-finite up front so proj4 never sees NaN.
      .filter(({ raw: [x0, y0] }) => Number.isFinite(x0) && Number.isFinite(y0))
      .map(({ record, raw }) => ({
        record,
        coords: crs ? proj4(crs, DEFAULT_CRS, raw) : raw,
      }))
      .filter(({ coords }) => {
        const [lng = 0, lat = 0] = coords
        // Reprojection can still yield NaN; guard again so it can't leak into
        // the output as [null, null] when bbox is disabled.
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
          return false
        }
        // No Taiwan point sits on a 0 lng/lat; a 0 means a missing/blank source
        // value. Checked independently of bbox so it holds even when disabled.
        if (lng === 0 || lat === 0) {
          return false
        }
        if (bbox) {
          const [minLng, minLat, maxLng, maxLat] = bbox
          return (
            lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat
          )
        }
        return true
      })
      .map(({ record, coords }) =>
        feature({ type: 'Point', coordinates: coords }, record),
      ),
  )
}
