from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Test Server Running"}

@app.get("/api/metrics/realtime")
async def get_realtime_metrics():
    """실시간 생산 지표 조회"""
    return {
        "data": [
            {
                "timestamp": datetime.now().isoformat(),
                "total_products": 1250,
                "avg_quality": 94.5,
                "total_quantity": 5000,
                "active_factories": 3,
                "temperature": "TEMP_23.5C",
                "voltage": "VOLTAGE_220V",
                "ph_level": "PH_7.2",
                "status": "1"
            }
        ],
        "message": "실시간 데이터 로드 완료",
        "status": "success"
    }

if __name__ == "__main__":
    import uvicorn
    print("서버를 시작합니다... http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000) 