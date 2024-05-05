require('dotenv').config(); // dotenv 초기화 추가

const serverless = require('serverless-http');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());

// CORS 설정
const corsOptions = {
  origin: '*', // 모든 도메인에서 요청 허용
  methods: 'GET', // GET 요청만 허용
};
app.use(cors(corsOptions));

// API 키 설정
const apiKey = '6d4f457a686b776837306f79424b41';

// 백엔드 API 엔드포인트 - CORS 설정 추가
app.get('/weather', cors(corsOptions), async (req, res) => {
    try {
        // 서버 측에서 API 호출
        const response = await axios.get(`http://openapi.seoul.go.kr:8088/${apiKey}/json/citydata/1/5/광화문·덕수궁`);

        // API 응답을 클라이언트에게 전달
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Failed to fetch weather data from the API' });
    }
});

// generateUrls 엔드포인트 - batchUrls 생성하여 전송
app.get('/generateUrls', (req, res) => {
    const baseUrl = `http://openapi.seoul.go.kr:8088/${apiKey}/json/ListNecessariesPricesService/`;
    const totalDataCount = 5000;
    const batchSize = 1000;
    const batchUrls = [];

    for (let i = 0; i < totalDataCount; i += batchSize) {
        const url = `${baseUrl}${i + 1}/${Math.min(i + batchSize, totalDataCount)}/`;
        batchUrls.push(url);
    }

    res.json({ batchUrls });
});

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 루트 경로에 대한 요청 처리
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 시작
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Express 서버 열기
//module.exports.handler = serverless(app);
