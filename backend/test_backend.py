from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import json
import random

app = FastAPI(title="Test Manufacturing API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://192.168.0.211:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Test Manufacturing API",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/metrics/realtime")
async def get_realtime_metrics():
    """테스트용 실시간 데이터 생성"""
    try:
        # 테스트 데이터 생성 (실제 Kafka 데이터와 유사한 구조)
        test_data = []
        
        for i in range(5):
            data = {
                "IMAGE_FILE": f"KEMP_IMG_DATA_{random.randint(100, 999)}.png",
                "DETECTION": random.randint(0, 1),
                "DEFECTIVE_TYPE": random.randint(0, 3),
                "TEMP": round(random.uniform(35.0, 45.0), 2),
                "VOLTAGE": round(random.uniform(15.0, 20.0), 2),
                "PH": round(random.uniform(1.5, 2.5), 2),
                "kafka_timestamp": datetime.now().isoformat(),
                "kafka_offset": random.randint(1000, 9999),
                "kafka_partition": 0
            }
            test_data.append({
                "offset": data["kafka_offset"],
                "timestamp": int(datetime.now().timestamp() * 1000),
                "partition": 0,
                "value": data
            })
        
        return {
            "status": "success",
            "topic": "near_realtime_crom_model",
            "message_count": len(test_data),
            "data": test_data,
            "timestamp": datetime.now().isoformat(),
            "note": "테스트 데이터입니다. 실제 Kafka 연결이 필요합니다."
        }
        
    except Exception as e:
        print(f"테스트 데이터 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status")
async def get_status():
    """서버 상태 확인"""
    return {
        "status": "test_mode",
        "message": "테스트 모드로 실행 중입니다. Kafka 연결이 필요합니다.",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Test Manufacturing API...")
    print("📊 Mode: Test (No Kafka connection)")
    print("🌐 API: http://localhost:9000")
    uvicorn.run(app, host="0.0.0.0", port=9000) 