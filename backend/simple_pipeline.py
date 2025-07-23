from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
import pandas as pd
from datetime import datetime
import json
from typing import Dict, Any

app = FastAPI(title="Simple Manufacturing Pipeline", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8088"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MySQL 연결 설정
DATABASE_URL = "mysql+pymysql://roy9194:9194@3.38.2.58:3306"
engine = create_engine(DATABASE_URL)

@app.get("/")
async def root():
    return {
        "message": "Simple Manufacturing Pipeline API",
        "status": "running",
        "mysql": "connected to 3.38.2.58:3306",
        "superset": "available at http://localhost:8088"
    }

@app.get("/api/status")
async def get_status():
    """연결 상태 확인"""
    try:
        # MySQL 연결 확인
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        return {
            "mysql": "connected",
            "superset": "http://localhost:8088",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "mysql": f"error: {str(e)}",
            "superset": "http://localhost:8088",
            "timestamp": datetime.now().isoformat()
        }

@app.get("/api/databases")
async def get_databases():
    """데이터베이스 목록 조회"""
    try:
        with engine.connect() as conn:
            query = text("""
                SELECT 
                    table_schema as database_name,
                    table_name,
                    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb,
                    table_rows as row_count
                FROM information_schema.tables 
                WHERE table_schema IN ('DATA_MART', 'DATA_WAREHOUSE', 'MES')
                ORDER BY table_schema, table_name
            """)
            result = conn.execute(query)
            
            databases = {}
            for row in result:
                db_name = row[0]
                if db_name not in databases:
                    databases[db_name] = []
                
                databases[db_name].append({
                    "table": row[1],
                    "size_mb": row[2],
                    "row_count": row[3]
                })
            
            return {"databases": databases}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/{database}/{table}")
async def get_data(database: str, table: str, limit: int = 10):
    """특정 테이블 데이터 조회"""
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
                "database": database,
                "table": table,
                "columns": columns,
                "data": data,
                "count": len(data)
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/summary")
async def get_summary():
    """전체 요약 정보"""
    try:
        with engine.connect() as conn:
            query = text("""
                SELECT 
                    table_schema as database_name,
                    COUNT(*) as table_count,
                    SUM(table_rows) as total_rows,
                    ROUND(SUM((data_length + index_length) / 1024 / 1024), 2) AS total_size_mb
                FROM information_schema.tables 
                WHERE table_schema IN ('DATA_MART', 'DATA_WAREHOUSE', 'MES')
                GROUP BY table_schema
                ORDER BY total_size_mb DESC
            """)
            result = conn.execute(query)
            
            summary = []
            for row in result:
                summary.append({
                    "database": row[0],
                    "table_count": row[1],
                    "total_rows": row[2] or 0,
                    "total_size_mb": row[3] or 0
                })
            
            return {
                "summary": summary,
                "total_databases": len(summary),
                "last_updated": datetime.now().isoformat()
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/superset")
async def get_superset_info():
    """Superset 연결 정보"""
    return {
        "superset_url": "http://localhost:8088",
        "api_endpoints": {
            "databases": "/api/databases",
            "data": "/api/data/{database}/{table}",
            "summary": "/api/summary"
        },
        "databases": ["DATA_MART", "DATA_WAREHOUSE", "MES"],
        "tables": ["CROM", "CROM_img", "batch_control", "realtime_result"]
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Simple Manufacturing Pipeline API...")
    print("📊 MySQL: 3.38.2.58:3306")
    print("📈 Superset: http://localhost:8088")
    print("🌐 API: http://localhost:8002")
    uvicorn.run(app, host="0.0.0.0", port=8002) 