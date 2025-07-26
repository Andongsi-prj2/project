from gemini_api import classify_dashboard_category

DASHBOARD_LINKS = {
    "불량률": "https://your-v0-site.com/dashboard#defect-rate",
    "양불수량": "https://your-v0-site.com/dashboard#good-vs-defect",
    "불량유형": "https://your-v0-site.com/dashboard#defect-type",
    "공정변수": "https://your-v0-site.com/dashboard#process-variables",
    "날짜별": "https://your-v0-site.com/dashboard#daily-summary",
    "LOT": "https://your-v0-site.com/dashboard#lot-search"
}

def handle_chat_message(user_input: str) -> str:
    category = classify_dashboard_category(user_input)

    if category not in DASHBOARD_LINKS:
        return """❓ 죄송해요, 어떤 대시보드를 보여드려야 할지 잘 모르겠어요.<br>
예: '불량률 보여줘', '양품 수량 알려줘', 'LOT 검색하고 싶어' 처럼 말씀해 주세요."""

    link = DASHBOARD_LINKS[category]
    return f"""
📊 요청하신 내용은 <b>{category}</b> 관련입니다.<br><br>
👉 <a href="{link}" target="_blank" style="color: #007bff; text-decoration: underline; font-weight: bold;">🔗 {category} 대시보드 바로가기</a>
"""
