from flask import Flask, request, jsonify, render_template
from config import FLASK_CONFIG
from database import test_db_connection
from gemini_api import generate_dashboard_reply

app = Flask(__name__)

@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({"reply": f"서버 오류 발생: {str(e)}"}), 500

@app.route("/")
def home():
    return render_template("chatbot_ui.html")

@app.route("/test_db")
def test_db_route():
    result = test_db_connection()
    return jsonify(result)

@app.route("/chat", methods=["POST"])
def chat():
    try:
        user_input = request.json["user_input"]
        reply = generate_dashboard_reply(user_input)  # ✅ Gemini 응답 처리
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"reply": f"서버 오류 발생: {str(e)}"})

if __name__ == "__main__":
    print("🚀 챗봇 서버 시작...")
    print("📊 DB 연결 테스트 중...")
    db_result = test_db_connection()
    if db_result["status"] == "success":
        print(f"✅ DB 연결 성공! 테이블: {', '.join(db_result['tables'])}")
    else:
        print(f"❌ DB 연결 실패: {db_result['message']}")

    app.run(**FLASK_CONFIG)
