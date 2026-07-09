import type { GeocodingAdapter, LngLat } from './core'

const ENDPOINT =
  'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates'

type ArcgisResponse = {
  candidates?: { location?: { x: number; y: number }; score?: number }[]
}

/**
 * ArcGIS World Geocoding via the public `findAddressCandidates` endpoint
 * (no token required for single-address lookups). Returns the top candidate
 * scoring at least `minScore`, biased to Taiwan.
 *
 * Each request is bounded by `timeout` (ms) so a hung request can't stall a
 * geocoding batch; on timeout or any error the address resolves to `null`.
 */
export function createArcgis({
  minScore = 80,
  timeout = 10_000,
}: { minScore?: number; timeout?: number } = {}): GeocodingAdapter {
  return {
    async geocode(address: string): Promise<LngLat | null> {
      const url = new URL(ENDPOINT)
      url.searchParams.set('f', 'json')
      url.searchParams.set('singleLine', address)
      url.searchParams.set('countryCode', 'TWN')
      url.searchParams.set('maxLocations', '1')
      url.searchParams.set('outFields', 'Score')

      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(timeout) })
        if (!response.ok) {
          return null
        }

        const data = (await response.json()) as ArcgisResponse
        const candidate = data.candidates?.[0]
        if (!candidate?.location || (candidate.score ?? 0) < minScore) {
          return null
        }

        return [candidate.location.x, candidate.location.y]
      } catch {
        // network error, timeout/abort, or malformed response
        return null
      }
    },
  }
}

export const arcgis: GeocodingAdapter = createArcgis()
