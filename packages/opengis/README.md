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
