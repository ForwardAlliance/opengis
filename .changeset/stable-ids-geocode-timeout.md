---
'@forwardalliance/opengis': minor
---

Stable feature ids and a geocoder request timeout (integration feedback).

- `police`, `fireStations`, and `disasterResponseCenters` now set an `idColumn` keyed on name + address, so features carry a stable, unique id for downstream upserts (police unit names alone collide across cities).
- `createArcgis` accepts a `timeout` option (default 10s); each geocode request is bounded by `AbortSignal.timeout`, and a timeout/error resolves the address to `null` instead of stalling the batch.
