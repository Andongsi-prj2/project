import os
import base64
import mysql.connector

# 1. DB 연결
conn = mysql.connector.connect(
    host="opyter.iptime.org",         # 보통 로컬이면 localhost
    port=13306,                # MySQL 기본 포트
    user="data_if_master",     # MySQL 사용자 이름
    password="data_if_master123!", # MySQL 비밀번호
    database="mes"  # DBeaver에서 만든 데이터베이스 이름
)
cursor = conn.cursor()

# 2. 이미지 폴더 경로 지정
image_folder = './images'  # 예: images 폴더에 여러 이미지가 있다고 가정

# 3. 이미지들을 반복하며 DB에 삽입
for filename in os.listdir(image_folder):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        file_path = os.path.join(image_folder, filename)

        with open(file_path, "rb") as image_file:
            encoded_data = base64.b64encode(image_file.read()).decode('utf-8')

        cursor.execute(
            "INSERT INTO CROM (FILE_NAME,IMG) VALUES (%s, %s)",
            (filename,encoded_data)
        )
        print(f"{filename} 저장 완료")

# 4. DB 커밋 및 연결 종료
conn.commit()
cursor.close()
conn.close()
