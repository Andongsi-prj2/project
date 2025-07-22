from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import pandas as pd
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Manufacturing Dashboard API (Existing DB)", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js 프론트엔드
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MySQL 연결 설정 (기존 데이터베이스)
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://roy9194:9194@3.38.2.58:3306")
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
    return {"message": "Manufacturing Dashboard API - Connected to Existing DB"}

@app.get("/api/databases/info")
async def get_database_info():
    """기존 데이터베이스 정보 조회"""
    try:
        with engine.connect() as conn:
            # 데이터베이스 목록 조회
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

@app.get("/api/data/crom/{database}")
async def get_crom_data(database: str):
    """CROM 테이블 데이터 조회 (DATA_MART, DATA_WAREHOUSE, MES 중 선택)"""
    if database not in ['DATA_MART', 'DATA_WAREHOUSE', 'MES']:
        raise HTTPException(status_code=400, detail="Invalid database name")
    
    try:
        with engine.connect() as conn:
            # 데이터베이스 선택
            conn.execute(text(f"USE {database}"))
            
            # CROM 테이블 구조 확인
            structure_query = text("DESCRIBE CROM")
            structure_result = conn.execute(structure_query)
            columns = [row[0] for row in structure_result]
            
            # 샘플 데이터 조회 (처음 100개 행)
            data_query = text("SELECT * FROM CROM LIMIT 100")
            data_result = conn.execute(data_query)
            
            data = []
            for row in data_result:
                row_dict = {}
                for i, col in enumerate(columns):
                    row_dict[col] = row[i]
                data.append(row_dict)
            
            return {
                "database": database,
                "table": "CROM",
                "columns": columns,
                "data": data,
                "total_rows": len(data)
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/crom_img/{database}")
async def get_crom_img_data(database: str):
    """CROM_img 테이블 데이터 조회"""
    if database not in ['DATA_MART', 'DATA_WAREHOUSE', 'MES']:
        raise HTTPException(status_code=400, detail="Invalid database name")
    
    try:
        with engine.connect() as conn:
            # 데이터베이스 선택
            conn.execute(text(f"USE {database}"))
            
            # CROM_img 테이블 구조 확인
            structure_query = text("DESCRIBE CROM_img")
            structure_result = conn.execute(structure_query)
            columns = [row[0] for row in structure_result]
            
            # 샘플 데이터 조회 (처음 50개 행 - 이미지 데이터는 크기가 클 수 있음)
            data_query = text("SELECT * FROM CROM_img LIMIT 50")
            data_result = conn.execute(data_query)
            
            data = []
            for row in data_result:
                row_dict = {}
                for i, col in enumerate(columns):
                    # 이미지 데이터는 너무 크므로 경로만 반환
                    if 'img' in col.lower() or 'image' in col.lower():
                        row_dict[col] = f"Image data (length: {len(str(row[i])) if row[i] else 0})"
                    else:
                        row_dict[col] = row[i]
                data.append(row_dict)
            
            return {
                "database": database,
                "table": "CROM_img",
                "columns": columns,
                "data": data,
                "total_rows": len(data)
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/metrics/summary")
async def get_metrics_summary():
    """전체 데이터베이스 요약 지표"""
    try:
        with engine.connect() as conn:
            # 각 데이터베이스의 테이블 크기 및 행 수 요약
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

@app.get("/api/data/sample/{database}/{table}")
async def get_sample_data(database: str, table: str):
    """특정 데이터베이스의 특정 테이블에서 샘플 데이터 조회"""
    if database not in ['DATA_MART', 'DATA_WAREHOUSE', 'MES']:
        raise HTTPException(status_code=400, detail="Invalid database name")
    
    if table not in ['CROM', 'CROM_img']:
        raise HTTPException(status_code=400, detail="Invalid table name")
    
    try:
        with engine.connect() as conn:
            # 데이터베이스 선택
            conn.execute(text(f"USE {database}"))
            
            # 테이블 구조 확인
            structure_query = text(f"DESCRIBE {table}")
            structure_result = conn.execute(structure_query)
            columns = [row[0] for row in structure_result]
            
            # 샘플 데이터 조회
            limit_count = 20 if table == 'CROM' else 10  # 이미지 테이블은 더 적게
            data_query = text(f"SELECT * FROM {table} LIMIT {limit_count}")
            data_result = conn.execute(data_query)
            
            data = []
            for row in data_result:
                row_dict = {}
                for i, col in enumerate(columns):
                    # 이미지 컬럼은 데이터 길이만 표시
                    if 'img' in col.lower() or 'image' in col.lower():
                        row_dict[col] = f"Image data (length: {len(str(row[i])) if row[i] else 0})"
                    else:
                        row_dict[col] = row[i]
                data.append(row_dict)
            
            return {
                "database": database,
                "table": table,
                "columns": columns,
                "sample_data": data,
                "sample_count": len(data)
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 