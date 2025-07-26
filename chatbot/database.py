import pymysql
from config import DB_CONFIG, DEFECT_TYPE_NAMES

def get_db_connection():
    """데이터베이스 연결을 반환합니다."""
    return pymysql.connect(**DB_CONFIG)

def test_db_connection():
    """데이터베이스 연결을 테스트합니다."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 테이블 목록 조회
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        
        # CROM 테이블 레코드 수 조회
        cursor.execute("SELECT COUNT(*) FROM CROM")
        crom_count = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return {
            "status": "success",
            "message": "DB 연결 성공",
            "tables": tables,
            "crom_count": crom_count
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"DB 연결 실패: {str(e)}"
        }

def get_defect_statistics():
    """전체 불량 통계를 조회합니다."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 전체 통계
        cursor.execute("""
            SELECT 
                COUNT(*) as total_count,
                SUM(CASE WHEN DETECTION = 0 THEN 1 ELSE 0 END) as defect_count
            FROM CROM
        """)
        result = cursor.fetchone()
        total_count, defect_count = result
        
        if total_count == 0:
            return {"error": "데이터가 없습니다."}
        
        defect_rate = round((defect_count / total_count) * 100, 2)
        
        # 불량 유형별 통계
        cursor.execute("""
            SELECT 
                DEFECTIVE_TYPE,
                COUNT(*) as count
            FROM CROM 
            WHERE DETECTION = 0
            GROUP BY DEFECTIVE_TYPE
            ORDER BY count DESC
        """)
        defect_types = cursor.fetchall()
        
        most_common_defect = DEFECT_TYPE_NAMES.get(defect_types[0][0], "알 수 없음") if defect_types else "N/A"
        most_common_count = defect_types[0][1] if defect_types else 0
        
        cursor.close()
        conn.close()
        
        return {
            "total_count": total_count,
            "defect_count": defect_count,
            "defect_rate": defect_rate,
            "most_common_defect": most_common_defect,
            "most_common_count": most_common_count
        }
    except Exception as e:
        return {"error": str(e)}

def get_detailed_daily_report(date_str):
    """특정 날짜의 상세 생산 리포트를 조회합니다."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 해당 날짜의 통계 조회
        cursor.execute("""
            SELECT 
                COUNT(*) as total_count,
                SUM(CASE WHEN DETECTION = 1 THEN 1 ELSE 0 END) as good_count,
                SUM(CASE WHEN DETECTION = 0 THEN 1 ELSE 0 END) as defect_count,
                AVG(TEMP) as avg_temp,
                AVG(VOLTAGE) as avg_voltage,
                AVG(PH) as avg_ph
            FROM CROM
            WHERE DATE(TIME) = %s
        """, (date_str,))
        
        result = cursor.fetchone()
        if not result or result[0] == 0:
            return {"error": "해당 날짜에는 생산된 부품이 없습니다."}
        
        total_count, good_count, defect_count, avg_temp, avg_voltage, avg_ph = result
        
        # 불량 유형별 통계
        cursor.execute("""
            SELECT 
                DEFECTIVE_TYPE,
                COUNT(*) as count
            FROM CROM
            WHERE DATE(TIME) = %s AND DETECTION = 0
            GROUP BY DEFECTIVE_TYPE
        """, (date_str,))
        
        defect_types_raw = cursor.fetchall()
        
        defect_types = {}
        for defect_type, count in defect_types_raw:
            name = DEFECT_TYPE_NAMES.get(defect_type, f"유형 {defect_type}")
            defect_types[name] = count
        
        defect_rate = round((defect_count / total_count) * 100, 2) if total_count > 0 else 0
        
        cursor.close()
        conn.close()
        
        return {
            "date": date_str,
            "total_count": total_count,
            "good_count": good_count,
            "defect_count": defect_count,
            "defect_rate": defect_rate,
            "defect_types": defect_types,
            "avg_temp": round(float(avg_temp), 2) if avg_temp else 0,
            "avg_voltage": round(float(avg_voltage), 2) if avg_voltage else 0,
            "avg_ph": round(float(avg_ph), 2) if avg_ph else 0
        }
    except Exception as e:
        return {"error": str(e)} 