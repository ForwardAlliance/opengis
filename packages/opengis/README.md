# @forwardalliance/opengis

ESM TypeScript package for fetching provider data as GeoJSON.

## Install

```bash
pnpm add @forwardalliance/opengis
```

## Usage

```ts
import { fetchFeatures } from '@forwardalliance/opengis'
import { memory } from '@forwardalliance/opengis/cache'
import { aed } from '@forwardalliance/opengis/providers'

const features = await fetchFeatures({
  provider: aed,
  cache: memory(),
})
```

## Exports

- `@forwardalliance/opengis`
- `@forwardalliance/opengis/providers`
- `@forwardalliance/opengis/cache`
- `@forwardalliance/opengis/geocoding`

## Geocoding

Some sources ship only an address. Providers that need coordinates take a
`GeocodingAdapter` and an optional persistent `GeocodeCache` (so addresses are
only geocoded once). `arcgis` uses the public ArcGIS geocoder (no token).

```ts
import { fetchFeatures } from '@forwardalliance/opengis'
import { memory } from '@forwardalliance/opengis/cache'
import { medicalInstitutions } from '@forwardalliance/opengis/providers'
import { arcgis, fsGeocodeCache } from '@forwardalliance/opengis/geocoding'

const provider = medicalInstitutions({
  geocoder: arcgis,
  geocodeCache: fsGeocodeCache({ path: '.cache/medical-geocode.json' }),
  county: '連江縣', // optional: limit to one county (prefix match on 縣市區名)
})

const features = await fetchFeatures({ provider, cache: memory() })
```

> The national dataset has ~24k address-only rows. Geocode a county at a time,
> back it with a persistent `fsGeocodeCache`, and mind the geocoder's terms of
> service before bulk/national runs.

## Development

```bash
pnpm --filter @forwardalliance/opengis typecheck
pnpm --filter @forwardalliance/opengis build
pnpm --filter @forwardalliance/opengis dev
```

## Column Map Standard Keys

Make sure every provider has these keys mapped (if avaliable) to show metadata properly on map frontend.

- `name`: `string`
- `address`: `string`
- `phone`: `string`, this could be a general "contact info" text.
- `time`: `string` this could be a multiline text describing time opened for the location
- `description`: `string`, free-form text describing the location.
- `imageURL`: `string`, a link to a live image/video stream for the location (e.g. a CCTV feed).
- `category`: `string`, comma-separated categories/specialties for the location (e.g. medical 科別).
