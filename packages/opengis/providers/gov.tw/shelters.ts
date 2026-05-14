import { csv } from '../base/csv'
import { getStringProperty } from '../utils'

export const shelters = csv(
  {
    id: 'shelters',
    url: 'https://opdadm.moi.gov.tw/api/v1/no-auth/resource/api/dataset/ED6CF735-6C03-4573-A882-72C1BEC799CB/resource/54550E2F-4567-4C8F-BD2E-E54E9D0386B8/download',
    columnMap: {
      name: '避難收容處所名稱',
      address: (feature) =>
        `${getStringProperty(feature, '縣市及鄉鎮市區')}${getStringProperty(feature, '村里')}${getStringProperty(feature, '避難收容處所地址')}`,
      phone: '管理人電話',
    },
    idColumn: '序號',
  },
  {
    x: '經度',
    y: '緯度',
  },
)
