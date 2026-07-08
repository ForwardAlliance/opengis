import proj4 from 'proj4'
import { csv } from '../base/csv'

// The source ships coordinates in TWD97 / TM2 (EPSG:3826), which proj4 does not
// know by default; register it so pointFeatures can reproject to WGS84.
proj4.defs(
  'EPSG:3826',
  '+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
)

export const police = csv(
  {
    id: 'police',
    // 各縣(市)警察(分)局暨所屬分駐(派出)所地址資料 — data.gov.tw dataset 5958.
    // The URL returns a zip whose CSV filename is date-stamped, so match by pattern.
    url: 'https://www.tgos.tw/tgos/VirtualDir/Product/9927eb8a-efed-40c0-8bc4-83121ad6834a/1150629.zip',
    zipEntry: /PoliceAddress.*\.csv$/,
    columnMap: {
      name: '中文單位名稱',
      address: '地址',
      phone: '電話',
    },
  },
  {
    x: 'POINT_X',
    y: 'POINT_Y',
    crs: 'EPSG:3826',
  },
)
