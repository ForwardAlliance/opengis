import { csv } from '../base/csv'

export const disasterResponseCenters = csv(
  {
    id: 'disaster-response-centers',
    url: 'https://opdadm.moi.gov.tw/api/v1/no-auth/resource/api/dataset/57F3DD1D-A40E-49A6-8410-57303B2FF87E/resource/A570EB3B-AF83-41F2-9E38-D114B0AB1F32/download',
    columnMap: {
      name: '名稱',
      address: '地址',
      phone: '電話',
      description: '是否與消防局同位置',
    },
  },
  {
    x: '經度',
    y: '緯度',
  },
)
