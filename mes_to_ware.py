import pymysql
import pandas as pd
import time

# ----------------------- MES DB 연결 -----------------------
def get_mes_connection():
    return pymysql.connect(
        host="3.38.2.58",
        port=3306,
        user="roy9194",
        password="9194",
        database="MES",
        charset="utf8mb4"
    )

# ----------------------- DW DB 연결 -----------------------
def get_dw_connection():
    return pymysql.connect(
        host="3.38.2.58",
        port=3306,
        user="roy9194",
        password="9194",
        database="DATA_WAREHOUSE",
        charset="utf8mb4"
    )

# ----------------------- 6개씩 반복 insert -----------------------
def insert_base64_by_six(df: pd.DataFrame, table_name: str):
    total = len(df)

    for i in range(0, total, 6):
        chunk_df = df.iloc[i:i+6]
        try:
            conn = get_dw_connection()
            cursor = conn.cursor()

            cols = ",".join(chunk_df.columns)
            placeholders = ",".join(["%s"] * len(chunk_df.columns))
            sql = f"INSERT INTO {table_name} ({cols}) VALUES ({placeholders})"

            data = [tuple(row) for row in chunk_df.values]
            cursor.executemany(sql, data)
            conn.commit()
            print(f"✅ {i+1} ~ {i+len(data)}번째 행 INSERT 성공")

        except Exception as e:
            print(f"❌ {i+1} ~ {i+len(chunk_df)}번째 INSERT 실패:", e)

        finally:
            try:
                cursor.close()
            except:
                pass
            try:
                conn.close()
            except:
                pass

        time.sleep(0.1)  # 선택적 딜레이 (서버 부하 방지)

# ----------------------- 메인 실행부 -----------------------
if __name__ == "__main__":
    mes_conn = get_mes_connection()
    try:
        df = pd.read_sql("SELECT image_file, img FROM CROM_img", mes_conn)
        print(f"📦 {len(df)}건 데이터 조회 완료")
    except Exception as e:
        print("❌ 조회 실패:", e)
        df = pd.DataFrame()
    finally:
        mes_conn.close()

    if not df.empty:
        insert_base64_by_six(df, "CROM_img")
