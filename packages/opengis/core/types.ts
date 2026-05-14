import type { FeatureCollection } from 'geojson'

export type Features = FeatureCollection
export type ColumnMap = Record<
  string,
  string | ((feature: Record<any, any>) => string)
>
export type IdColumn = string | ((feature: Record<any, any>) => string)

export type Provider = {
  id: string
  resolve: () => Promise<Features>
  columnMap?: ColumnMap
  idColumn?: IdColumn
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
