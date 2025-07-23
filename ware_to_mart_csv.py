import pandas as pd
import base64
import torch
import random
import numpy as np
import io
from PIL import Image
import torch.nn.functional as F
import torchvision.transforms as transforms
from sqlalchemy import create_engine
import pymysql
import time
from sqlalchemy import text

# ✅ 시드 고정
torch.manual_seed(42)
np.random.seed(42)
random.seed(42)
torch.backends.cudnn.deterministic = True
torch.backends.cudnn.benchmark = False

# ✅ 모델 로딩
model = torch.load("resnet18_full.pt", map_location=torch.device("cpu"), weights_only=False)
model.eval()
print("✅ 모델 로딩 완료")

# ✅ 전처리 정의
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])
print("✅ 전처리 정의 완료")

# ✅ 고장 유형 판별 함수
def determine_defect_type(temp, voltage, ph):
    if temp >= 52.46 and voltage >= 27.44:
        return 1
    elif voltage < 7.44 and ph >= 3:
        return 2
    elif temp < 32.46 and ph <= 1:
        return 3
    else:
        return 0

# ✅ DB 연결 함수
def get_engine(db_name):
    url = f"mysql+pymysql://andong_if_master:andong_if_master_123!@192.168.0.211:3306/{db_name}?charset=utf8mb4"
    return create_engine(url)

def get_mart_connection():
    return pymysql.connect(
        host="192.168.0.211", port=3306,
        user="andong_if_master", password="andong_if_master_123!",
        database="data_mart", charset="utf8mb4"
    )

# ✅ 전체 개수 파악 함수 (SQLAlchemy 2.0 호환)

def get_total_count():
    engine = get_engine("data_warehouse")
    with engine.connect() as conn:
        result = conn.execute(text(
            "SELECT COUNT(*) FROM CROM c JOIN CROM_img ci ON c.IMAGE_FILE = ci.IMAGE_FILE"
        ))
        count = result.scalar()
    return count

# ✅ 데이터 로딩 함수
def fetch_data(start=0, chunk_size=1000):
    try:
        engine = get_engine("data_warehouse")
        query = f"""
            SELECT c.`INDEX`, c.LOT, c.TIME, c.PH, c.TEMP, c.VOLTAGE, c.DATE,
                   c.IMAGE_FILE, ci.IMG AS IMG_BASE64
            FROM CROM c
            JOIN CROM_img ci ON c.IMAGE_FILE = ci.IMAGE_FILE
            LIMIT {chunk_size} OFFSET {start}
        """
        return pd.read_sql(query, engine)
    except Exception as e:
        print(f"❌ 데이터 조회 실패: {e}")
        return pd.DataFrame()

# ✅ 메인 실행 함수
def main():
    chunk_size = 1000
    start = 0
    total = get_total_count()
    print(f"📊 전체 데이터 수: {total}건")

    success_total = 0
    fail_total = 0

    while start < total:
        print(f"\n📥 {start+1} ~ {min(start+chunk_size, total)} 처리 중...")

        df = fetch_data(start=start, chunk_size=chunk_size)
        if df.empty:
            print("❌ 데이터 없음 또는 오류 발생. 종료.")
            break

        conn = get_mart_connection()
        cursor = conn.cursor()
        success, fail = 0, 0

        for i, row in enumerate(df.to_dict(orient="records"), start=1):
            try:
                print(f"  [{start+i}/{total}] → {row['IMAGE_FILE']}")
                img_bytes = base64.b64decode(row['IMG_BASE64'])
                image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
                image_tensor = transform(image).unsqueeze(0)

                with torch.no_grad():
                    output = model(image_tensor)
                    prediction = torch.argmax(output, dim=1).item()

                defect_type = determine_defect_type(row['TEMP'], row['VOLTAGE'], row['PH'])

                insert_crom = """
                    INSERT INTO CROM (
                        `INDEX`, LOT, TIME, PH, TEMP, VOLTAGE,
                        IMAGE_FILE, DETECTION, DEFECTIVE_TYPE, DATE
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(insert_crom, (
                    row['INDEX'], row['LOT'], row['TIME'], row['PH'],
                    row['TEMP'], row['VOLTAGE'], row['IMAGE_FILE'],
                    prediction, defect_type, row['DATE']
                ))

                success += 1

            except Exception as e:
                print(f"    ❌ 실패: {row.get('IMAGE_FILE', 'N/A')} → {e}")
                fail += 1

        conn.commit()
        cursor.close()
        conn.close()

        print(f"✅ 완료: {success}건 성공 / {fail}건 실패 (OFFSET={start})")
        success_total += success
        fail_total += fail
        start += chunk_size

    print("\n🎉 전체 처리 완료")
    print(f"   - 총 성공: {success_total}")
    print(f"   - 총 실패: {fail_total}")

# ✅ 실행
if __name__ == "__main__":
    main()
