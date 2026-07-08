import https from 'node:https'

/**
 * Fetch a URL as bytes.
 *
 * With `insecureTLS`, the request is made through a dedicated agent that skips
 * certificate verification — scoped to this single request only. Some government
 * servers omit their intermediate certificate, which Node cannot verify; this
 * keeps the workaround local instead of disabling TLS verification for the whole
 * process (as a `NODE_TLS_REJECT_UNAUTHORIZED` override would).
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
  return new Promise((resolve, reject) => {
    https
      .get(url, { agent }, (response) => {
        const status = response.statusCode ?? 0
        if (status < 200 || status >= 300) {
          response.resume()
          reject(new Error(`Failed to fetch ${url}: ${status}`))
          return
        }
        const chunks: Buffer[] = []
        response.on('data', (chunk) => chunks.push(chunk))
        response.on('end', () => resolve(new Uint8Array(Buffer.concat(chunks))))
        response.on('error', reject)
      })
      .on('error', reject)
  })
}
