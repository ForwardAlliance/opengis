import type { AllGeoJSON } from '@turf/turf'

export type Features = AllGeoJSON

export type Provider = {
  id: string
  resolve: () => Promise<Features>
}

export interface CacheEntry {
  data: Features
  cachedAt: number
  ttl: number
}

export interface CacheProvider {
  get(key: string): Promise<CacheEntry | null>
  set(key: string, entry: CacheEntry, ttl: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}
