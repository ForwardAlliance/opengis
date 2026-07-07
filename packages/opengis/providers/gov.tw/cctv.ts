import { xml } from '../base/xml'
import { getStringProperty } from '../utils'

// MOTC RoadDirection codes → freeway conventions. Unknown codes fall back to
// the raw value so a new/unmapped direction never renders as blank.
const ROAD_DIRECTION: Record<string, string> = {
  N: '北上',
  S: '南下',
  E: '東向',
  W: '西向',
}

export const cctv = xml(
  {
    id: 'cctv',
    // 交通部高速公路局 CCTV 靜態資訊 (MOTC v2.0)
    url: 'https://tisvcloud.freeway.gov.tw/history/motc20/CCTV.xml',
    recordTag: 'CCTV',
    idColumn: 'CCTVID',
    columnMap: {
      name: (feature) => {
        const direction = getStringProperty(feature, 'RoadDirection')
        return [
          getStringProperty(feature, 'RoadName'),
          direction ? (ROAD_DIRECTION[direction] ?? direction) : null,
          getStringProperty(feature, 'LocationMile'),
        ]
          .filter(Boolean)
          .join(' ')
      },
      description: (feature) => {
        const start = getStringProperty(feature, 'Start')
        const end = getStringProperty(feature, 'End')
        return start && end ? `${start} - ${end}` : (start ?? end ?? '')
      },
      imageURL: 'VideoStreamURL',
    },
  },
  {
    x: 'PositionLon',
    y: 'PositionLat',
  },
)
