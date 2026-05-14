# forward-opengis

## Commands

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

Run the playground downloader:

```bash
pnpm --filter playground exec bun download.ts
```

## Packages

- `packages/opengis`: npm package
- `packages/playground`: local download scripts

## Publishing

```bash
pnpm changeset
```

Merge the generated changeset to `main`; GitHub Actions handles the version PR
and npm publish.
