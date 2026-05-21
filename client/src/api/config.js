/**
 * 공개 설정 API
 */
import api from '@/api/axios'

/** 포트원 결제창용 imp_code (서버 .env PORTONE_IMP_CODE) */
export const fetchPortoneConfig = async () => {
  const { data } = await api.get('/config/portone')
  return data
}
