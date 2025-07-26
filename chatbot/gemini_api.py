import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()  # 반드시 환경변수 로드

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
BACKUP_API_KEY = os.getenv("GEMINI_BACKUP_KEY")

def setup_gemini():
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        try:
            return genai.GenerativeModel("gemini-1.5-pro")
        except:
            try:
                return genai.GenerativeModel("gemini-pro")
            except:
                return genai.GenerativeModel("gemini-1.0-pro")
    return None

def generate_dashboard_reply(user_input):
    prompt = f"""
너는 제조 공정 분석 시스템의 챗봇이야. 사용자의 질문을 읽고, 아래 항목 중 가장 적절한 대시보드 링크를 HTML 형식으로 안내해줘.

링크 목록:
- 불량률: https://your-site.com/dashboard#defect-rate
- 양불수량: https://your-site.com/dashboard#good-vs-defect
- 불량유형: https://your-site.com/dashboard#defect-type
- 공정변수: https://your-site.com/dashboard#process-variables
- 날짜별: https://your-site.com/dashboard#daily-summary
- LOT: https://your-site.com/dashboard#lot-search

💡 HTML 응답 예시는 아래 형식을 따라야 해:
 불량률은 이 링크에서 확인할 수 있어요:<br><br>
 <a href="https://your-site.com/dashboard#defect-rate" target="_blank" style="color:#007bff; text-decoration:underline; font-weight:bold;">불량률 대시보드 바로가기</a>

아무것도 관련 없는 질문이라면 정중하게 거절해도 돼.

지금 사용자의 질문:
「{user_input}」
"""

    model = setup_gemini()
    if not model:
        return "⚠️ Gemini API 키가 설정되지 않아 응답할 수 없습니다."

    try:
        # ✅ 단일 텍스트 프롬프트만 전달
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"❌ Gemini 응답 오류: {str(e)}"



