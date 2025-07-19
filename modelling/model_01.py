import os
import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torchvision.datasets as datasets
from torchvision import models
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

# ✅ 1. GPU 설정
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# ✅ 2. 하이퍼파라미터
batch_size = 32
epochs = 10
learning_rate = 0.0001
img_size = 224

# ✅ 3. 데이터 전처리 + 증강
train_transform = transforms.Compose([
    transforms.Resize((img_size, img_size)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

test_transform = transforms.Compose([
    transforms.Resize((img_size, img_size)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ✅ 4. 데이터셋 로딩
train_dataset = datasets.ImageFolder('data/train', transform=train_transform)
test_dataset = datasets.ImageFolder('data/test', transform=test_transform)

train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
test_loader  = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)

# ✅ 5. 클래스 가중치 계산
targets = [label for _, label in train_dataset]
class_sample_count = np.bincount(targets)
class_weights = 1. / torch.tensor(class_sample_count, dtype=torch.float)
sample_weights = [class_weights[t] for t in targets]
sampler = torch.utils.data.WeightedRandomSampler(sample_weights, len(sample_weights))

# ✅ 6. 모델 정의 (ResNet18)
model = models.resnet18(pretrained=True)
model.fc = nn.Linear(model.fc.in_features, 2)  # 이진 분류용
model = model.to(device)

# ✅ 7. 손실 함수 + 옵티마이저
criterion = nn.CrossEntropyLoss(weight=class_weights.to(device))
optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

# ✅ 8. 학습 루프
print("\U0001F680 학습 시작...")
for epoch in range(epochs):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    for images, labels in DataLoader(train_dataset, batch_size=batch_size, sampler=sampler):
        images, labels = images.to(device), labels.to(device)

        outputs = model(images)
        loss = criterion(outputs, labels)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        running_loss += loss.item()
        _, predicted = torch.max(outputs.data, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

    acc = correct / total * 100
    print(f"\U0001F4CD Epoch [{epoch+1}/{epochs}] | Loss: {running_loss:.4f} | Accuracy: {acc:.2f}%")

# ✅ 9. 저장
# 1) state_dict 저장 (가중치만)
torch.save(model.state_dict(), "resnet18_ok_ng.pt")
print("✅ 모델 가중치만 저장 완료: resnet18_ok_ng.pt")

# 2) 전체 모델 저장 (구조 + 가중치)
torch.save(model, "resnet18_full.pt")
print("✅ 전체 모델 저장 완료: resnet18_full.pt")

# ✅ 10. 테스트 평가
model.eval()
all_preds = []
all_labels = []

with torch.no_grad():
    for images, labels in test_loader:
        images = images.to(device)
        outputs = model(images)
        _, predicted = torch.max(outputs.data, 1)
        all_preds.extend(predicted.cpu().numpy())
        all_labels.extend(labels.numpy())

print("\n\U0001F9EA Confusion Matrix:")
print(confusion_matrix(all_labels, all_preds))
print("\n\U0001F4CB Classification Report:")
print(classification_report(all_labels, all_preds, target_names=test_dataset.classes))
