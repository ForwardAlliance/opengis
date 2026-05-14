import { fetchFeatures } from '@forwardalliance/opengis'
import { fs } from '@forwardalliance/opengis/cache'
import {
  aed,
  blood,
  shelters,
  airDefenseShelters,
} from '@forwardalliance/opengis/providers'
import { saveToFile } from './utils'

const cache = fs({ dir: '.cache' })
const toFetch = [aed, blood, shelters, airDefenseShelters]

await Promise.all(
  toFetch.map(
    async (provider) =>
      await saveToFile({
        obj: await fetchFeatures({ provider, cache }),
        name: provider.id,
      }).finally(() => console.log(`${provider.id} fetched.`)),
  ),
)
