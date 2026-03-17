import { DEFAULT_TTL } from './constants'
import { type CacheProvider, type Provider } from './types'

export async function fetchFeatures({
  provider,
  cache,
  ttl = DEFAULT_TTL,
}: {
  provider: Provider
  cache: CacheProvider
  ttl?: number
}) {
  const cacheKey = provider.id
  const cachedResult = await cache.get(cacheKey)

  if (cachedResult) {
    return cachedResult.data
  }

  const fetchedResult = await provider.resolve()

  await cache.set(
    cacheKey,
    { data: fetchedResult, cachedAt: new Date().getTime(), ttl },
    86400,
  )

  return fetchedResult
}
