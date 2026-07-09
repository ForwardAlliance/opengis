import http from 'node:http'
import https from 'node:https'

const MAX_REDIRECTS = 5

/**
 * Fetch a URL as bytes.
 *
 * With `insecureTLS`, the request is made through a dedicated agent that skips
 * certificate verification — scoped to this single request only. Some government
 * servers omit their intermediate certificate, which Node cannot verify; this
 * keeps the workaround local instead of disabling TLS verification for the whole
 * process (as a `NODE_TLS_REJECT_UNAUTHORIZED` override would).
 *
 * The insecure path follows redirects (as global `fetch` does), so a source that
 * 3xx-redirects to a CDN still resolves.
 */
export async function fetchBytes(
  url: string,
  { insecureTLS = false }: { insecureTLS?: boolean } = {},
): Promise<Uint8Array> {
  if (!insecureTLS) {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`)
    }
    return new Uint8Array(await response.arrayBuffer())
  }

  const agent = new https.Agent({ rejectUnauthorized: false })

  const get = (target: string, redirects: number): Promise<Uint8Array> =>
    new Promise((resolve, reject) => {
      const parsed = new URL(target)
      const isHttps = parsed.protocol === 'https:'
      const client = isHttps ? https : http

      client
        .get(parsed, isHttps ? { agent } : {}, (response) => {
          const status = response.statusCode ?? 0
          const location = response.headers.location

          if (status >= 300 && status < 400 && location) {
            response.resume()
            if (redirects >= MAX_REDIRECTS) {
              reject(new Error(`Too many redirects fetching ${url}`))
              return
            }
            try {
              resolve(get(new URL(location, parsed).toString(), redirects + 1))
            } catch (error) {
              reject(error)
            }
            return
          }

          if (status < 200 || status >= 300) {
            response.resume()
            reject(new Error(`Failed to fetch ${target}: ${status}`))
            return
          }

          const chunks: Buffer[] = []
          response.on('data', (chunk) => chunks.push(chunk))
          response.on('end', () => resolve(new Uint8Array(Buffer.concat(chunks))))
          response.on('error', reject)
        })
        .on('error', reject)
    })

  return get(url, 0)
}
