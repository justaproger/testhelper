let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let subject = new URLSearchParams(window.location.search).get("subject");

document.addEventListener("DOMContentLoaded", async () => {
    await fetchQuestions(subject);
    displayQuestion();

    // Обработчик для кнопки "Далее"
    document.getElementById("next-button").addEventListener("click", () => {
        const selectedAnswer = document.querySelector("input[name='answer']:checked");
        if (!selectedAnswer) return;

        // Сохранение ответа
        const isCorrect = selectedAnswer.value === questions[currentQuestionIndex].correct;
        userAnswers.push(selectedAnswer.value);

        // Показ анимации правильного/неправильного ответа
        animateAnswer(selectedAnswer.parentElement, isCorrect, () => {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                displayQuestion();
            } else {
                submitAnswers(); // Завершаем викторину
            }
        });
    });
});

async function submitAnswers() {
    const response = await fetch("/submit_answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: userAnswers, questions }),
    });
    const result = await response.json();

    alert(`Правильных ответов: ${result.correct}\nПроцент: ${result.percentage}%`);
    window.location.href = "/";
}

async function fetchQuestions(subject) {
    const response = await fetch(`/get_questions/${subject}`);
    questions = await response.json();
}

function displayQuestion() {
    const questionData = questions[currentQuestionIndex];
    const questionElement = document.getElementById("question");
    const answersElement = document.getElementById("answers");
    const progressElement = document.querySelector("#progress span"); // Исправленный селектор
    const nextButton = document.getElementById("next-button");

    if (!progressElement) {
        console.error("Progress element not found");
        return;
    }

    // Отображение вопроса и ответов
    questionElement.textContent = `${currentQuestionIndex + 1}. ${questionData.question}`;
    answersElement.innerHTML = questionData.answers
        .map(answer => `
            <li>
                <label>
                    <input type="radio" name="answer" value="${answer}">
                    ${answer}
                </label>
            </li>
        `).join("");

    // Обновление прогресса
    progressElement.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;

    // Деактивируем кнопку "Далее"
    nextButton.disabled = true;

    // Слушаем изменения на радио-кнопках
    document.querySelectorAll("input[name='answer']").forEach(input => {
        input.addEventListener("change", () => {
            nextButton.disabled = false; // Активируем кнопку при выборе ответа
        });
    });
}

function animateAnswer(selectedElement, isCorrect, callback) {
    const answers = document.querySelectorAll("li"); // Все варианты ответа
    const correctAnswer = questions[currentQuestionIndex].correct;

    // Окрашиваем выбранный вариант
    if (isCorrect) {
        selectedElement.classList.add("correct-answer");
    } else {
        selectedElement.classList.add("wrong-answer");
    }

    // Находим правильный вариант и выделяем его
    answers.forEach(answerElement => {
        const input = answerElement.querySelector("input[name='answer']");
        if (input && input.value === correctAnswer) {
            answerElement.classList.add("correct-option");
        }
    });

    // Продолжаем после небольшой задержки
    setTimeout(() => {
        callback();
    }, 1000); // 1 секунда
}