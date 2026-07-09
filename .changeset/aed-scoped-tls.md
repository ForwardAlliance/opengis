---
'@forwardalliance/opengis': patch
---

Security: stop disabling TLS verification process-wide.

The `aed` provider set `NODE_TLS_REJECT_UNAUTHORIZED=0` at import time, which turned off certificate verification for every HTTPS request in the host process just by importing `@forwardalliance/opengis/providers`. The AED server omits its intermediate certificate; that workaround is now scoped to the single AED request via a dedicated `https.Agent` (new `insecureTLS` option on the `csv()` base), leaving global TLS verification intact.
