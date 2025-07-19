import pandas as pd
import os
import base64
import json
from kafka import KafkaProducer
import time
from tqdm import tqdm  # 진행률 표시 라이브러리

# ✅ Kafka 연결 설정

producer = KafkaProducer(
    bootstrap_servers=['192.168.0.211:9095'],  # IP + PORT (문자열로)
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

topic_name = 'near_realtime_crom'  # 토픽 이름

# 📄 엑셀 파일 및 이미지 폴더 경로
excel_path = './real_time_csv.xlsx'
image_dir = './realtime_upload_images'

df = pd.read_excel(excel_path)
total_rows = len(df)

# Kafka로 데이터 전송
for _, row in tqdm(df.iterrows(), total=total_rows, desc="Kafka로 데이터 전송 중"):
    image_filename = row['image_file']

    image_path = os.path.join(image_dir, image_filename)


    if os.path.exists(image_path):
        with open(image_path, 'rb') as img_file:
            encoded_image = base64.b64encode(img_file.read()).decode('utf-8')

        kafka_data = {
            'Index': int(row['Index']),
            'Lot': int(row['Lot']),
            'Time': str(row['Time']),  # datetime.time 객체 → 문자열 변환 필수
            'pH': row['pH'],
            'Temp': row['Temp'],
            'Voltage': row['Voltage'],
            'Date': str(row['Date']),  # datetime.date → 문자열 변환
            'image_filename': image_filename,
            'image_base64': encoded_image,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        print("debug1")
        producer.send(topic_name, value=kafka_data)

        print("debug2")
        time.sleep(0.5)  # 전송 간격 조정

    else:
        print(f"⚠️ 이미지 파일 없음: {image_filename}")

producer.flush()
producer.close()

