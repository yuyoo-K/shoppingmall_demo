/**
 * 클라이언트 공개 설정 — 포트원 결제창 식별코드 등 (비밀키는 노출하지 않음)
 */
const { getPortoneImpCode, hasVerifyCredentials } = require('../utils/portonePaymentVerify');

/** GET /api/config/portone — 결제창 IMP.init용 imp_code (REST API 키와 동일 가맹점) */
const getPortoneClientConfig = (req, res) => {
  const impCode = getPortoneImpCode();

  res.json({
    success: true,
    data: {
      impCode: impCode || null,
      hasServerVerifyKeys: hasVerifyCredentials(),
    },
  });
};

module.exports = {
  getPortoneClientConfig,
};
