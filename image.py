"""
mes.CROM → data_warehouse.CROM 이미지 이관 스크립트
- 컬러 → 그레이스케일(JPEG) 변환 후 저장
- DBeaver + PyMySQL 환경 기준
"""

import io
import sys
from datetime import datetime
from PIL import Image
import pymysql

# -------------------- DB 연결 설정 --------------------
# TODO: 실제 접속 정보로 교체
DB_CONFIG = {
    "host": "andongsi-prj2-mysql.cnea6o8q8dkx.ap-northeast-2.rds.amazonaws.com",
    "port": 3306,
    "user": "andong_data",
    "password": "andong_data_123!",
    "charset": "utf8mb4",  # 한글 파일명 대응
    "cursorclass": pymysql.cursors.DictCursor,
    "autocommit": False,
}

# -------------------- 핵심 함수 --------------------
def fetch_source_rows(conn, last_idx=0, batch=500):
    """mes.CROM에서 아직 DW로 이관되지 않은 레코드 조회"""
    sql = """
        SELECT IDX, FILE_NAME, IMG, P_DATE
          FROM mes.CROM
         WHERE IDX > %s
         ORDER BY IDX
         LIMIT %s
    """
    with conn.cursor() as cur:
        cur.execute(sql, (last_idx, batch))
        return cur.fetchall()


def convert_to_gray_jpeg(blob):
    """컬러 BLOB → 그레이스케일 JPEG BLOB 변환"""
    with Image.open(io.BytesIO(blob)) as img:
        gray = img.convert("L")  # L = 8-bit grayscale
        buf = io.BytesIO()
        # 품질·용량 균형 위해 품질 85 정도 권장
        gray.save(buf, format="JPEG", quality=85)
        return buf.getvalue()


def upsert_dw(conn, row):
    """data_warehouse.CROM에 INSERT (중복 IDX 시 UPDATE)"""
    sql = """
        INSERT INTO data_warehouse.CROM
            (IDX, FILE_NAME, IMG, P_DATE, DW_DATE)
        VALUES
            (%s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            IMG = VALUES(IMG),
            DW_DATE = VALUES(DW_DATE)
    """
    with conn.cursor() as cur:
        cur.execute(
            sql,
            (
                row["IDX"],
                row["FILE_NAME"],
                row["IMG_GRAY"],
                row["P_DATE"],
                datetime.now(),
            ),
        )


def migrate_images():
    """전체 ETL 파이프라인"""
    try:
        conn = pymysql.connect(**DB_CONFIG)
        print("[INFO] DB 연결 성공")

        last_idx = 0
        total_cnt = 0

        while True:
            rows = fetch_source_rows(conn, last_idx)
            if not rows:
                break  # 더 이상 신규 데이터 없음

            for r in rows:
                try:
                    r["IMG_GRAY"] = convert_to_gray_jpeg(r["IMG"])
                    upsert_dw(conn, r)
                    last_idx = r["IDX"]
                    total_cnt += 1
                except Exception as e:
                    conn.rollback()
                    print(f"[ERROR] IDX={r['IDX']} → {e}", file=sys.stderr)
                    continue

            conn.commit()
            print(f"[INFO] {total_cnt}건 이관 완료")

    except Exception as e:
        print(f"[FATAL] {e}", file=sys.stderr)
    finally:
        if "conn" in locals():
            conn.close()
            print("[INFO] DB 연결 종료")


# -------------------- 실행 --------------------
if __name__ == "__main__":
    migrate_images()
