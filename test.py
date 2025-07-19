print('feature/#1')

#---------------------------
import mysql.connector

# MySQL 접속 정보 입력
conn = mysql.connector.connect(
    host="andongsi-prj2-mysql.cnea6o8q8dkx.ap-northeast-2.rds.amazonaws.com",  # 새로운 호스트
    port=3306,                                                                  # 기본 포트
    user="andong_data",                                                        # 사용자명
    password="andong_data_123!",                                               # 비밀번호
    database="data_mart"                                                       # 기존에 쓰던 DB 이름 그대로
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