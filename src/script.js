// QUESTION BANK
// Each object has: question (string), options (array of 4 strings),
// answer (0-based index of the correct option).
const QUESTIONS = [
  {
    question: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'],
    answer: 2,
  },
  {
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    answer: 1,
  },
  {
    question: 'How many sides does a hexagon have?',
    options: ['5', '6', '7', '8'],
    answer: 1,
  },
  {
    question: 'Which element has the chemical symbol "O"?',
    options: ['Gold', 'Osmium', 'Oxygen', 'Oganesson'],
    answer: 2,
  },
  {
    question: 'Who wrote "Romeo and Juliet"?',
    options: ['Charles Dickens', 'Jane Austen', 'William Shakespeare', 'Mark Twain'],
    answer: 2,
  },
  {
    question: 'What is the largest ocean on Earth?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    answer: 3,
  },
  {
    question: 'In which year did the first Moon landing occur?',
    options: ['1965', '1967', '1969', '1971'],
    answer: 2,
  },
  {
    question: 'What is the smallest prime number?',
    options: ['0', '1', '2', '3'],
    answer: 2,
  },
  {
    question: 'Which country is home to the kangaroo?',
    options: ['South Africa', 'Brazil', 'New Zealand', 'Australia'],
    answer: 3,
  },
  {
    question: 'How many bones are in the adult human body?',
    options: ['196', '206', '216', '226'],
    answer: 1,
  },
];

// DOM REFERENCES
// Grabbed once at startup; never queried inside loops.
const startScreen   = document.getElementById('start-screen');
const quizScreen    = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');

const startBtn      = document.getElementById('start-btn');
const nextBtn       = document.getElementById('next-btn');
const restartBtn    = document.getElementById('restart-btn');

const questionCounter = document.getElementById('question-counter');
const scoreDisplay    = document.getElementById('score-display');
const progressFill    = document.getElementById('progress-fill');
const questionText    = document.getElementById('question-text');
const optionsGrid     = document.getElementById('options-grid');

const feedback      = document.getElementById('feedback');
const feedbackIcon  = document.getElementById('feedback-icon');
const feedbackText  = document.getElementById('feedback-text');

const resultsIcon    = document.getElementById('results-icon');
const resultsSummary = document.getElementById('results-summary');
const resultsScore   = document.getElementById('results-score');
const resultsMessage = document.getElementById('results-message');

// STATE
// All mutable quiz state lives here. 
let currentIndex = 0;   // which question we're on (0-based)
let score        = 0;   // number of correct answers so far
let answered     = false; // has the user picked an option for this question?

function showScreen(screenEl) {
  // Hide all three screens, then reveal only the requested one.
  [startScreen, quizScreen, resultsScreen].forEach(s =>
    s.classList.add('screen--hidden')
  );
  screenEl.classList.remove('screen--hidden');
}

// LOAD QUESTION
// Reads the question at ⁠ currentIndex ⁠ from QUESTIONS and updates every
// relevant DOM node.  Also resets per-question UI state (feedback, Next btn).
function loadQuestion() {
  const total = QUESTIONS.length;
  const q     = QUESTIONS[currentIndex];

  // ── Reset per-question state ──
  answered = false;
  nextBtn.disabled = true;

  // Hide the feedback banner from the previous question.
  feedback.classList.add('feedback--hidden');
  feedback.classList.remove('feedback--correct', 'feedback--wrong');

  // ── Header: "Question X of Y" + live score ──
 questionCounter.textContent = `Question ${currentIndex + 1} of ${total}`;
 scoreDisplay.textContent = `Score: ${score}`;

  // ── Progress bar, Width is expressed as a percentage of questions completed so far.
  progressFill.style.width = `${((currentIndex + 1) / total) * 100}%`;
  questionText.textContent = q.question;

  // ── Build option buttons ──
  // Clear whatever buttons were there from the previous question.
  optionsGrid.innerHTML = '';

  const LABELS = ['A', 'B', 'C', 'D'];

  q.options.forEach((optionText, index) => {
    const btn = document.createElement('button');
    btn.className      = 'option-btn';
    btn.textContent    = optionText;
    btn.dataset.label  = LABELS[index]; // drives the ::before pseudo-element
    btn.dataset.index  = index;          // used in handleOptionClick to check correctness

    // Each button fires the same handler; the handler reads btn.dataset.index.
    btn.addEventListener('click', handleOptionClick);

    optionsGrid.appendChild(btn);
  });
}


// HANDLE OPTION CLICK
// Called when the user clicks any answer button.
// `this` is the clicked <button>; we also use `event.currentTarget` for clarity.
function handleOptionClick(event) {
  // Guard: ignore clicks if the user already answered this question.
  if (answered) return;
  answered = true;

  const clickedBtn    = event.currentTarget;
  const chosenIndex   = Number(clickedBtn.dataset.index);
  const correctIndex  = QUESTIONS[currentIndex].answer;
  const isCorrect     = chosenIndex === correctIndex;

  if (isCorrect) score++;

  // ── Visual feedback on the buttons ──
  // Collect all option buttons rendered in the grid.
  const allBtns = optionsGrid.querySelectorAll('.option-btn');

  allBtns.forEach(btn => {
    const idx = Number(btn.dataset.index);

    // Disable every button so only one answer is possible per question.
    btn.disabled = true;

    if (idx === correctIndex) {
      // Always highlight the correct answer in green.
      btn.classList.add('option-btn--correct');
    } else if (idx === chosenIndex) {
      // If the user picked a wrong answer, highlight it in red.
      btn.classList.add('option-btn--wrong');
    } else {
      // Dim every other option that wasn't chosen and isn't correct.
      btn.classList.add('option-btn--dimmed');
    }
  });

  // ── Feedback banner ──
  if (isCorrect) {
    feedback.classList.add('feedback--correct');
    feedbackIcon.textContent = '✓';
    feedbackText.textContent = 'Correct! Well done.';
  } else {
    feedback.classList.add('feedback--wrong');
    feedbackIcon.textContent = '✗';
    feedbackText.textContent =
      `Incorrect. The answer is: "${QUESTIONS[currentIndex].options[correctIndex]}"`;
  }
  feedback.classList.remove('feedback--hidden');

  // ── Update the score display immediately ──
  scoreDisplay.textContent = `Score: ${score}`;

  // ── Enable the Next button ──
  nextBtn.disabled = false;

  // Change label on the very last question so users know the quiz is ending.
  nextBtn.textContent =
    currentIndex === QUESTIONS.length - 1 ? 'See Results' : 'Next Question';
}


// SHOW RESULTS


// START / RESTART
// Resets all state variables back to their initial values, then loads the first question and switches to the quiz screen.

function startQuiz() {
  currentIndex = 0;
  score        = 0;
  answered     = false;

  loadQuestion();
  showScreen(quizScreen);
}

function handleNext() {
  currentIndex++;

  if (currentIndex >= QUESTIONS.length) {
    showResults();
  } else {
    loadQuestion();
  }
}



startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', handleNext);
restartBtn.addEventListener('click', () => {
  // Go back to the start screen rather than jumping straight into the quiz,
  // so the user sees the intro card again.
  showScreen(startScreen);
});

showScreen(startScreen);


// SHOW RESULTS
// Called after the user clicks Next on the final question.
// Calculates the performance tier and populates the results screen.
function showResults() {
  const total   = QUESTIONS.length;
  const percent = (score / total) * 100;

  resultsScore.textContent   = score;
  resultsSummary.textContent = `You answered ${score} out of ${total} correctly.`;

  // Emoji + message tier based on percentage.
  if (percent === 100) {
    resultsIcon.textContent    = '🏆';
    resultsMessage.textContent = 'Perfect score! Incredible!';
  } else if (percent >= 80) {
    resultsIcon.textContent    = '🎉';
    resultsMessage.textContent = 'Great job! You really know your stuff.';
  } else if (percent >= 60) {
    resultsIcon.textContent    = '👍';
    resultsMessage.textContent = 'Good effort! A bit more study and you\'ll ace it.';
  } else if (percent >= 40) {
    resultsIcon.textContent    = '📚';
    resultsMessage.textContent = 'Keep learning! You\'re getting there.';
  } else {
    resultsIcon.textContent    = '💪';
    resultsMessage.textContent = 'Don\'t give up! Every attempt makes you better.';
  }

  showScreen(resultsScreen);
}
