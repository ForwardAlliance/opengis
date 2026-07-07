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
 */
export function createArcgis({ minScore = 80 }: { minScore?: number } = {}): GeocodingAdapter {
  return {
    async geocode(address: string): Promise<LngLat | null> {
      const url = new URL(ENDPOINT)
      url.searchParams.set('f', 'json')
      url.searchParams.set('singleLine', address)
      url.searchParams.set('countryCode', 'TWN')
      url.searchParams.set('maxLocations', '1')
      url.searchParams.set('outFields', 'Score')

      const response = await fetch(url)
      if (!response.ok) {
        return null
      }

      const data = (await response.json()) as ArcgisResponse
      const candidate = data.candidates?.[0]
      if (!candidate?.location || (candidate.score ?? 0) < minScore) {
        return null
      }

      return [candidate.location.x, candidate.location.y]
    },
  }
}

export const arcgis: GeocodingAdapter = createArcgis()
