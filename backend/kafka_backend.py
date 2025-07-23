from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from kafka import KafkaConsumer
import json
from datetime import datetime
from typing import List, Dict, Any
import os

app = FastAPI(title="Kafka Manufacturing API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://192.168.0.211:3000","http://192.168.0.211:9095"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Kafka 설정
KAFKA_BOOTSTRAP_SERVERS = "192.168.0.211:9095"  # Docker Kafka 주소
KAFKA_TOPIC = "near_realtime_crom_model"

# Kafka Consumer 초기화
consumer = None

def get_kafka_consumer():
    global consumer
    if consumer is None:
        consumer = KafkaConsumer(
            KAFKA_TOPIC,
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            value_deserializer=lambda x: json.loads(x.decode('utf-8')),
            auto_offset_reset='latest',
            enable_auto_commit=True,
            group_id='manufacturing_dashboard'
        )
    return consumer

@app.get("/")
async def root():
    return {
        "message": "Kafka Manufacturing API",
        "status": "running",
        "kafka_topic": KAFKA_TOPIC,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/metrics/realtime")
async def get_realtime_metrics():
    """실시간 Kafka 데이터 조회"""
    try:
        consumer = get_kafka_consumer()
        
        # 최신 메시지들 수집 (최대 10개)
        messages = []
        count = 0
        max_messages = 10
        
        # 메시지 폴링 (타임아웃 5초)
        for message in consumer:
            if count >= max_messages:
                break
                
            try:
                # 메시지 데이터 파싱
                data = message.value
                
                # 타임스탬프 추가
                if isinstance(data, dict):
                    data['kafka_timestamp'] = datetime.fromtimestamp(message.timestamp / 1000).isoformat()
                    data['kafka_offset'] = message.offset
                    data['kafka_partition'] = message.partition
                
                messages.append({
                    "offset": message.offset,
                    "timestamp": message.timestamp,
                    "partition": message.partition,
                    "value": data
                })
                count += 1
                
            except Exception as e:
                print(f"메시지 파싱 오류: {e}")
                continue
        
        return {
            "status": "success",
            "topic": KAFKA_TOPIC,
            "message_count": len(messages),
            "data": messages,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Kafka 데이터 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/metrics/latest")
async def get_latest_metric():
    """최신 Kafka 데이터 1개 조회"""
    try:
        consumer = get_kafka_consumer()
        
        # 최신 메시지 1개만 가져오기
        for message in consumer:
            try:
                data = message.value
                
                if isinstance(data, dict):
                    data['kafka_timestamp'] = datetime.fromtimestamp(message.timestamp / 1000).isoformat()
                    data['kafka_offset'] = message.offset
                    data['kafka_partition'] = message.partition
                
                return {
                    "status": "success",
                    "topic": KAFKA_TOPIC,
                    "data": data,
                    "timestamp": datetime.now().isoformat()
                }
                
            except Exception as e:
                print(f"메시지 파싱 오류: {e}")
                continue
        
        return {
            "status": "no_data",
            "message": "데이터가 없습니다",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Kafka 데이터 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status")
async def get_status():
    """서버 상태 확인"""
    try:
        consumer = get_kafka_consumer()
        topics = consumer.topics()  # 연결 테스트
        
        return {
            "status": "connected",
            "kafka_bootstrap_servers": KAFKA_BOOTSTRAP_SERVERS,
            "kafka_topic": KAFKA_TOPIC,
            "available_topics": list(topics),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "kafka_bootstrap_servers": KAFKA_BOOTSTRAP_SERVERS,
            "timestamp": datetime.now().isoformat()
        }

@app.get("/api/topics")
async def get_topics():
    """사용 가능한 Kafka 토픽 목록"""
    try:
        consumer = get_kafka_consumer()
        topics = consumer.topics()
        
        return {
            "topics": list(topics),
            "current_topic": KAFKA_TOPIC,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Kafka Manufacturing API...")
    print(f"📊 Kafka Topic: {KAFKA_TOPIC}")
    print(f"🌐 API: http://localhost:9000")
    uvicorn.run(app, host="0.0.0.0", port=9000) 