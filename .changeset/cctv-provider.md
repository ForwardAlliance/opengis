---
'@forwardalliance/opengis': minor
---

Add `cctv` provider for freeway CCTV static info (data.gov.tw dataset 37665, MOTC v2.0 XML).

Introduce a generic `xml()` base provider (repeating-element tag + nested-tag flattening), extract the shared coordinate handling used by `csv()`/`xml()` into a helper, and document the `imageURL` / `description` column-map standard keys.
