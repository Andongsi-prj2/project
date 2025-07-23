from flask import Flask, render_template, request
import torch
from torchvision import models, transforms
from PIL import Image
import os

app = Flask(__name__)
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 모델 정의 및 로딩
device = torch.device('cpu')
model = models.resnet18(pretrained=False)
model.fc = torch.nn.Linear(model.fc.in_features, 2)
model = torch.load("resnet18_full.pt", map_location="cpu", weights_only=False)
model.eval()

# 클래스 매핑
label_map = {0: '불량', 1: '정상'}

# 이미지 전처리
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        file = request.files['image']
        if file:
            filepath = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(filepath)

            # 이미지 예측
            img = Image.open(filepath).convert('RGB')
            img_tensor = transform(img).unsqueeze(0)
            with torch.no_grad():
                output = model(img_tensor)
                pred = torch.argmax(output, 1).item()
                label = label_map[pred]

            return render_template('index.html', label=label, image_path=filepath)

    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
