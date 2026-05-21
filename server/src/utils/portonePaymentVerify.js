/**
 * 포트원(아임포트) REST API로 결제 완료를 서버에서 재검증한다.
 * - merchant_uid(주문번호) 조회가 imp_uid 단건 조회보다 안정적이라 주문번호 기준으로 검증한다.
 * - imp_uid는 클라이언트가 보낸 값과 포트원 응답이 일치하는지 교차 확인용으로만 사용한다.
 */
const https = require('https');

const IAMPORT_HOST = 'api.iamport.kr';

/**
 * HTTPS JSON POST (Node 내장 모듈, 추가 패키지 없음)
 * @param {string} path
 * @param {object} body
 * @returns {Promise<object>}
 */
const httpsJsonPost = (path, body) =>
  new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      {
        hostname: IAMPORT_HOST,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => {
          raw += c;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(raw || '{}'));
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });

/**
 * @param {string} path
 * @param {string} accessToken
 * @returns {Promise<object>}
 */
const httpsJsonGet = (path, accessToken) =>
  new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: IAMPORT_HOST,
        path,
        method: 'GET',
        headers: {
          Authorization: accessToken,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => {
          raw += c;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(raw || '{}'));
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });

/** 환경변수에서 imp_key / imp_secret */
const getPortoneKeys = () => ({
  key: (process.env.PORTONE_IMP_KEY || process.env.IAMPORT_KEY || '').trim(),
  secret: (process.env.PORTONE_IMP_SECRET || process.env.IAMPORT_SECRET || '').trim(),
});

/**
 * 포트원 액세스 토큰 발급
 * @returns {Promise<string>}
 */
const getAccessToken = async () => {
  const { key, secret } = getPortoneKeys();
  const res = await httpsJsonPost('/users/getToken', { imp_key: key, imp_secret: secret });
  if (res.code !== 0 || !res.response?.access_token) {
    throw new Error(res.message || '포트원 액세스 토큰을 받지 못했습니다.');
  }
  return res.response.access_token;
};

/**
 * merchant_uid(주문번호)로 결제 단건 조회 — GET /payments/find/{merchant_uid}
 * @param {string} merchantUid
 * @returns {Promise<object>}
 */
const fetchPaymentByMerchantUid = async (merchantUid) => {
  const token = await getAccessToken();
  const encoded = encodeURIComponent(merchantUid);
  const res = await httpsJsonGet(`/payments/find/${encoded}`, token);
  if (res.code !== 0 || !res.response) {
    throw new Error(res.message || '결제 정보를 조회하지 못했습니다.');
  }
  return res.response;
};

/**
 * imp_uid로 결제 단건 조회 (일부 환경에서 실패할 수 있어 보조용)
 * @param {string} impUid
 * @returns {Promise<object>}
 */
const fetchPaymentByImpUid = async (impUid) => {
  const token = await getAccessToken();
  const encoded = encodeURIComponent(impUid);
  const res = await httpsJsonGet(`/payments/${encoded}`, token);
  if (res.code !== 0 || !res.response) {
    throw new Error(res.message || '결제 정보를 조회하지 못했습니다.');
  }
  return res.response;
};

/**
 * 결제 완료가 포트원·주문 정보와 일치하는지 검증
 * @param {string} impUid 클라이언트가 전달한 imp_uid (선택, 교차 검증)
 * @param {{ merchantUid: string, amount: number }} expected
 * @returns {Promise<void>}
 */
const assertPaidMatchesOrder = async (impUid, expected) => {
  if (!expected?.merchantUid) {
    throw new Error('결제 검증에 주문번호(merchant_uid)가 필요합니다.');
  }

  const p = await fetchPaymentByMerchantUid(expected.merchantUid);

  if (impUid && p.imp_uid && String(p.imp_uid) !== String(impUid)) {
    throw new Error('포트원 거래번호(imp_uid)가 이 주문의 결제 건과 일치하지 않습니다.');
  }

  if (p.status !== 'paid') {
    throw new Error(`포트원 결제 상태가 paid가 아닙니다(현재: ${p.status || '알 수 없음'}).`);
  }

  const paid = Number(p.amount);
  const want = Number(expected.amount);
  if (paid !== want) {
    throw new Error(`포트원 결제 금액(${paid}원)과 주문 금액(${want}원)이 일치하지 않습니다.`);
  }
};

/**
 * 검증을 건너뛸지 여부(로컬 데모용). true면 키 없이도 완료 처리 허용(비권장).
 */
const isVerifySkipped = () => process.env.PORTONE_SKIP_PAYMENT_VERIFY === 'true';

/**
 * 키가 설정되어 있는지
 */
const hasVerifyCredentials = () => {
  const { key, secret } = getPortoneKeys();
  return Boolean(key && secret);
};

/** 결제창 초기화용 고객사 식별코드 (REST 키와 동일 콘솔 가맹점) */
const getPortoneImpCode = () =>
  (process.env.PORTONE_IMP_CODE || process.env.IAMPORT_CODE || '').trim();

module.exports = {
  assertPaidMatchesOrder,
  isVerifySkipped,
  hasVerifyCredentials,
  fetchPaymentByImpUid,
  fetchPaymentByMerchantUid,
  getPortoneImpCode,
};
