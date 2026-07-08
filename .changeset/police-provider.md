---
'@forwardalliance/opengis': minor
---

Add `police` provider for police station addresses (data.gov.tw dataset 5958).

- The `csv()` base gains a `zipEntry` option to read a CSV out of a zipped download (matched by name or RegExp for date-stamped filenames).
- The source ships TWD97/TM2 (EPSG:3826) coordinates, reprojected to WGS84.
- `pointFeatures` now reprojects before filtering and drops points outside a wide Taiwan bounding box (default; pass `bbox: null` to disable, or a custom `[minLng, minLat, maxLng, maxLat]`), catching corrupt source coordinates that land in the ocean.
