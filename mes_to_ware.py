import pymysql
import pandas as pd
import base64
from datetime import datetime

# ----------------------- 원본 DB 연결 (mes) -----------------------
def get_mes_connection():
    """MySQL mes DB 연결"""
    return pymysql.connect(
        host="opyter.iptime.org",
        port=13306,
        user="data_if_master",
        password="data_if_master123!",
        database="mes",
        charset="utf8mb4"
    )

# ----------------------- DW DB 연결 (data_warehouse) -----------------------
def get_dw_connection():
    """MySQL data_warehouse DB 연결"""
    return pymysql.connect(
        host="opyter.iptime.org",
        port=13306,
        user="data_if_master",
        password="data_if_master123!",
        database="data_warehouse",
        charset="utf8mb4"
    )

# ----------------------- 데이터 조회 -----------------------
def fetch_data(query: str, conn) -> pd.DataFrame:
    """지정된 커넥션으로 쿼리 실행 후 DataFrame 반환"""
    try:
        df = pd.read_sql(query, conn)
        return df
    except Exception as e:
        print("❌ SQL 실행 중 오류 발생:", e)
        return pd.DataFrame()

# ----------------------- base64 디코딩 (IMG 컬럼만) -----------------------
def decode_img_column(df: pd.DataFrame) -> pd.DataFrame:
    """IMG 컬럼(base64)을 디코딩하여 원본 binary로 치환"""
    def safe_decode(val):
        try:
            return base64.b64decode(val)
        except Exception:
            return None

    df['IMG'] = df['IMG'].apply(safe_decode)
    return df

# ----------------------- 데이터 적재 -----------------------
def insert_to_dw(df: pd.DataFrame, table_name: str):
    """DataFrame 데이터를 DW 테이블에 삽입"""
    conn = get_dw_connection()
    cursor = conn.cursor()

    cols = ",".join(df.columns)
    placeholders = ",".join(["%s"] * len(df.columns))
    sql = f"INSERT INTO {table_name} ({cols}) VALUES ({placeholders})"

    try:
        data = [tuple(row) for row in df.values]
        cursor.executemany(sql, data)
        conn.commit()
        print(f"✅ {len(data)} rows inserted into {table_name}")
    except Exception as e:
        print("❌ 적재 실패:", e)
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

# ----------------------- 메인 실행부 -----------------------
if __name__ == "__main__":
    # ✅ mes 데이터베이스의 CROM 테이블에서 데이터 조회
    mes_conn = get_mes_connection()
    df = fetch_data("SELECT IDX, IMG, P_DATE FROM CROM", mes_conn)
    df['DW_DATE'] = datetime.now()  # DW 테이블에 맞게 추가
  # ← 이 부분이 mes.crom에서 가져오는 곳입니다
    mes_conn.close()

    if df.empty:
        print("⚠️ CROM 테이블에서 가져온 데이터가 없습니다.")
    else:
        print(f"📦 {len(df)}건 데이터 추출 완료")

        # ✅ IMG 컬럼 디코딩
        df = decode_img_column(df)

        # ✅ data_warehouse 데이터베이스의 ware_house 테이블로 적재
        insert_to_dw(df, "CROM")  # ← 이 부분이 DW 쪽 ware_house 테이블로 넣는 곳입니다