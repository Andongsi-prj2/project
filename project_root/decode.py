from PIL import Image
from io import BytesIO
import base64

def decode_image(blob):
    if not isinstance(blob, bytes):
        raise ValueError(f"img는 bytes여야 합니다. 현재 타입: {type(blob)}")

    try:
        # Base64 디코딩 시도
        decoded = base64.b64decode(blob)
        buffer = BytesIO(decoded)
        buffer.seek(0)
        return Image.open(buffer).convert("RGB")
    except Exception as e:
        raise RuntimeError(f"이미지 디코딩 실패: {e}")
