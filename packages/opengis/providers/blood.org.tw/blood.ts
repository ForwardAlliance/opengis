import z from 'zod'
import type { Provider } from '../../core/types'
import { feature, featureCollection } from '@turf/turf'

const featuresSchema = z.array(
  z.object({
    SId: z.object({
      Value: z.string(),
    }),
    Cdt: z.string(),
    Mdt: z.string(),
    SiteId: z.string(),
    CenterId: z.string(),
    ActivityName: z.string(),
    ActivitySeq: z.string(),
    DonationDate: z.string().nullable(),
    DonationTime: z.string(),
    DonationTimeDesc: z.string().optional(),
    EventType: z.number().int(),
    EventTypeCssClassName: z.string(),
    ActivityPlace: z.string(),
    ActivityPlaceDesc: z.string(),
    Tel: z.string().optional(),
    Desc: z.string().optional(),
    Pic: z.string().optional(),
    Icon: z.string(),
    BackgroundColor: z.string(),
    Pos: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    PanoPos: z.null().optional(),
    Url: z.null().optional(),
    Open: z.null().optional(),
    WaitCount: z.null().optional(),
  }),
)

const browserHeaders = {
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
}

function getHtmlTitle(html: string) {
  return html.match(/<title[^>]*>(.*?)<\/title>/is)?.[1]?.trim()
}

function getHtmlSnippet(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240)
}

function describeResponse(response: Response, html: string) {
  const title = getHtmlTitle(html)
  const snippet = getHtmlSnippet(html)
  return [
    `status ${response.status} ${response.statusText}`.trim(),
    title ? `title: ${title}` : undefined,
    snippet ? `body: ${snippet}` : undefined,
  ]
    .filter(Boolean)
    .join(', ')
}

function getCookieHeader(setCookieHeader: string | null) {
  return setCookieHeader
    ?.split(/,(?=\s*[^;,]+=)/)
    .map((cookie) => cookie.split(';')[0]?.trim())
    .filter(Boolean)
    .join('; ')
}

function requireMatch(
  value: string | undefined,
  name: string,
  response: Response,
  html: string,
) {
  if (!value) {
    throw new Error(
      `blood.org.tw did not return ${name}; received ${describeResponse(response, html)}`,
    )
  }

  return value
}

export const blood: Provider = {
  id: 'blood',
  resolve: async () => {
    const url = 'https://www.blood.org.tw/xcevent'

    const initialResponse = await fetch(url, {
      headers: browserHeaders,
    })
    const initialHtml = await initialResponse.text()
    if (!initialResponse.ok) {
      throw new Error(
        `blood.org.tw initial request failed; received ${describeResponse(initialResponse, initialHtml)}`,
      )
    }

    // ASP.NET anti-forgery uses a cookie+form token pair that must come from the same page load
    const cookieHeader = initialResponse.headers.get('set-cookie')
    const cookieTokenMatch = cookieHeader?.match(
      /__RequestVerificationToken=([^;]+)/,
    )
    requireMatch(
      cookieTokenMatch?.[1],
      'CSRF cookie token',
      initialResponse,
      initialHtml,
    )
    const cookies = requireMatch(
      getCookieHeader(cookieHeader),
      'response cookies',
      initialResponse,
      initialHtml,
    )

    const formTokenMatch = initialHtml.match(
      /name="__RequestVerificationToken"[^>]*value="([^"]*)"/,
    )
    const formToken = requireMatch(
      formTokenMatch?.[1],
      'CSRF form token',
      initialResponse,
      initialHtml,
    )

    const condsSIdMatch = initialHtml.match(
      /name="CondsSId"[^>]*value="([^"]*)"/,
    )
    const condsSId = requireMatch(
      condsSIdMatch?.[1],
      'CondsSId form value',
      initialResponse,
      initialHtml,
    )

    const today = new Date()
    const donationDateBegin =
      `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`

    const body = new URLSearchParams({
      __RequestVerificationToken: formToken,
      XsmSId: '',
      CondsSId: condsSId,
      ExecAction: '',
      IndexOfPages: '0',
      DonationDateBegin: donationDateBegin,
      DonationDateEnd: '',
      City: '',
      Display: 'Y',
      SearchEventKeyword: '',
      EventTypeValue: '',
      PageSize: '50',
    })

    const response = await fetch(url, {
      headers: {
        ...browserHeaders,
        'content-type': 'application/x-www-form-urlencoded',
        cookie: `${cookies}; FSize=M`,
        Referer: url,
      },
      method: 'POST',
      body,
    })
    const html = await response.text()
    if (!response.ok) {
      throw new Error(
        `blood.org.tw data request failed; received ${describeResponse(response, html)}`,
      )
    }

    const regex = /var\s+Data\s*=\s*(.+?);/
    const match = html.match(regex)
    const data = requireMatch(match?.[1], 'Data payload', response, html)
    const content = JSON.parse(data)
    const points = featuresSchema.parse(content)

    return featureCollection(
      points.map((point) =>
        feature(
          { type: 'Point', coordinates: [point.Pos.lng, point.Pos.lat] },
          point,
        ),
      ),
    )
  },
  idColumn(feature) {
    return feature.SId.Value
  },
  columnMap: {
    name: 'ActivityName',
    description: 'ActivityPlaceDesc',
    address: 'ActivityPlace',
    time: (point) => `${point.DonationDate} ${point.DonationTime}`,
  },
}
