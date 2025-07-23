from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
import pandas as pd
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from kafka import KafkaConsumer, KafkaProducer
import json
import asyncio
from typing import Dict, List, Any

load_dotenv()

app = FastAPI(title="Manufacturing Pipeline API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8088"],  # Next.js + Superset
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MySQL 연결 설정
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://roy9194:9194@3.38.2.58:3306")
engine = create_engine(DATABASE_URL)

# Kafka 설정
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
MANUFACTURING_TOPIC = "manufacturing-data"

# Kafka Producer 초기화
producer = None
consumer = None

def get_kafka_producer():
    global producer
    if producer is None:
        producer = KafkaProducer(
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
    return producer

def get_kafka_consumer():
    global consumer
    if consumer is None:
        consumer = KafkaConsumer(
            MANUFACTURING_TOPIC,
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            value_deserializer=lambda x: json.loads(x.decode('utf-8')),
            auto_offset_reset='latest',
            enable_auto_commit=True
        )
    return consumer

@app.get("/")
async def root():
    return {
        "message": "Manufacturing Pipeline API",
        "status": "running",
        "components": {
            "mysql": "connected",
            "kafka": "connected",
            "superset": "available at http://localhost:8088"
        }
    }

@app.get("/api/pipeline/status")
async def get_pipeline_status():
    """파이프라인 전체 상태 확인"""
    try:
        # MySQL 연결 확인
        mysql_status = "connected"
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
        except Exception as e:
            mysql_status = f"error: {str(e)}"
        
        # Kafka 연결 확인
        kafka_status = "connected"
        try:
            producer = get_kafka_producer()
            producer.flush()
        except Exception as e:
            kafka_status = f"error: {str(e)}"
        
        return {
            "mysql": mysql_status,
            "kafka": kafka_status,
            "superset": "http://localhost:8088",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/mysql/data/{database}/{table}")
async def get_mysql_data(database: str, table: str, limit: int = 100):
    """MySQL에서 데이터 조회"""
    if database not in ['DATA_MART', 'DATA_WAREHOUSE', 'MES']:
        raise HTTPException(status_code=400, detail="Invalid database name")
    
    try:
        with engine.connect() as conn:
            conn.execute(text(f"USE {database}"))
            
            # 테이블 구조 확인
            structure_query = text(f"DESCRIBE {table}")
            structure_result = conn.execute(structure_query)
            columns = [row[0] for row in structure_result]
            
            # 데이터 조회
            data_query = text(f"SELECT * FROM {table} LIMIT {limit}")
            data_result = conn.execute(data_query)
            
            data = []
            for row in data_result:
                row_dict = {}
                for i, col in enumerate(columns):
                    if 'img' in col.lower() or 'image' in col.lower():
                        row_dict[col] = f"Image data (length: {len(str(row[i])) if row[i] else 0})"
                    else:
                        row_dict[col] = row[i]
                data.append(row_dict)
            
            return {
                "source": "mysql",
                "database": database,
                "table": table,
                "columns": columns,
                "data": data,
                "count": len(data)
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/kafka/send")
async def send_to_kafka(data: Dict[str, Any]):
    """Kafka로 데이터 전송"""
    try:
        producer = get_kafka_producer()
        
        # 타임스탬프 추가
        data['timestamp'] = datetime.now().isoformat()
        data['source'] = 'api'
        
        # Kafka로 전송
        future = producer.send(MANUFACTURING_TOPIC, data)
        producer.flush()
        
        return {
            "message": "Data sent to Kafka successfully",
            "topic": MANUFACTURING_TOPIC,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/kafka/receive")
async def receive_from_kafka(limit: int = 10):
    """Kafka에서 데이터 수신"""
    try:
        consumer = get_kafka_consumer()
        
        messages = []
        count = 0
        
        # 최신 메시지들 수신
        for message in consumer:
            if count >= limit:
                break
            messages.append({
                "offset": message.offset,
                "timestamp": message.timestamp,
                "value": message.value
            })
            count += 1
        
        return {
            "source": "kafka",
            "topic": MANUFACTURING_TOPIC,
            "messages": messages,
            "count": len(messages)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/pipeline/combined")
async def get_combined_data():
    """MySQL과 Kafka 데이터 통합 조회"""
    try:
        # MySQL 데이터 조회
        mysql_data = []
        for db in ['DATA_MART', 'DATA_WAREHOUSE']:
            try:
                with engine.connect() as conn:
                    conn.execute(text(f"USE {db}"))
                    query = text("SELECT * FROM CROM LIMIT 5")
                    result = conn.execute(query)
                    
                    for row in result:
                        mysql_data.append({
                            "source": "mysql",
                            "database": db,
                            "data": dict(row._mapping)
                        })
            except Exception as e:
                print(f"Error querying {db}: {e}")
        
        # Kafka 데이터 조회 (최근 5개)
        kafka_data = []
        try:
            consumer = get_kafka_consumer()
            count = 0
            for message in consumer:
                if count >= 5:
                    break
                kafka_data.append({
                    "source": "kafka",
                    "data": message.value
                })
                count += 1
        except Exception as e:
            print(f"Error reading from Kafka: {e}")
        
        return {
            "mysql_data": mysql_data,
            "kafka_data": kafka_data,
            "total_mysql": len(mysql_data),
            "total_kafka": len(kafka_data),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/superset/connection")
async def get_superset_connection_info():
    """Superset 연결 정보"""
    return {
        "superset_url": "http://localhost:8088",
        "api_endpoints": {
            "mysql_data": "/api/mysql/data/{database}/{table}",
            "kafka_data": "/api/kafka/receive",
            "combined_data": "/api/pipeline/combined"
        },
        "databases": ["DATA_MART", "DATA_WAREHOUSE", "MES"],
        "tables": ["CROM", "CROM_img", "batch_control", "realtime_result"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 