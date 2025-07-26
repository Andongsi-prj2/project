from flask import Flask, request, jsonify, render_template
from gemini_api import generate_dashboard_reply

app = Flask(__name__)

@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({"reply": f"서버 오류 발생: {str(e)}"}), 500

@app.route("/")
def home():
    return render_template("chatbot_ui.html")

@app.route("/chat", methods=["POST"])
def chat():
    try:
        user_input = request.json["user_input"]
        reply = generate_dashboard_reply(user_input)  # ✅ Gemini 응답 처리
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"reply": f"서버 오류 발생: {str(e)}"})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

