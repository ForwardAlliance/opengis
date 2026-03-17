import { mkdir, readdir, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import type { CacheEntry, CacheProvider } from '../core/types'

export function fs(options: { dir: string }): CacheProvider {
  const { dir } = options

  function filepath(key: string) {
    return join(dir, `${key}.json`)
  }

  return {
    async get(key) {
      const file = Bun.file(filepath(key))
      if (!(await file.exists())) return null

      try {
        const entry = (await file.json()) as CacheEntry

        const expired = Date.now() - entry.cachedAt >= entry.ttl * 1000
        if (expired) {
          await unlink(filepath(key)).catch(() => {})
          return null
        }

        return entry
      } catch {
        return null
      }
    },

    async set(key, entry) {
      await mkdir(dir, { recursive: true })
      await Bun.write(filepath(key), JSON.stringify(entry))
    },

    async delete(key) {
      await unlink(filepath(key)).catch(() => {})
    },

    async clear() {
      const files = await readdir(dir).catch(() => [] as string[])
      await Promise.all(
        files
          .filter((f) => f.endsWith('.json'))
          .map((f) => unlink(join(dir, f)).catch(() => {})),
      )
    },
  }
}
