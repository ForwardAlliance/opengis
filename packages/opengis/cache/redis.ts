import type { CacheEntry, CacheProvider } from '../core/types'

export interface RedisClient {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ...args: unknown[]): Promise<unknown>
  del(...keys: string[]): Promise<number>
  keys(pattern: string): Promise<string[]>
}

const DEFAULT_PREFIX = 'opengis:'

export function redis(
  client: RedisClient,
  options?: { prefix?: string },
): CacheProvider {
  const prefix = options?.prefix ?? DEFAULT_PREFIX

  function prefixed(key: string) {
    return `${prefix}${key}`
  }

  return {
    async get(key) {
      const raw = await client.get(prefixed(key))
      if (!raw) return null

      try {
        const entry = JSON.parse(raw) as CacheEntry

        const expired = Date.now() - entry.cachedAt >= entry.ttl * 1000
        if (expired) {
          await client.del(prefixed(key))
          return null
        }

        return entry
      } catch {
        return null
      }
    },

    async set(key, entry, ttl) {
      await client.set(prefixed(key), JSON.stringify(entry), 'EX', ttl)
    },

    async delete(key) {
      await client.del(prefixed(key))
    },

    async clear() {
      const keys = await client.keys(`${prefix}*`)
      if (keys.length > 0) {
        await client.del(...keys)
      }
    },
  }
}
