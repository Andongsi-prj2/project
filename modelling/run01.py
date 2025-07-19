import torch
from torchvision import models, transforms
from PIL import Image

# ✅ 1. 디바이스 설정
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# ✅ 2. 이미지 전처리 (학습 시와 동일하게)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ✅ 3. 클래스 라벨 순서 (ImageFolder 기준 확인 필요)
label_map = {0: '불량', 1: '정상'}  # ← 순서가 다를 경우 바꿔줘야 함

# ✅ 4. 모델 구조 + 가중치 불러오기
model = models.resnet18(pretrained=False)
model.fc = torch.nn.Linear(model.fc.in_features, 2)
model.load_state_dict(torch.load("resnet18_ok_ng.pt", map_location=device))
model = model.to(device)
model.eval()

# ✅ 5. 예측할 이미지 경로
img_path = "data/test/정상/KEMP_IMG_DATA_12.png"  # ← 여기에 테스트할 이미지 경로 입력

# ✅ 6. 이미지 불러오기 & 예측
img = Image.open(img_path).convert('RGB')
img_tensor = transform(img).unsqueeze(0).to(device)

with torch.no_grad():
    output = model(img_tensor)
    pred = torch.argmax(output, dim=1).item()

# ✅ 7. 결과 출력
print(f"📷 예측 이미지: {img_path}")
print(f"🧠 예측 결과: {label_map[pred]}")
