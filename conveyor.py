import os
import time
import base64
import mysql.connector

# 1. DB 연결
conn = mysql.connector.connect(
    host="opyter.iptime.org",
    port=13306,
    user="data_if_master",
    password="data_if_master123!",
    database="mes"
)
cursor = conn.cursor()

# 2. 이미지 폴더 경로 지정
image_folder = './images'  # 이미지들이 저장된 폴더

# 3. 이미지들을 반복하며 1초 간격으로 DB에 삽입
for filename in os.listdir(image_folder):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        file_path = os.path.join(image_folder, filename)

        # 이미지 파일을 읽고 base64 인코딩
        with open(file_path, "rb") as image_file:
            encoded_data = base64.b64encode(image_file.read()).decode('utf-8')

        # DB에 삽입
        cursor.execute(
            "INSERT INTO CROM (FILE_NAME, IMG) VALUES (%s, %s)",
            (filename, encoded_data)
        )
        conn.commit()  # 커밋을 반복문 안에서 해야 실시간 반영됨
        print(f"{filename} 저장 완료")

        # 1초 대기
        time.sleep(1)

# 4. 연결 종료
cursor.close()
conn.close()
