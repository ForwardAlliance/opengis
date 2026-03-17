import { csv } from '../base/csv'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

export const aed = csv(
  { id: 'AED', url: 'https://tw-aed.mohw.gov.tw/openData?t=csv' },
  {
    x: '地點LNG',
    y: '地點LAT',
  },
)
