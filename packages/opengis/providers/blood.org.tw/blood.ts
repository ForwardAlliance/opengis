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

export const blood: Provider = {
  id: 'blood',
  resolve: async () => {
    const url = 'https://www.blood.org.tw/xcevent'

    const initialResponse = await fetch(url)
    const initialHtml = await initialResponse.text()

    // ASP.NET anti-forgery uses a cookie+form token pair that must come from the same page load
    const cookieHeader = initialResponse.headers.get('set-cookie')
    const cookieTokenMatch = cookieHeader?.match(
      /__RequestVerificationToken=([^;]+)/,
    )
    const cookieToken = cookieTokenMatch?.[1]

    const formTokenMatch = initialHtml.match(
      /name="__RequestVerificationToken"[^>]*value="([^"]*)"/,
    )
    const formToken = formTokenMatch?.[1]

    const condsSIdMatch = initialHtml.match(
      /name="CondsSId"[^>]*value="([^"]*)"/,
    )
    const condsSId = condsSIdMatch?.[1]

    const today = new Date()
    const donationDateBegin = encodeURIComponent(
      `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`,
    )

    const response = await fetch(url, {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        cookie: `__RequestVerificationToken=${cookieToken}; FSize=M`,
        Referer: url,
      },
      method: 'POST',
      body: `__RequestVerificationToken=${formToken}&XsmSId=&CondsSId=${condsSId}&ExecAction=&IndexOfPages=0&DonationDateBegin=${donationDateBegin}&DonationDateEnd=&City=&Display=Y&SearchEventKeyword=&EventTypeValue=&PageSize=50`,
    })
    const html = await response.text()

    const regex = /var\s+Data\s*=\s*(.+?);/
    const match = html.match(regex)
    const content = JSON.parse(match?.[1] ?? '')
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
}
