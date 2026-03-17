import { csv } from '../base/csv'

export const shelters = csv(
  {
    id: 'shelters',
    url: 'https://opdadm.moi.gov.tw/api/v1/no-auth/resource/api/dataset/ED6CF735-6C03-4573-A882-72C1BEC799CB/resource/54550E2F-4567-4C8F-BD2E-E54E9D0386B8/download',
  },
  {
    x: '經度',
    y: '緯度',
  },
)
