import type { CacheEntry, CacheProvider } from '../core/types'

export function memory(): CacheProvider {
  const store = new Map<string, CacheEntry>()

  return {
    async get(key) {
      const entry = store.get(key)
      if (!entry) return null

      const expired = Date.now() - entry.cachedAt >= entry.ttl * 1000
      if (expired) {
        store.delete(key)
        return null
      }

      return entry
    },

    async set(key, entry) {
      store.set(key, entry)
    },

    async delete(key) {
      store.delete(key)
    },

    async clear() {
      store.clear()
    },
  }
}
