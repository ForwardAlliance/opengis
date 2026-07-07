import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { GeocodeCache, LngLat } from './core'

export function memoryGeocodeCache(): GeocodeCache {
  const map = new Map<string, LngLat | null>()
  return {
    async get(address) {
      return map.has(address) ? map.get(address)! : undefined
    },
    async set(address, coords) {
      map.set(address, coords)
    },
  }
}

/**
 * Persists address → coordinate results to a JSON file. The map is loaded once
 * and kept in memory; writes are buffered and only hit disk on `flush()` (called
 * by `geocodeAll` after each batch) so geocoding thousands of addresses does not
 * mean thousands of disk writes.
 */
export function fsGeocodeCache({ path }: { path: string }): GeocodeCache {
  let map: Map<string, LngLat | null> | null = null
  let dirty = false

  const load = async () => {
    if (map) {
      return map
    }
    try {
      const parsed = JSON.parse(await readFile(path, 'utf-8')) as Record<
        string,
        LngLat | null
      >
      map = new Map(Object.entries(parsed))
    } catch {
      map = new Map()
    }
    return map
  }

  return {
    async get(address) {
      const loaded = await load()
      return loaded.has(address) ? loaded.get(address)! : undefined
    },
    async set(address, coords) {
      const loaded = await load()
      loaded.set(address, coords)
      dirty = true
    },
    async flush() {
      if (!map || !dirty) {
        return
      }
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, JSON.stringify(Object.fromEntries(map)))
      dirty = false
    },
  }
}
