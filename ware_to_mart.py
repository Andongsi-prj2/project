import pymysql
import pandas as pd
from datetime import datetime

# ----------------------- DB 연결 -----------------------
def get_dw_connection():
    return pymysql.connect(
        host="opyter.iptime.org",
        port=13306,
        user="data_if_master",
        password="data_if_master123!",
        database="data_warehouse",
        charset="utf8mb4"
    )

def get_mart_connection():
    return pymysql.connect(
        host="opyter.iptime.org",
        port=13306,
        user="data_if_master",
        password="data_if_master123!",
        database="data_mart",
        charset="utf8mb4"
    )

# ----------------------- DW에서 데이터 조회 -----------------------
def fetch_dw_data():
    conn = get_dw_connection()
    try:
        query = "SELECT IDX, FILE_NAME, IMG, P_DATE, DW_DATE FROM CROM"  # ✅ FILE_NAME 포함
        df = pd.read_sql(query, conn)
        return df
    except Exception as e:
        print("❌ DW 데이터 조회 실패:", e)
        return pd.DataFrame()
    finally:
        conn.close()

# ----------------------- 모델 판정 (임시: 전부 양품 처리) -----------------------
def apply_dummy_model(df: pd.DataFrame) -> pd.DataFrame:
    df['DM_DATE'] = datetime.now()          # 판정 일시
    df['DEFECT_FLAG'] = 0                   # 전부 양품
    df['DEFECT_TYPE'] = '정상'              # 불량 유형 없음
    df['MODEL_CONFIDENCE'] = 1.0            # 신뢰도 100%
    return df

# ----------------------- 마트 테이블 적재 -----------------------
def insert_to_mart(df: pd.DataFrame, table_name: str):
    conn = get_mart_connection()
    cursor = conn.cursor()

    cols = ",".join(df.columns)
    placeholders = ",".join(["%s"] * len(df.columns))
    sql = f"INSERT INTO {table_name} ({cols}) VALUES ({placeholders})"

    try:
        data = [tuple(row) for row in df.values]
        cursor.executemany(sql, data)
        conn.commit()
        print(f"✅ {len(data)}건이 mart.{table_name}에 적재되었습니다.")
    except Exception as e:
        print("❌ 마트 적재 실패:", e)
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

# ----------------------- 메인 실행부 -----------------------
if __name__ == "__main__":
    df = fetch_dw_data()

    if df.empty:
        print("⚠️ DW에서 가져온 데이터가 없습니다.")
    else:
        print(f"📦 {len(df)}건 DW 데이터 추출 완료")

        # 모델 판정 (전부 양품 처리)
        df = apply_dummy_model(df)

        # ✅ 컬럼 순서 정리
        final_cols = [
            'IDX', 'FILE_NAME', 'IMG', 'P_DATE', 'DW_DATE',
            'DM_DATE', 'DEFECT_FLAG', 'DEFECT_TYPE', 'MODEL_CONFIDENCE'
        ]
        df = df[final_cols]

        # 마트 테이블로 적재
        insert_to_mart(df, "CROM")
