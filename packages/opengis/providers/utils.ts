import type { ColumnMap, IdColumn, Provider } from '../core/types'
import { featureCollection } from '@turf/turf'

export function getStringProperty(feature: Record<any, any>, key: string) {
  const value = feature?.[key]
  return typeof value === 'string' && value.trim() ? value : null
}

export function join<PreprocessingData>({
  id,
  columnMap,
  idColumn,
  ...options
}: { id: string; columnMap?: ColumnMap; idColumn?: IdColumn } & (
  | {
      preprocessing: () => Promise<PreprocessingData>
      getProviders: (preprocessingData: PreprocessingData) => Provider[]
    }
  | {
      providers: Provider[]
    }
)): Provider {
  if ('providers' in options) {
    const { providers } = options
    return {
      id,
      columnMap,
      idColumn,
      resolve: async () => {
        const results = await Promise.all(
          providers.map((p) => p.resolve().then((result) => result.features)),
        )
        return featureCollection(results.flat())
      },
    }
  } else {
    const { preprocessing, getProviders } = options
    return {
      id,
      columnMap,
      idColumn,
      resolve: async () => {
        const preprocessingData = await preprocessing()
        const providers = getProviders(preprocessingData)
        const results = await Promise.all(
          providers.map((p) => p.resolve().then((result) => result.features)),
        )
        return featureCollection(results.flat())
      },
    }
  }
}
