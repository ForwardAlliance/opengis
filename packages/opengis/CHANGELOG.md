# @forwardalliance/opengis

## 1.1.0

### Minor Changes

- a22a7fd: Add `cctv` provider for freeway CCTV static info (data.gov.tw dataset 37665, MOTC v2.0 XML).

  Introduce a generic `xml()` base provider (repeating-element tag + nested-tag flattening), extract the shared coordinate handling used by `csv()`/`xml()` into a helper, and document the `imageURL` / `description` column-map standard keys.

- eda4164: Add `fireStations` and `disasterResponseCenters` providers for nationwide fire units and disaster response centers (data.gov.tw dataset 5969).

  The `csv()` base provider now accepts a configurable `encoding` (e.g. `big5`), strips BOM, tolerates blank/duplicate header columns, and drops rows whose coordinates are missing or `(0, 0)`.

- 77a6483: Add address geocoding and a `medicalInstitutions` provider (data.gov.tw dataset 15393).
  - New `@forwardalliance/opengis/geocoding` module: `GeocodingAdapter` / `GeocodeCache` types, `geocodeAll` (dedupe + bounded concurrency + caching), an `arcgis` adapter (public ArcGIS geocoder, no token), and `memoryGeocodeCache` / `fsGeocodeCache`.
  - New `ods()` base provider (`fetchOdsRecords`) that streams OpenDocument spreadsheets.
  - `medicalInstitutions({ geocoder, geocodeCache, county? })` factory: parses the MOHW ODS, optionally filters to one county, geocodes addresses, and maps `科別` to the `category` column.

- a550616: Add `police` provider for police station addresses (data.gov.tw dataset 5958).
  - The `csv()` base gains a `zipEntry` option to read a CSV out of a zipped download (matched by name or RegExp for date-stamped filenames).
  - The source ships TWD97/TM2 (EPSG:3826) coordinates, reprojected to WGS84.
  - `pointFeatures` now reprojects before filtering and drops points outside a wide Taiwan bounding box (default; pass `bbox: null` to disable, or a custom `[minLng, minLat, maxLng, maxLat]`), catching corrupt source coordinates that land in the ocean.

## 1.0.6

### Patch Changes

- 4735f43: Fix blood.org.tw provider CSRF handling and upstream response validation.

## 1.0.5

### Patch Changes

- f1e414c: feat(opengis/blood): add id and column map

## 1.0.4

### Patch Changes

- 3971f60: fix(opengis/aed): add fallback for null time
- 655230f: provider: add stb data from forwardalliance

## 1.0.3

### Patch Changes

- 7985f91: fix aed weekday time null value

## 1.0.2

### Patch Changes

- 76994b2: fix(providers/aed): time "null" is being printed as plain text instead of catched by null value logic.

## 1.0.1

### Patch Changes

- 523a267: Add name column map

## 1.0.0

### Major Changes

- 01ce0df: Update interface and add new providers
