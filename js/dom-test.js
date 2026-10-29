"use strict";

let questions = [
  {
    text: "Если человека назвали мордофиля, то это…",
    answers: [
      { text: "Значит, что он тщеславный.", correct: true },
      { text: "Значит, что у него лицо как у хряка.", correct: false },
      { text: "Значит, что чумазый.", correct: false }
    ],
    explanation: "В этимологическом словаре Макса Фасмера мордофиля — чванливый человек, то есть высокомерный и тщеславный."
  },
  {
    text: "«Да этот Ярополк — фуфлыга!» Что не так с Ярополком?",
    answers: [
      { text: "Он маленький и невзрачный.", correct: true },
      { text: "Он тот ещё алкоголик.", correct: false },
      { text: "Он не держит своё слово.", correct: false }
    ],
    explanation: "По словарю Даля фуфлыга — невзрачный малорослый человек. Ещё так называют прыщи."
  },
  {
    text: "Если человека прозвали пятигузом, значит, он…",
    answers: [
      { text: "Не держит слово.", correct: true },
      { text: "Изменяет жене.", correct: false },
      { text: "Без гроша в кармане.", correct: false }
    ],
    explanation: "Согласно этимологическому словарю Макса Фасмера, пятигуз — ненадёжный, непостоянный человек: может сесть сразу на пять стульев."
  },
  {
    text: "Кто такой шлындра?",
    answers: [
      { text: "Обманщик.", correct: false },
      { text: "Нытик.", correct: false },
      { text: "Бродяга.", correct: true }
    ],
    explanation: "В словаре русского арго «шлындрать» означает бездельничать, шляться."
  },
  {
    text: "Когда можно сказать, что человек охренел — обнаглел, перешёл границы, а не просто удивился?",
    answers: [
      { text: "Он без спроса берёт твои вещи и делает вид, что так и надо.", correct: true },
      { text: "Он нагло лезет без очереди и ещё возмущается, что его не пропускают.", correct: true },
      { text: "Он съел много хрена и удивился: «Какой жгучий, вот это да!»", correct: false },
      { text: "В осеннем лесу наблюдается завихрение листьев.", correct: false }
    ],
    explanation: "В этих случаях слово означает «обнаглел, потерял совесть». В задании верными отмечены оба примера нарушения чужих границ."
  }
];

let quiz = document.getElementById("quiz");
let status = document.getElementById("test-status");
let result = document.getElementById("test-result");
let restart = document.getElementById("test-restart");
let order;
let current;
let score;
let busy;
let finished;

function shuffle(items) {
  let copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temporary = copy[i];
    copy[i] = copy[j];
    copy[j] = temporary;
  }
  return copy;
}

function startTest() {
  order = shuffle(questions);
  current = 0;
  score = 0;
  busy = false;
  finished = false;
  quiz.innerHTML = "";
  result.textContent = "";
  restart.hidden = true;
  addQuestion();
}

function addQuestion() {
  let question = order[current];
  let row = document.createElement("div");
  row.className = "quiz-row";
  let button = document.createElement("button");
  button.type = "button";
  button.className = "quiz-question";
  button.textContent = (current + 1) + ". " + question.text;
  button.disabled = true;
  button.onclick = function() {
    if (finished) {
      showCorrectAnswer(row, question);
    }
  };
  row.appendChild(button);
  let answers = document.createElement("div");
  answers.className = "quiz-answers";
  row.appendChild(answers);
  quiz.appendChild(row);

  let variants = shuffle(question.answers);
  for (let i = 0; i < variants.length; i++) {
    let answer = document.createElement("button");
    answer.type = "button";
    answer.className = "quiz-answer";
    answer.textContent = variants[i].text;
    answer.onclick = function() {
      chooseAnswer(row, answer, variants[i], question);
    };
    answers.appendChild(answer);
  }

  if (current === order.length - 1) {
    status.textContent = "Вопросы закончились";
  } else {
    status.textContent = "Вопрос " + (current + 1) + " из " + order.length;
  }
}

function chooseAnswer(row, selected, answer, question) {
  if (busy || finished) {
    return;
  }
  busy = true;
  let buttons = row.querySelectorAll(".quiz-answer");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].disabled = true;
  }
  selected.classList.add("shake");
  if (answer.correct) {
    score++;
    selected.classList.add("correct-answer");
    let explanation = document.createElement("span");
    explanation.className = "quiz-explanation";
    explanation.textContent = question.explanation;
    selected.appendChild(explanation);
  }

  setTimeout(function() {
    let mark = document.createElement("span");
    mark.className = answer.correct ? "quiz-mark right" : "quiz-mark wrong";
    mark.textContent = answer.correct ? "✓" : "✗";
    mark.title = answer.correct ? "Верно" : "Неверно";
    row.querySelector(".quiz-question").appendChild(mark);

    let leaving = [];
    for (let i = 0; i < buttons.length; i++) {
      if (!answer.correct || buttons[i] !== selected) {
        leaving.push(buttons[i]);
      }
    }
    if (answer.correct) {
      leaving.push(selected);
    }
    for (let i = 0; i < leaving.length; i++) {
      setTimeout(function() {
        leaving[i].classList.add("leaving");
      }, i * 220);
    }

    setTimeout(function() {
      row.querySelector(".quiz-answers").innerHTML = "";
      current++;
      busy = false;
      if (current < order.length) {
        addQuestion();
      } else {
        finishTest();
      }
    }, leaving.length * 220 + 550);
  }, 2000);
}

function finishTest() {
  finished = true;
  status.textContent = "Вопросы закончились";
  result.textContent = "Правильных ответов: " + score + " из " + order.length + ". Нажмите на вопрос для просмотра ответа.";
  let buttons = quiz.querySelectorAll(".quiz-question");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].disabled = false;
  }
  restart.hidden = false;
}

function showCorrectAnswer(row, question) {
  let groups = quiz.querySelectorAll(".quiz-answers");
  let buttons = quiz.querySelectorAll(".quiz-question");
  for (let i = 0; i < groups.length; i++) {
    groups[i].innerHTML = "";
    buttons[i].classList.remove("selected", "shake");
  }
  let button = row.querySelector(".quiz-question");
  button.classList.add("selected", "shake");
  setTimeout(function() {
    button.classList.remove("shake");
  }, 300);
  let group = row.querySelector(".quiz-answers");
  for (let i = 0; i < question.answers.length; i++) {
    if (question.answers[i].correct) {
      let answer = document.createElement("div");
      answer.className = "quiz-answer correct-answer";
      answer.textContent = question.answers[i].text;
      let explanation = document.createElement("span");
      explanation.className = "quiz-explanation";
      explanation.textContent = question.explanation;
      answer.appendChild(explanation);
      group.appendChild(answer);
    }
  }
}

restart.onclick = startTest;
startTest();
