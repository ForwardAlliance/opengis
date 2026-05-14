import { csv } from '../base/csv'
import { getStringProperty } from '../utils'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

export const aed = csv(
  {
    id: 'AED',
    url: 'https://tw-aed.mohw.gov.tw/openData?t=csv',
    columnMap: {
      name: '場所名稱',
      address: '場所地址',
      phone: '開放時間緊急連絡電話',
      time: (feature) => {
        const monToFriFrom = getStringProperty(feature, '周一至周五起')
        const monToFriTo = getStringProperty(feature, '周一至周五迄')
        const satFrom = getStringProperty(feature, '周六起')
        const satTo = getStringProperty(feature, '周六迄')
        const sunFrom = getStringProperty(feature, '周日起')
        const sunTo = getStringProperty(feature, '周日迄')

        return `一：${monToFriFrom}-${monToFriTo}
二：${monToFriFrom}-${monToFriTo}
三：${monToFriFrom}-${monToFriTo}
四：${monToFriFrom}-${monToFriTo}
五：${monToFriFrom}-${monToFriTo}
六：${satFrom === '' ? '休' : `${satFrom}-${satTo}`}
日：${sunFrom === '' ? '休' : `${sunFrom}-${sunTo}`}`
      },
    },
    idColumn: 'AEDID',
  },
  {
    x: '地點LNG',
    y: '地點LAT',
  },
)
