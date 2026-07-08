export type LngLat = [number, number]

export interface GeocodingAdapter {
  /** Resolve an address to `[lng, lat]`, or `null` when it can't be geocoded. */
  geocode(address: string): Promise<LngLat | null>
}

export interface GeocodeCache {
  /** `undefined` = not cached; `null` = cached as known-unresolvable. */
  get(address: string): Promise<LngLat | null | undefined>
  set(address: string, coords: LngLat | null): Promise<void>
  /** Persist buffered writes. Called once after a batch by `geocodeAll`. */
  flush?(): Promise<void>
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<void> {
  let index = 0
  const workers = Array.from(
    { length: Math.min(Math.max(1, concurrency), items.length || 1) },
    async () => {
      while (index < items.length) {
        const item = items[index++]
        if (item !== undefined) {
          await fn(item)
        }
      }
    },
  )
  await Promise.all(workers)
}

/**
 * Geocode a list of addresses. Deduplicates, serves hits from `cache`, geocodes
 * the misses with bounded concurrency, writes results back, and returns a map
 * of address → coordinates (or `null` when unresolvable).
 */
export async function geocodeAll(
  addresses: string[],
  {
    adapter,
    cache,
    concurrency = 8,
  }: { adapter: GeocodingAdapter; cache?: GeocodeCache; concurrency?: number },
): Promise<Map<string, LngLat | null>> {
  const result = new Map<string, LngLat | null>()
  const unique = [
    ...new Set(addresses.filter((a) => a && a.trim()).map((a) => a.trim())),
  ]

  const misses: string[] = []
  for (const address of unique) {
    if (cache) {
      const cached = await cache.get(address)
      if (cached !== undefined) {
        result.set(address, cached)
        continue
      }
    }
    misses.push(address)
  }

  await mapPool(misses, concurrency, async (address) => {
    let coords: LngLat | null = null
    try {
      coords = await adapter.geocode(address)
    } catch {
      coords = null
    }
    result.set(address, coords)
    await cache?.set(address, coords)
  })

  await cache?.flush?.()
  return result
}
