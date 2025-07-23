from kafka import KafkaConsumer, KafkaProducer
import torch
import json
import base64
from PIL import Image
import io
import torchvision.transforms as transforms
import torch.nn.functional as F
import random
import numpy as np

# 시드 고정
torch.manual_seed(42)
torch.cuda.manual_seed(42)
torch.cuda.manual_seed_all(42)
np.random.seed(42)
random.seed(42)
torch.backends.cudnn.deterministic = True
torch.backends.cudnn.benchmark = False

# 모델 로딩
model = torch.load("resnet18_full.pt", map_location=torch.device("cpu"), weights_only=False)
model.eval()
print("debug1")

# 전처리 정의 (✅ Normalize 포함)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])
print("debug2")

# 고장 유형 판단 함수
def determine_defect_type(TEMP, VOLTAGE, PH):
    if TEMP >= 52.46 and VOLTAGE >= 27.44:  
        return 1  # 과도도금
    elif VOLTAGE < 7.44 and PH >= 3:
        return 2  # 박리/미부착   
    elif TEMP < 32.46 and PH <= 1:
        return 3  # 얼룩/부식
    else:
        return 0  # 정상

# Kafka 설정
KAFKA_BROKER = ['192.168.0.211:9095']
print("debug3")

consumer = KafkaConsumer(
    'near_realtime_crom',
    bootstrap_servers=KAFKA_BROKER,
    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
    auto_offset_reset='earliest',
    # group_id='crom-model-group22'
)
print("debug4")

producer = KafkaProducer(
    bootstrap_servers=KAFKA_BROKER,
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)
print("debug5")

# 메시지 처리 루프
for message in consumer:        
    try:
        data = message.value
        print(data) 
        print("debuga")

        image_file = data['IMAGE_FILE']
        img_base64 = data['IMAGE_BASE64']
        temp = data['TEMP']
        voltage = data['VOLTAGE']
        ph = data['PH']
        lot = data['LOT']
        date = data['DATE']
        print("debug6")

        # 이미지 디코딩 및 변환
        img_bytes = base64.b64decode(img_base64)
        image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        image_tensor = transform(image).unsqueeze(0)
        print("debug7")

        # 모델 추론 (✅ confidence score 추가)
        with torch.no_grad():
            output = model(image_tensor)
            probs = F.softmax(output, dim=1)
            predicted = torch.argmax(probs, 1).item()  # 0: 양품, 1: 불량
            confidence_score = round(probs[0][predicted].item(), 4)
        print("debug8")

        # 고장 유형 판단
        defect_type = determine_defect_type(temp, voltage, ph)
        print("debug9")

        # 결과 메시지 생성 (✅ 요청 사항 모두 반영)
        result = {
            "DETECTION": predicted,
            "CONFIDENCE_SCORE": confidence_score,
            "DEFECTIVE_TYPE": defect_type,
            "TEMP": temp,
            "VOLTAGE": voltage,
            "PH": ph,
            "LOT": lot,
            "DATE": date,
            "IMAGE_FILE": image_file,
            "IMAGE_BASE64": img_base64
        }
        print("debug10")

        # Kafka로 결과 publish
        producer.send("near_realtime_crom_model", value=result)
        print(f"✅ 처리 완료: {result}")
        print("debug11")

    except Exception as e:
        print(f"❌ 오류 발생: {e}")
