import type { Provider } from '../../core/types'
import type { GeocodeCache, GeocodingAdapter } from '../../geocoding/core'
import { geocodeAll } from '../../geocoding/core'
import { fetchOdsRecords } from '../base/ods'
import { pointFeatures } from '../base/points'

// 醫療機構與人員基本資料 (MOHW) — data.gov.tw dataset 15393, ODS, ~24k rows,
// address-only (no coordinates), so records must be geocoded.
const SOURCE_URL =
  'https://www.mohw.gov.tw/dl-96581-66dbb751-f83a-416a-a998-893222e20fef.html'

export function medicalInstitutions({
  geocoder,
  geocodeCache,
  county,
  concurrency,
}: {
  geocoder: GeocodingAdapter
  geocodeCache?: GeocodeCache
  /** Prefix-match on `縣市區名` (e.g. `連江縣`) to limit geocoding volume. */
  county?: string
  concurrency?: number
}): Provider {
  const id = county ? `medical-${county}` : 'medical'

  return {
    id,
    idColumn: '機構代碼',
    columnMap: {
      name: '機構名稱',
      address: '地址',
      phone: '電話',
      // 科別 is a comma-separated list with a trailing comma (e.g. "中醫一般科,").
      category: (feature) =>
        String(feature['科別'] ?? '')
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean)
          .join(','),
    },
    resolve: async () => {
      const records = await fetchOdsRecords(SOURCE_URL)
      // Taiwan open data mixes 台/臺 (e.g. 台北市 vs 臺北市); normalize both sides.
      const normalize = (value: string) => value.replace(/台/g, '臺')
      const target = county ? normalize(county) : ''
      const scoped = county
        ? records.filter((r) => normalize(r['縣市區名'] ?? '').startsWith(target))
        : records

      const coordsByAddress = await geocodeAll(
        scoped.map((r) => r['地址'] ?? ''),
        { adapter: geocoder, cache: geocodeCache, concurrency },
      )

      const located = scoped.flatMap((record) => {
        const coords = coordsByAddress.get((record['地址'] ?? '').trim())
        if (!coords) {
          return []
        }
        return [{ ...record, __lng: String(coords[0]), __lat: String(coords[1]) }]
      })

      return pointFeatures(located, { x: '__lng', y: '__lat' }, id)
    },
  }
}
