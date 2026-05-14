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
