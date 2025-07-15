import mysql.connector
import cv2
import numpy as np

# 1. DB 연결
conn = mysql.connector.connect(
    host='opyter.iptime.org',
    port=13306,     
    user='data_if_master',        # 사용자
    password='data_if_master123!',# 비밀번호
    database='mes'                # DB 이름
)
cursor = conn.cursor()

# 2. 가장 최근 이미지 1개 가져오기
cursor.execute("SELECT IDX, IMG FROM data_mart.CROM ORDER BY IDX DESC LIMIT 1")
row = cursor.fetchone()
idx, img_blob = row

# 3. BLOB → 이미지 배열로 변환
nparr = np.frombuffer(img_blob, np.uint8)
img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

# 4. Grayscale로 변환
gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# 5. 결과 이미지 보기
cv2.imshow("Grayscale Image", gray_img)
cv2.waitKey(0)
cv2.destroyAllWindows()

# 6. (선택) 저장도 가능
# cv2.imwrite('gray_output.jpg', gray_img)

cursor.close()
conn.close()
