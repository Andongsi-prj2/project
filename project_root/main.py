# main.py
import os
import torch
import pandas as pd
from torchvision import transforms
from decode import decode_image 
from db_config import get_engine
from dect import determine_defect_type

# ── 모델 로드 ───────────────────────────────────────────────
model = torch.load("resnet18_full.pt", map_location=torch.device("cpu"), weights_only=False)
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

# ── 데이터 처리 함수 ────────────────────────────────────────
def fetch_data():
    try:
        engine = get_engine("DATA_WAREHOUSE")
        print("✅ SQLAlchemy 엔진 연결 성공")

        query = """
            SELECT c.INDEX, c.LOT, c.TIME, c.PH, c.TEMP, c.VOLTAGE, c.DATE,
            c.image_file, ci.img
            FROM CROM c
            JOIN CROM_img ci ON c.image_file = ci.image_file
        """
        df = pd.read_sql(query, engine)
        print(f"✅ 쿼리 실행 성공, 결과: {len(df)}건")

        df_list = df.to_dict(orient="records")
        results = []

        for one in df_list:
            try:
                image = decode_image(one['img'])
                image_tensor = transform(image).unsqueeze(0)

                with torch.no_grad():
                    pred = model(image_tensor)
                    detection = int(torch.argmax(pred, dim=1))
                print(f"✅ 예측 완료: DETECTION = {detection}")
            except Exception as e:
                print(f"❌ 이미지 처리 실패: {e}")
                detection = -1  # 실패 시 -1 저장

            # 고장 유형 판단
            if detection == 1:
                defect = determine_defect_type(one['TEMP'], one['VOLTAGE'], one['PH'])
                print(f"⚠️ 고장 유형 판단: {defect}")
            else:
                defect = 0  # 정상

            # 결과 누적
            one['DETECTION'] = detection
            one['defective_type'] = defect
            results.append(one)

        # ── CSV 저장 ────────────────────────────────────────
        os.makedirs("data", exist_ok=True)
        output_columns = [
            'INDEX', 'LOT', 'TIME', 'PH', 'TEMP', 'VOLTAGE', 'DATE',
            'image_file', 'DETECTION', 'defective_type'
        ]
        pd.DataFrame(results)[output_columns].to_csv("data/output.csv", index=False)
        print("✅ CSV 저장 완료 → data/output.csv")

    except Exception as e:
        print(f"❌ 데이터 불러오기 실패: {e}")
        return pd.DataFrame()

# ── 실행 시작 ──────────────────────────────────────────────
if __name__ == "__main__":
    fetch_data()
