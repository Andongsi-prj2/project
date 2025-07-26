import os
from dotenv import load_dotenv
import google.generativeai as genai

def test_gemini_connection():
    """제미나이 API 연결 상태를 테스트합니다."""
    
    print("🔍 제미나이 API 연결 상태 확인 중...")
    
    # 1. 환경변수 로드 확인
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    backup_key = os.getenv("GEMINI_BACKUP_KEY")
    
    print(f"📋 API 키 상태:")
    print(f"   - 메인 키: {'✅ 설정됨' if api_key else '❌ 설정되지 않음'}")
    print(f"   - 백업 키: {'✅ 설정됨' if backup_key else '❌ 설정되지 않음'}")
    
    if not api_key and not backup_key:
        print("❌ API 키가 설정되지 않았습니다.")
        return False
    
    # 2. API 키 설정
    try:
        genai.configure(api_key=api_key or backup_key)
        print("✅ API 키 설정 완료")
    except Exception as e:
        print(f"❌ API 키 설정 실패: {e}")
        return False
    
    # 3. 모델 연결 테스트
    models_to_try = ["gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"]
    
    for model_name in models_to_try:
        try:
            print(f"🔄 {model_name} 모델 연결 테스트 중...")
            model = genai.GenerativeModel(model_name)
            
            # 간단한 테스트 메시지 전송
            response = model.generate_content("안녕하세요. 연결 테스트입니다.")
            
            if response.text:
                print(f"✅ {model_name} 연결 성공!")
                print(f"   응답: {response.text[:50]}...")
                return True
            else:
                print(f"⚠️ {model_name} 응답이 비어있습니다.")
                
        except Exception as e:
            print(f"❌ {model_name} 연결 실패: {e}")
            continue
    
    print("❌ 모든 모델 연결 실패")
    return False

if __name__ == "__main__":
    success = test_gemini_connection()
    if success:
        print("\n🎉 제미나이 API 연결이 정상입니다!")
    else:
        print("\n💥 제미나이 API 연결에 문제가 있습니다.") 