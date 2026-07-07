---
'@forwardalliance/opengis': minor
---

Add `fireStations` and `disasterResponseCenters` providers for nationwide fire units and disaster response centers (data.gov.tw dataset 5969).

The `csv()` base provider now accepts a configurable `encoding` (e.g. `big5`), strips BOM, tolerates blank/duplicate header columns, and drops rows whose coordinates are missing or `(0, 0)`.
