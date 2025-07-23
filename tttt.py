import torch
from PIL import Image
import torchvision.transforms as transforms

# 1. 모델 로딩 (전체 모델 포함된 .pt 파일)
model = torch.load("resnet18_full.pt", map_location="cpu", weights_only=False)  # 🔥 구조 + 가중치 모두 포함
model.eval()

# 2. 전처리 정의 (ResNet18 기준 Normalize 포함)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],  # ✅ 반드시 포함
                         [0.229, 0.224, 0.225])
])

# 3. 테스트할 이미지 경로
image_path = "decoded_images/KEMP_IMG_DATA_2.png"  # 슬래시 사용 권장
image = Image.open(image_path).convert("RGB")

# 4. 이미지 전처리 및 텐서 변환
image_tensor = transform(image).unsqueeze(0)  # [1, 3, 224, 224]

# 5. 모델 추론
with torch.no_grad():
    output = model(image_tensor)
    predicted_class = torch.argmax(output, 1).item()

# 6. 결과 출력
label_map = {0: '불량', 1: '정상'}  # 예측 클래스 정의
label = label_map.get(predicted_class, f"알 수 없음 ({predicted_class})")

print(f"✅ 추론 결과: 클래스 {predicted_class} → {label}")
