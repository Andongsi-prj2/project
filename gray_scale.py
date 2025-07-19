import mysql.connector             # MySQL DB 연결용
import cv2                         # OpenCV: 이미지 처리
import numpy as np                # 숫자 배열 처리용
from io import BytesIO             # BLOB 데이터를 바이트로
from PIL import Image              # 이미지 불러오기용

# 1. MySQL 연결
conn = mysql.connector.connect(
    host="opyter.iptime.org",      # ✅ DB 주소 (같은 네트워크여야 접속 가능)
    port=13306,
    user="data_if_master",
    password="data_if_master123!",
    database="data_mart"
)
cursor = conn.cursor()

# 2. 이미지 가져오기
cursor.execute("SELECT IDX, FILE_NAME, IMG FROM CROM")
rows = cursor.fetchall()

# 3. 이미지별로 Grayscale 변환 & 이상치 라벨링
for idx, filename, img_blob in rows:
    # BLOB → 이미지 객체(PIL)
    image = Image.open(BytesIO(img_blob))

    # PIL → numpy 배열로 변환
    img_array = np.array(image)

    # RGB → Grayscale 변환
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)

    # 평균 픽셀값 계산 (0~255 사이)
    avg_pixel = gray.mean()

    # 기준: 평균 밝기 < 100 이면 어두워서 불량으로 간주
    defect_flag = 1 if avg_pixel < 100 else 0
    defect_type = "어두움" if defect_flag else "정상"
    confidence = round(1 - (avg_pixel / 255), 2)  # 간단한 신뢰도 계산

    # 결과 업데이트 쿼리 실행
    cursor.execute("""
        UPDATE CROM
        SET DEFECT_FLAG=%s,
            DEFECT_TYPE=%s,
            MODEL_CONFIDENCE=%s
        WHERE IDX=%s
    """, (defect_flag, defect_type, confidence, idx))

# 4. 변경 사항 저장하고 종료
conn.commit()
cursor.close()
conn.close()
