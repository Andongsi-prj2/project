print('feature/#1')

#---------------------------
import mysql.connector

# MySQL 접속 정보 입력
conn = mysql.connector.connect(
    host="opyter.iptime.org",         # 보통 로컬이면 localhost
    port=13306,                # MySQL 기본 포트
    user="data_if_master",     # MySQL 사용자 이름
    password="data_if_master123!", # MySQL 비밀번호
    database="mes"  # DBeaver에서 만든 데이터베이스 이름
)

# 커서 생성
cursor = conn.cursor()

# 예: 테이블 목록 출력
cursor.execute("SHOW TABLES;")
tables = cursor.fetchall()
for table in tables:
    print(table)

# 종료
cursor.close()
conn.close()