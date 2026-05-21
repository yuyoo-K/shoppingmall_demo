/**
 * 포트원(구 아임포트) v1 JS SDK 연동용 설정
 * - pg만 단독으로 넘기면 콘솔 설정과 맞지 않아 "pg 파라미터로 잘못된 값" 오류가 날 수 있음
 * - KG이니시스(html5)는 문서 기준 `html5_inicis.{PG상점아이디}` 권장, 테스트 MID는 보통 INIpayTest
 * - 콘솔에서 채널키를 쓰는 경우 `VITE_PORTONE_CHANNEL_KEY`로 pg 대체 가능
 */

/**
 * 고객사 식별코드(imp 로 시작)
 * - VITE_PORTONE_IMP_CODE 우선
 * - 없으면 resolvePortOneImpCode()로 서버 /config/portone 에서 조회한 값 사용
 */
let resolvedImpCodeFromServer = ''

export const setPortOneImpCodeFromServer = (code) => {
  resolvedImpCodeFromServer = code ? String(code).trim() : ''
}

export const getPortOneImpCode = () =>
  import.meta.env.VITE_PORTONE_IMP_CODE?.trim() || resolvedImpCodeFromServer || ''

/**
 * 결제 채널키(콘솔 → 결제 연동 → 채널 관리). 설정 시 request_pay에 channelKey를 넣고 pg는 생략한다.
 * @returns {string}
 */
export const getPortOneChannelKey = () => import.meta.env.VITE_PORTONE_CHANNEL_KEY?.trim() || ''

/** KG이니시스 일반결제용 상점 MID — 기본 INIpayTest(포트원/이니시스 샘플에서 흔히 사용) */
export const getPortOneInicisMid = () =>
  import.meta.env.VITE_PORTONE_INICIS_MID?.trim() || 'INIpayTest'

/** 이니시스 HTML5 PG 식별 문자열 (MID 포함) */
export const getInicisHtml5Pg = () => `html5_inicis.${getPortOneInicisMid()}`

/**
 * 결제 수단별 request_pay용 pg / pay_method
 * @param {string} method — order.js payment_method 와 동일 (card, bank_transfer, kakao_pay, naver_pay)
 * @returns {{ pg?: string, pay_method: string }}
 */
export const getPortOnePaymentParams = (method) => {
  const inicisPg = getInicisHtml5Pg()

  if (method === 'kakao_pay') {
    const customPg = import.meta.env.VITE_PORTONE_KAKAO_PG?.trim()
    return { pg: customPg || 'kakaopay', pay_method: 'card' }
  }
  if (method === 'naver_pay') {
    const customPg = import.meta.env.VITE_PORTONE_NAVER_PG?.trim()
    return { pg: customPg || 'naverpay', pay_method: 'card' }
  }
  if (method === 'bank_transfer') {
    return { pg: inicisPg, pay_method: 'trans' }
  }
  return { pg: inicisPg, pay_method: 'card' }
}

/**
 * channelKey 사용 시 pg와 동시에 넣지 않기 위한 헬퍼
 * @param {Record<string, unknown>} base — pg, pay_method 포함 가능
 * @returns {Record<string, unknown>}
 */
export const applyPortOneChannelOrPg = (base) => {
  const channelKey = getPortOneChannelKey()
  if (!channelKey) return base
  const { pg: _omitPg, ...rest } = base
  return { ...rest, channelKey }
}
