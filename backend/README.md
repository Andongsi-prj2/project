# 제조업 대시보드 FastAPI 백엔드

## 🚀 빠른 시작

### 1. 환경 설정
```bash
# Python 가상환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt
```

### 2. MySQL 데이터베이스 설정
```bash
# MySQL에 스키마 실행
mysql -u root -p < database_schema.sql
```

### 3. 환경 변수 설정
```bash
# .env 파일 생성
cp env_example.txt .env
# .env 파일에서 데이터베이스 연결 정보 수정
```

### 4. 서버 실행
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 📊 API 엔드포인트

### 실시간 지표
- `GET /api/metrics/realtime` - 실시간 생산 지표
- `GET /api/dashboard/summary` - 대시보드 요약 데이터

### 공장별 데이터
- `GET /api/factories/{factory_id}/data` - 특정 공장 데이터

### 품질 데이터
- `GET /api/quality/defects` - 결함 유형별 데이터

## 🔗 Power BI 연결 가이드

### 1. Power BI Desktop에서 연결
1. **데이터 가져오기** → **웹**
2. **URL 입력**: `http://localhost:8000/api/metrics/realtime`
3. **확인** 클릭

### 2. 자동 새로고침 설정
1. **파일** → **옵션 및 설정** → **데이터 새로고침**
2. **새로고침 빈도**: 5분
3. **시간대**: 한국 표준시

### 3. 주요 데이터 소스 URL
```
실시간 지표: http://localhost:8000/api/metrics/realtime
대시보드 요약: http://localhost:8000/api/dashboard/summary
공장별 데이터: http://localhost:8000/api/factories/1/data
결함 데이터: http://localhost:8000/api/quality/defects
```

## 📈 데이터 파이프라인

```
MySQL → FastAPI → Power BI → 프론트엔드
```

### 데이터 흐름:
1. **MySQL**: 원시 데이터 저장
2. **FastAPI**: 데이터 추출 및 API 제공
3. **Power BI**: 데이터 정제 및 시각화
4. **프론트엔드**: Power BI 대시보드 임베드

## 🔧 개발 도구

### API 문서
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 데이터베이스 관리
```bash
# MySQL 접속
mysql -u root -p manufacturing_db

# 테이블 확인
SHOW TABLES;

# 샘플 데이터 확인
SELECT * FROM production_data LIMIT 10;
```

## 📝 환경 변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `DATABASE_URL` | MySQL 연결 문자열 | `mysql+pymysql://user:pass@localhost/manufacturing_db` |
| `HOST` | 서버 호스트 | `0.0.0.0` |
| `PORT` | 서버 포트 | `8000` |

## 🚀 배포

### Docker 배포
```bash
# Docker 이미지 빌드
docker build -t manufacturing-api .

# 컨테이너 실행
docker run -p 8000:8000 manufacturing-api
```

### 프로덕션 설정
```bash
# Gunicorn으로 실행
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
``` 