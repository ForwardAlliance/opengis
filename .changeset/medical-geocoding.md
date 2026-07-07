---
'@forwardalliance/opengis': minor
---

Add address geocoding and a `medicalInstitutions` provider (data.gov.tw dataset 15393).

- New `@forwardalliance/opengis/geocoding` module: `GeocodingAdapter` / `GeocodeCache` types, `geocodeAll` (dedupe + bounded concurrency + caching), an `arcgis` adapter (public ArcGIS geocoder, no token), and `memoryGeocodeCache` / `fsGeocodeCache`.
- New `ods()` base provider (`fetchOdsRecords`) that streams OpenDocument spreadsheets.
- `medicalInstitutions({ geocoder, geocodeCache, county? })` factory: parses the MOHW ODS, optionally filters to one county, geocodes addresses, and maps `科別` to the `category` column.
