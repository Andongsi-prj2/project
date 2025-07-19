import pandas as pd
import torch
from io import BytesIO
from PIL import Image
from torchvision import transforms
from project_root.db_config import get_connection
from project_root.utils import decode_image

# 🔹 모델 로드 (원하면 제거 가능)
model = torch.load("resnet18_full.pt", map_location=torch.device("cpu"), weights_only=False)
model.eval()

# 🔹 이미지 전처리
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

# 🔹 DB 연결
conn = get_connection("DATA_WAREHOUSE")
cursor = conn.cursor()

query = "SELECT image_file, img FROM CROM_img LIMIT 10"
cursor.execute(query)
result = cursor.fetchall()

# 🔹 결과를 DataFrame으로 변환
df = pd.DataFrame(result)

print(f"✅ 총 {len(df)}건 불러옴\n")

# 🔍 타입 & 앞 20바이트 확인 + 디코딩 테스트
for i, row in df.iterrows():
    print(f"\n🔄 {i+1}/{len(df)} 처리 중: {row['image_file']}")

    try:
        print("🔍 타입:", type(row["img"]))
        print("🔍 앞 20바이트:", row["img"][:20])
    except Exception as e:
        print(f"❌ 디버그 실패: {e}")
        continue

    try:
        image = decode_image(row["img"])
        print("📷 이미지 디코딩 성공")

        image_tensor = transform(image).unsqueeze(0)
        with torch.no_grad():
            output = model(image_tensor)
            detection = int(torch.argmax(output, dim=1))
        print(f"✅ 예측 완료: {detection}")

    except Exception as e:
        print(f"❌ 이미지 처리 실패: {e}")
        continue
