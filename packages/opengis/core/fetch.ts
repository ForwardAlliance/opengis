import { DEFAULT_TTL } from './constants'
import {
  type CacheProvider,
  type ColumnMap,
  type Features,
  type IdColumn,
  type Provider,
} from './types'

function applyOutputConfig(
  features: Features,
  {
    columnMap,
    idColumn,
  }: {
    columnMap?: ColumnMap
    idColumn?: IdColumn
  },
) {
  if (!columnMap && !idColumn) {
    return features
  }

  return {
    ...features,
    features: features.features.map((feature) => {
      if (!feature.properties) {
        return feature
      }

      const properties = { ...feature.properties }
      const id =
        typeof idColumn === 'function'
          ? idColumn(feature.properties)
          : idColumn
            ? feature.properties[idColumn]
            : feature.id

      for (const [key, value] of Object.entries(columnMap ?? {})) {
        properties[key] =
          typeof value === 'function'
            ? value(feature.properties)
            : feature.properties[value]
      }

      return {
        ...feature,
        id,
        properties,
      }
    }),
  } satisfies Features
}

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
    return applyOutputConfig(cachedResult.data, provider)
  }

  const fetchedResult = await provider.resolve()

  await cache.set(
    cacheKey,
    { data: fetchedResult, cachedAt: new Date().getTime(), ttl },
    ttl,
  )

  return applyOutputConfig(fetchedResult, provider)
}
