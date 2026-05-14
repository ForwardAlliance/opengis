# forward-opengis

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.10. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Publishing a new version

This repo uses Changesets to trigger npm publishing from GitHub Actions.

1. Add a changeset for the package change:

```bash
pnpm changeset
```

Choose `@forwardalliance/opengis`, pick the semver bump, and write the release note.

2. Commit the generated `.changeset/*.md` file with your change and merge it to `main`.

3. The `Publish` workflow opens or updates a "Version Packages" pull request. Review and merge that PR to apply the version bump and changelog update.

4. After the version PR is merged to `main`, the same workflow publishes `@forwardalliance/opengis` to npm using the `NPM_TOKEN` GitHub secret and creates the git tag for the published version.
