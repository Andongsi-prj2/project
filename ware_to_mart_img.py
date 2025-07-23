import pymysql

# ✅ 마트 DB 연결
def get_mart_connection():
    return pymysql.connect(
        host="192.168.0.211", port=3306,
        user="andong_if_master", password="andong_if_master_123!",
        database="data_mart", charset="utf8mb4"
    )

# ✅ CROM_img 전체 복사 함수
def copy_crom_img_table_full():
    try:
        conn = get_mart_connection()
        cursor = conn.cursor()

        query = """
            INSERT IGNORE INTO data_mart.CROM_img (IMAGE_FILE, IMG)
            SELECT IMAGE_FILE, IMG FROM data_warehouse.CROM_img;
        """
        cursor.execute(query)
        conn.commit()
        print("✅ CROM_img 테이블 전체 복사 완료")

    except Exception as e:
        print(f"❌ 복사 실패: {e}")

    finally:
        cursor.close()
        conn.close()

# ✅ 실행
if __name__ == "__main__":
    copy_crom_img_table_full()
