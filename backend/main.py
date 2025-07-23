from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import pandas as pd
from datetime import datetime, timedelta
import os
import json
from dotenv import load_dotenv
from kafka import KafkaConsumer
import base64

load_dotenv()

app = FastAPI(title="Manufacturing Dashboard API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://192.168.0.211:3000","http://192.168.0.211:9095"],  # Next.js 프론트엔드
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MySQL 연결 설정
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://user:password@localhost/manufacturing_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 데이터베이스 세션 의존성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
async def root():
    return {"message": "Manufacturing Dashboard API"}

@app.get("/api/metrics/realtime")
async def get_realtime_metrics():
    """실시간 생산 지표 조회"""
    try:
        # Kafka Consumer로 실제 데이터 수신
        print(f"Kafka 연결 시도: 192.168.0.211:9095, 토픽: near_realtime_crom_model")
        consumer = KafkaConsumer(
            'near_realtime_crom_model',
            bootstrap_servers=['192.168.0.211:9095'],
            auto_offset_reset='latest',
            enable_auto_commit=True,
            consumer_timeout_ms=1000,  # 1초로 줄여서 빠른 응답
            #group_id='manufacturing_dashboard'
        )
        
        # 최신 메시지 하나만 가져오기
        messages = []
        try:
            for message in consumer:
                try:
                    raw_data = message.value.decode('utf-8')
                    decoded_data = json.loads(raw_data)

                    # 예시: 'image_base64'라는 필드가 있을 때 디코딩
                    if 'image_base64' in decoded_data:
                        decoded_bytes = base64.b64decode(decoded_data['image_base64'])
                        decoded_data['image_bytes'] = decoded_bytes  # 혹은 저장/파일로 변환

                    messages.append(decoded_data)
                    break  # 첫 메시지만 처리
                except Exception as e:
                    print(f"메시지 파싱 오류: {e}")
                    continue
        except Exception as e:
            print(f"Kafka 메시지 수신 타임아웃: {e}")

        consumer.close()
        
        if messages:
            # 실제 Kafka 데이터 반환
            print(f"Kafka 데이터 수신 성공: {len(messages)}개 메시지")
            return {
                "data": messages,
                "message": "실시간 Kafka 데이터 로드 완료",
                "status": "success"
            }
        else:
            # Kafka 데이터가 없을 때 빈 데이터 반환
            print("Kafka 데이터 없음")
            return {
                "data": [],
                "message": "데이터가 없습니다",
                "status": "no_data"
            }
            
    except Exception as e:
        print(f"Kafka 연결 오류: {e}")
        # 오류 시 빈 데이터 반환
        return {
            "data": [],
            "message": f"연결 오류: {str(e)}",
            "status": "error"
        }

@app.get("/api/factories/{factory_id}/data")
async def get_factory_data(factory_id: int):
    """특정 공장의 데이터 조회"""
    try:
        with engine.connect() as conn:
            # 공장별 생산 데이터
            query = text("""
                SELECT 
                    DATE(production_date) as date,
                    SUM(quantity) as daily_quantity,
                    AVG(quality_score) as daily_quality
                FROM production_data 
                WHERE factory_id = :factory_id 
                AND production_date >= NOW() - INTERVAL 30 DAY
                GROUP BY DATE(production_date)
                ORDER BY date
            """)
            result = conn.execute(query, {"factory_id": factory_id})
            data = [{"date": row[0], "quantity": row[1], "quality": float(row[2])} for row in result]
            
            return {"factory_id": factory_id, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/quality/defects")
async def get_defect_data():
    """결함 유형별 데이터 조회"""
    try:
        with engine.connect() as conn:
            query = text("""
                SELECT 
                    defect_type,
                    SUM(defect_count) as total_defects,
                    SUM(total_inspected) as total_inspected
                FROM quality_data 
                WHERE inspection_date >= NOW() - INTERVAL 7 DAY
                GROUP BY defect_type
            """)
            result = conn.execute(query)
            data = [{"type": row[0], "defects": row[1], "inspected": row[2]} for row in result]
            
            return {"defects": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/summary")
async def get_dashboard_summary():
    """대시보드 요약 데이터"""
    try:
        with engine.connect() as conn:
            # 전체 요약 데이터
            summary_query = text("""
                SELECT 
                    (SELECT COUNT(*) FROM production_data WHERE production_date >= NOW() - INTERVAL 24 HOUR) as daily_products,
                    (SELECT AVG(quality_score) FROM production_data WHERE production_date >= NOW() - INTERVAL 24 HOUR) as daily_quality,
                    (SELECT COUNT(*) FROM factories WHERE status = 'active') as active_factories,
                    (SELECT SUM(quantity) FROM production_data WHERE production_date >= NOW() - INTERVAL 24 HOUR) as daily_quantity
            """)
            result = conn.execute(summary_query)
            summary = result.fetchone()
            
            return {
                "daily_products": summary[0] or 0,
                "daily_quality": float(summary[1] or 0),
                "active_factories": summary[2] or 0,
                "daily_quantity": summary[3] or 0,
                "last_updated": datetime.now().isoformat()
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 