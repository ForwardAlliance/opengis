import { csv } from '../base/csv'

export const fireStations = csv(
  {
    id: 'fire-stations',
    url: 'https://opdadm.moi.gov.tw/api/v1/no-auth/resource/api/dataset/57F3DD1D-A40E-49A6-8410-57303B2FF87E/resource/C38B7AC2-E7F3-4DD5-A3F3-88E623B55924/download',
    encoding: 'big5',
    // No id column in the source; key on name + address (unique and stable) for
    // downstream upserts.
    idColumn: (feature) => `${feature['消防隊名稱'] ?? ''}|${feature['地址'] ?? ''}`,
    columnMap: {
      name: '消防隊名稱',
      address: '地址',
      phone: '聯絡電話',
    },
  },
  {
    // Header claims TWD97TM121, but the values are WGS84 degrees, so no crs.
    x: 'X座標_TWD97TM121',
    y: 'Y座標_TWD97TM121',
  },
)
