import { fetchFeatures } from '@forwardalliance/opengis'
import { saveToFile } from './utils'
import { aed, blood, shelters } from '@forwardalliance/opengis/providers'

const toFetch = [aed, blood, shelters]

await Promise.all(
  toFetch.map(
    async (provider) =>
      await saveToFile({
        obj: await fetchFeatures({
          provider,
          cache: {
            get: async () => null,
            clear: async () => {},
            delete: async () => {},
            set: async () => {},
          },
        }),
        name: provider.id,
      }).finally(() => console.log(`${provider.id} fetched.`)),
  ),
)
