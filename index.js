require('dotenv').config(); // dotenv 초기화 추가

const serverless = require('serverless-http');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

const apiKey = '6d4f457a686b776837306f79424b41';

/*
// API 키 설정
const proxyOptions = {
    target: 'http://openapi.seoul.go.kr:8088/', // 프록시할 대상 서버 주소
    changeOrigin: true, // 대상 서버의 오리진을 변경
    pathRewrite: {
        '^/base-url': `/${apiKey}/json/ListNecessariesPricesService/` // 요청 URL 변경
    }
};


app.use('/base-url', createProxyMiddleware(proxyOptions));
*/

app.use(bodyParser.json());

// CORS 설정
const corsOptions = {
  origin: '*', // 모든 도메인에서 요청 허용
  methods: 'GET', // GET 요청만 허용
};
app.use(cors(corsOptions));

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


app.get('/base-url', cors(corsOptions), async (req, res) => {
    try {
        const promises = [];
        // 5번의 요청을 생성하여 각각의 요청에 대한 프로미스를 생성합니다.
        for (let i = 0; i < 5; i++) {
            const startIdx = i * 1000 + 1;
            const endIdx = (i + 1) * 1000;
            const url = `http://openapi.seoul.go.kr:8088/${apiKey}/json/ListNecessariesPricesService/${startIdx}/${endIdx}`;
            promises.push(axios.get(url));
        }

        // 각각의 요청을 병렬로 실행하고 모든 응답을 기다립니다.
        const responses = await Promise.all(promises);

        // 응답 데이터를 클라이언트에게 전달합니다.
        const responseData = responses.map(response => response.data);
        res.json(responseData);
    } catch (error) {
        console.error('Error fetching data from the API:', error);
        res.status(500).json({ error: 'Failed to fetch data from the API' });
    }
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
