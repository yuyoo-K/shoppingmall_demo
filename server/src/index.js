/**
 * Express 서버 진입점
 * - 환경 변수 로드, 미들웨어·API 라우트 등록, MongoDB 연결 후 서버 기동
 */
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 모든 API는 /api 접두사 사용
app.use('/api', routes);

app.use(errorHandler);

/** DB 연결 후 HTTP 서버를 시작한다 */
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    });
  } catch (error) {
    console.error('서버 시작에 실패했습니다:', error.message);
    process.exit(1);
  }
};

startServer();
