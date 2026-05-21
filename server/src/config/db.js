/**
 * MongoDB 연결 설정
 * - mongodb_atlas_url이 있으면 Atlas 우선, 없을 때만 로컬 URI 사용
 * - mongodb+srv는 SRV DNS 조회가 필요해, 일부 ISP DNS 거부 시 공용 DNS로 우회한다.
 */
const dns = require('dns');
const mongoose = require('mongoose');

/** mongodb_atlas_url 미설정 시 사용하는 로컬 MongoDB */
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/shopingmall?retryWrites=false';

/** .env Atlas 연결 문자열 키 */
const ATLAS_ENV_KEYS = [
  'mongodb_atlas_url',
  'mongodb_altas_url',
  'MONGODB_ATLAS_URL',
  'MONGODB_ALTAS_URL',
];

/** mongodb+srv SRV 조회용 공용 DNS (통신사 DNS가 querySrv ECONNREFUSED 할 때) */
const PUBLIC_DNS_SERVERS = ['8.8.8.8', '8.8.4.4', '1.1.1.1'];

/**
 * 연결 문자열에 retryWrites=false 추가(또는 true → false 치환)
 * @param {string} uri
 * @returns {string}
 */
const withRetryWritesDisabled = (uri) => {
  if (!uri || typeof uri !== 'string') return uri;
  if (/[?&]retryWrites\s*=\s*false\b/i.test(uri)) return uri.trim();
  if (/[?&]retryWrites\s*=\s*true\b/i.test(uri)) {
    return uri.replace(/([?&]retryWrites\s*=\s*)true\b/i, '$1false').trim();
  }
  const trimmed = uri.trim();
  const sep = trimmed.includes('?') ? '&' : '?';
  return `${trimmed}${sep}retryWrites=false`;
};

/** Atlas URL 우선, 없으면 로컬 */
const resolveMongoUri = () => {
  for (const key of ATLAS_ENV_KEYS) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return LOCAL_MONGODB_URI;
};

/** Atlas SRV 연결 전 Node DNS를 공용 서버로 설정 */
const prepareAtlasDns = (uri) => {
  if (!uri.includes('mongodb+srv')) return;
  dns.setServers(PUBLIC_DNS_SERVERS);
};

/** querySrv 실패 시 사용자 안내용 메시지 */
const formatConnectError = (error, target) => {
  const msg = error?.message || String(error);
  if (/querySrv\s+ECONNREFUSED/i.test(msg)) {
    return [
      'MongoDB Atlas DNS(SRV) 조회에 실패했습니다.',
      '· Windows DNS를 8.8.8.8 등으로 바꾸거나',
      '· Atlas에서 mongodb:// 형식 연결 문자열을 사용하거나',
      '· 임시로 .env의 mongodb_atlas_url을 주석 처리해 로컬 MongoDB를 사용하세요.',
      `(원본: ${msg})`,
    ].join('\n');
  }
  return `${target} 연결 실패: ${msg}`;
};

/** 환경 변수 기준으로 MongoDB에 연결한다 */
const connectDB = async () => {
  const raw = resolveMongoUri();
  const uri = withRetryWritesDisabled(raw);
  const target = raw.includes('mongodb+srv') ? 'MongoDB Atlas' : '로컬 MongoDB';

  prepareAtlasDns(uri);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      retryWrites: false,
    });
    console.log(`MongoDB에 연결되었습니다. (${target})`);
  } catch (error) {
    throw new Error(formatConnectError(error, target));
  }
};

module.exports = connectDB;
module.exports.resolveMongoUri = resolveMongoUri;
module.exports.LOCAL_MONGODB_URI = LOCAL_MONGODB_URI;
