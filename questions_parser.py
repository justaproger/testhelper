import random

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

        # Найдем правильный ответ (с # в начале)
        for answer in answers:
            if answer.startswith("#"):
                correct_answer = answer[1:].strip()
                break

        if correct_answer:
            questions.append({
                "вопрос": question_text,
                "варианты": [answer.lstrip("#").strip() for answer in answers],
                "правильный": correct_answer
            })

    return questions

SUBJECT_FILES = {
    "статистика": "questions_statistics.txt",
    "микроэкономика": "questions_economics.txt"
}

def get_questions(subject):
    if subject not in SUBJECT_FILES:
        return []
    file_path = SUBJECT_FILES[subject]
    questions = parse_questions(file_path)
    # Выбираем случайные 40 вопросов
    return random.sample(questions, min(40, len(questions)))
