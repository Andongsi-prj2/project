import os
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# 데이터베이스 설정
DB_CONFIG = {
    "host": "192.168.0.222",
    "port": 3306,
    "user": "andong_if_master",
    "password": "andong_if_master_123!",
    "database": "data_mart"
}

# Gemini API 설정
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
print("GEMINI_API_KEY:", GEMINI_API_KEY)

# 불량 유형 매핑
DEFECT_TYPE_NAMES = {
    1: "과도도금 + 거칠기",
    2: "박리/미부착",
    3: "얼룩/부식"
}

# Flask 앱 설정
FLASK_CONFIG = {
    "debug": False,
    "host": "0.0.0.0",
    "port": 5000
} 