from flask import Flask, render_template, jsonify, request
import random

app = Flask(__name__)

# Файлы с вопросами
SUBJECT_FILES = {
    "статистика": "questions_statistics.txt",
    "микроэкономика": "questions_economics.txt"
}

# Парсер вопросов
def parse_questions(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        data = f.read()

    questions = []
    for block in data.split("++++"):
        if not block.strip():
            continue
        lines = block.strip().split("====")
        question_text = lines[0].strip()
        answers = [line.strip() for line in lines[1:] if line.strip()]
        correct_answer = None

        for answer in answers:
            if answer.startswith("#"):
                correct_answer = answer[1:].strip()
                break

        if correct_answer:
            questions.append({
                "question": question_text,
                "answers": [answer.lstrip("#").strip() for answer in answers],
                "correct": correct_answer
            })
    return questions

# Главная страница
@app.route("/")
def index():
    return render_template("index.html")

# Эндпоинт для получения вопросов
@app.route("/get_questions/<subject>")
def get_questions(subject):
    if subject not in SUBJECT_FILES:
        return jsonify({"error": "Invalid subject"}), 400

    file_path = SUBJECT_FILES[subject]
    questions = parse_questions(file_path)
    selected_questions = random.sample(questions, min(40, len(questions)))

    # Рандомизация вариантов
    for question in selected_questions:
        random.shuffle(question["answers"])

    return jsonify(selected_questions)

# Проверка ответов
@app.route("/submit_answers", methods=["POST"])
def submit_answers():
    data = request.json
    questions = data.get("questions", [])
    user_answers = data.get("answers", [])

    correct_count = 0
    for i, question in enumerate(questions):
        if question["correct"] == user_answers[i]:
            correct_count += 1

    percentage = (correct_count / len(questions)) * 100
    return jsonify({"correct": correct_count, "percentage": percentage})

@app.route("/quiz.html")
def quiz():
    return render_template("quiz.html")


if __name__ == "__main__":
    app.run(debug=True)
