'use strict';

/* =========================================================
   REGISTRATION GUARD - BLOCK QUIZ ACCESS WITHOUT REGISTRATION
   ========================================================= */

if (!localStorage.getItem('bseRegistration')) {
  console.error('Quiz blocked: No registration data found');
  document.body.innerHTML = '';
  window.location.replace('index.html');
  throw new Error('Access denied: Registration required');
}

/* =========================================================
   QUIZ DATA
   LL = Low-Level, AR = AR/VR, FS = Full-Stack, ML = Machine Learning
   ========================================================= */

const quizData = [
  {
    type: 'mcq',
    prompt: 'When building software, which layer of the system excites you the most?',
    options: [
      { text: 'Direct memory management, hardware registers, and operating-system kernels.', score: { LL: 3 } },
      { text: '3D environments, shaders, and real-time interactive physics.', score: { AR: 3 } },
      { text: 'Interactive interfaces, web APIs, and cloud-database integration.', score: { FS: 3 } },
      { text: 'Neural networks, pattern recognition, and predictive data pipelines.', score: { ML: 3 } },
    ],
  },
  {
    type: 'mcq',
    prompt: 'Which group of languages and tools would you prefer to master first?',
    options: [
      { text: 'C, C++, Rust, and Assembly.', score: { LL: 3 } },
      { text: 'C#, Unity, Unreal Engine, and OpenXR.', score: { AR: 3 } },
      { text: 'JavaScript, TypeScript, Node.js, and SQL.', score: { FS: 3 } },
      { text: 'Python, TensorFlow, Pandas, and NumPy.', score: { ML: 3 } },
    ],
  },
  {
    type: 'mcq',
    prompt: 'You discover a major performance problem in an application. What is your first instinct?',
    options: [
      { text: 'Inspect memory allocation and profile CPU-cache behaviour.', score: { LL: 3 } },
      { text: 'Reduce draw calls, polygon counts, and dynamic-lighting costs.', score: { AR: 3 } },
      { text: 'Optimise database queries, compress assets, and add caching.', score: { FS: 3 } },
      { text: 'Engineer the data features and adjust the model parameters.', score: { ML: 3 } },
    ],
  },
  {
    type: 'mcq',
    prompt: 'Which project would you be most proud to include in your portfolio?',
    options: [
      { text: 'A bare-metal embedded driver or custom memory allocator.', score: { LL: 3 } },
      { text: 'An immersive headset application or interactive 3D simulation.', score: { AR: 3 } },
      { text: 'A scalable multi-user web application with authentication and APIs.', score: { FS: 3 } },
      { text: 'An intelligent model that predicts patterns from real-world data.', score: { ML: 3 } },
    ],
  },
  {
    type: 'mcq',
    prompt: 'Which area of mathematics interests you most?',
    options: [
      { text: 'Binary logic, bitwise arithmetic, and Boolean algebra.', score: { LL: 3 } },
      { text: 'Linear algebra, 3D vectors, matrices, and transformations.', score: { AR: 3 } },
      { text: 'Discrete mathematics, set theory, and relational logic.', score: { FS: 3 } },
      { text: 'Probability, statistics, calculus, and gradient descent.', score: { ML: 3 } },
    ],
  },
  {
    type: 'mcq',
    prompt: 'Where would you most like to work three years after graduation?',
    options: [
      { text: 'Robotics, operating systems, or embedded firmware.', score: { LL: 3 } },
      { text: 'Virtual-reality experiences, games, or spatial interfaces.', score: { AR: 3 } },
      { text: 'Frontend architecture, full-stack development, or cloud systems.', score: { FS: 3 } },
      { text: 'Data science, machine learning, or AI research.', score: { ML: 3 } },
    ],
  },
  {
    type: 'hotspot',
    prompt: 'Select the architecture component responsible for authenticating requests and routing messages between clients and backend services.',
    targets: [
      { id: 'database', label: 'Database / Storage', score: { FS: 1 } },
      { id: 'client', label: 'Client Interface', score: { FS: 1, AR: 1 } },
      { id: 'api', label: 'API Gateway', score: { FS: 3 } },
      { id: 'engine', label: 'Processing Engine', score: { ML: 1, LL: 1 } },
    ],
  },
  {
    type: 'audio',
    prompt: 'Listen to the creature sound. Which specialisation is best suited to position this sound inside an immersive 3D experience?',
    audioSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
    instructions: 'Use the custom Play, Pause, and Replay controls before choosing an answer.',
    options: [
      { text: 'Low-Level Programming', score: { LL: 1 } },
      { text: 'Full-Stack Web Development', score: { FS: 0 } },
      { text: 'AR/VR Development', score: { AR: 3 } },
      { text: 'Machine Learning', score: { ML: 0 } },
    ],
  },
   {
    type: 'video',
    prompt: 'Watch the virtual-reality scenario. The video will pause automatically at a decision point.',
    videoSrc: 'assets/vr-scenario.mp4',
    pauseTime: 5,
    pauseCopy: 'The VR experience is losing frames and making the user uncomfortable. Which optimisation should the development team apply?',
    options: [
      { text: 'Reduce polygon counts, use level-of-detail meshes, and apply occlusion culling.', score: { AR: 3 } },
      { text: 'Add more database tables and API endpoints.', score: { FS: 0 } },
      { text: 'Train a text-classification model.', score: { ML: 0 } },
      { text: 'Replace the renderer with an Assembly memory-copy loop.', score: { LL: 1 } },
    ],
  },
  {
    type: 'mcq',
    prompt: 'Which workflow is normally used to train a model using millions of labelled images?',
    options: [
      { text: 'Supervised learning with convolutional neural networks.', score: { ML: 3 } },
      { text: 'DOM manipulation and CSS Flexbox.', score: { FS: 0 } },
      { text: 'Manual pointer dereferencing.', score: { LL: 0 } },
      { text: 'Raycasting and mesh baking.', score: { AR: 1 } },
    ],
  },
];


/* =========================================================
   QUIZ STATE AND PAGE ELEMENTS
   ========================================================= */

const totalQuestions = quizData.length;
const answers = Array(totalQuestions).fill(null);
const QUIZ_DURATION_SECONDS = 60;

let currentQuestion = 0;
let remainingSeconds = QUIZ_DURATION_SECONDS;
let timerInterval = null;
let questionStartedAt = Date.now();
let quizLocked = false;

const countdownEl = document.getElementById('countdown');
const timerMessageEl = document.getElementById('timerMessage');
const progressTextEl = document.getElementById('progressText');
const progressFillEl = document.getElementById('progressFill');
const progressTrackEl = document.querySelector('.progress-track');
const quizContainer = document.getElementById('quizContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const resultPanel = document.getElementById('resultPanel');


/* =========================================================
   TIMER AND PROGRESS DISPLAY
   ========================================================= */

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, '0');
  const remainder = String(safeSeconds % 60).padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function updateHeader() {
  const questionNumber = currentQuestion + 1;
  const progressPercent = Math.round((questionNumber / totalQuestions) * 100);

  progressTextEl.textContent = `Question ${questionNumber} of ${totalQuestions}`;
  progressFillEl.style.width = `${progressPercent}%`;
  progressTrackEl?.setAttribute('aria-valuenow', String(progressPercent));

  prevBtn.disabled = currentQuestion === 0 || quizLocked;

  if (currentQuestion === totalQuestions - 1) {
    nextBtn.classList.add('hidden');
    submitBtn.classList.remove('hidden');
  } else {
    nextBtn.classList.remove('hidden');
    submitBtn.classList.add('hidden');
  }

  nextBtn.disabled = quizLocked;
  submitBtn.disabled = quizLocked;
}


/* =========================================================
   OPTION CREATION AND SELECTION
   ========================================================= */

function createOptionCard(text, optionIndex, questionIndex) {
  const optionCard = document.createElement('label');
  optionCard.className = 'quiz-option';

  optionCard.innerHTML = `
    <input type="radio" name="answer" value="${optionIndex}">
    <span>${text}</span>
  `;

  optionCard.addEventListener('click', () => saveAnswer(questionIndex, optionIndex));
  return optionCard;
}

function renderStandardOptions(question, questionIndex) {
  const optionWrapper = document.createElement('div');
  optionWrapper.className = 'quiz-options';

  question.options.forEach((option, optionIndex) => {
    optionWrapper.appendChild(createOptionCard(option.text, optionIndex, questionIndex));
  });

  return optionWrapper;
}

function renderOptionSelection(optionIndex) {
  quizContainer.querySelectorAll('.quiz-option').forEach(card => {
    const input = card.querySelector('input[name="answer"]');
    const selected = Number(input.value) === optionIndex;

    card.classList.toggle('active', selected);
    input.checked = selected;
  });
}

function applySavedAnswer(questionIndex, hotspotWrapper = null) {
  const savedAnswer = answers[questionIndex];
  if (!savedAnswer) return;

  renderOptionSelection(savedAnswer.optionIndex);

  if (hotspotWrapper && savedAnswer.targetId) {
    highlightHotspotSelection(hotspotWrapper, savedAnswer.targetId);
  }
}


/* =========================================================
   SAVE ANSWERS WITH SPEED INFORMATION
   ========================================================= */

function saveAnswer(questionIndex, optionIndex) {
  if (quizLocked) return;

  const question = quizData[questionIndex];
  const elapsedSeconds = Math.max(0, Math.round((Date.now() - questionStartedAt) / 1000));

  // Fast answers receive a small, controlled bonus.
  const speedMultiplier = elapsedSeconds <= 15 ? 1.2 : elapsedSeconds <= 30 ? 1.1 : 1;
  const answerPayload = { optionIndex, elapsedSeconds, speedMultiplier };

  if (question.type === 'hotspot') {
    answerPayload.score = question.targets[optionIndex].score;
    answerPayload.targetId = question.targets[optionIndex].id;
  } else {
    answerPayload.score = question.options[optionIndex].score;
  }

   answers[questionIndex] = answerPayload;
  renderOptionSelection(optionIndex);

  /*
    The video continues only after the student answers the
    question shown at the programmed pause point.
  */
  if (question.type === 'video') {
    const video = quizContainer.querySelector('.question-video');
    const overlay = quizContainer.querySelector('.video-overlay');

    if (video && overlay && video.dataset.waitingForAnswer === 'true') {
      video.dataset.waitingForAnswer = 'false';
      overlay.classList.remove('visible');

      setTimeout(() => {
        overlay.classList.add('hidden');
      }, 200);

      video.play().catch(error => {
        console.error('The video could not continue.', error);
      });
    }
  }
  resultPanel.classList.add('hidden');
  resultPanel.replaceChildren();
}

/* =========================================================
   INTERACTIVE SVG HOTSPOT
   ========================================================= */
 


function highlightHotspotSelection(wrapper, selectedId) {
  wrapper.querySelectorAll('.hotspot-target').forEach(target => {
    const selected = target.dataset.target === selectedId;
    const rectangle = target.querySelector('rect');

    target.setAttribute('aria-pressed', String(selected));
    rectangle.setAttribute('stroke', selected ? '#60a5fa' : '#94a3b8');
    rectangle.setAttribute('stroke-width', selected ? '5' : '2');
    rectangle.setAttribute('fill', selected ? '#1d4ed8' : '#152238');
  });
}

function renderHotspotQuestion(question, questionIndex) {
  const wrapper = document.createElement('div');
  wrapper.className = 'hotspot-board';

  wrapper.innerHTML = `
    <div class="hotspot-svg">
      <svg viewBox="0 0 760 360" role="img" aria-label="Software architecture diagram">
        <rect x="20" y="20" width="720" height="320" rx="28" fill="#0f172a"></rect>

        <g class="hotspot-target" data-target="client" role="button" tabindex="0" aria-label="Client Interface" aria-pressed="false">
          <rect x="40" y="45" width="320" height="105" rx="18" fill="#152238" stroke="#94a3b8" stroke-width="2"></rect>
          <text x="200" y="105" fill="#f8fafc" font-size="20" text-anchor="middle">Client Interface</text>
        </g>

        <g class="hotspot-target" data-target="api" role="button" tabindex="0" aria-label="API Gateway" aria-pressed="false">
          <rect x="400" y="45" width="320" height="105" rx="18" fill="#152238" stroke="#94a3b8" stroke-width="2"></rect>
          <text x="560" y="105" fill="#f8fafc" font-size="20" text-anchor="middle">API Gateway</text>
        </g>

        <g class="hotspot-target" data-target="engine" role="button" tabindex="0" aria-label="Processing Engine" aria-pressed="false">
          <rect x="40" y="190" width="320" height="105" rx="18" fill="#152238" stroke="#94a3b8" stroke-width="2"></rect>
          <text x="200" y="250" fill="#f8fafc" font-size="20" text-anchor="middle">Processing Engine</text>
        </g>

        <g class="hotspot-target" data-target="database" role="button" tabindex="0" aria-label="Database and Storage" aria-pressed="false">
          <rect x="400" y="190" width="320" height="105" rx="18" fill="#152238" stroke="#94a3b8" stroke-width="2"></rect>
          <text x="560" y="250" fill="#f8fafc" font-size="20" text-anchor="middle">Database / Storage</text>
        </g>
      </svg>
    </div>

    <div class="quiz-options"></div>
  `;

  const optionWrapper = wrapper.querySelector('.quiz-options');

  question.targets.forEach((target, optionIndex) => {
    optionWrapper.appendChild(createOptionCard(target.label, optionIndex, questionIndex));
  });

  function selectHotspot(targetElement) {
    const targetId = targetElement.dataset.target;
    const targetIndex = question.targets.findIndex(target => target.id === targetId);

    if (targetIndex === -1) return;

    saveAnswer(questionIndex, targetIndex);
    highlightHotspotSelection(wrapper, targetId);
  }

  wrapper.querySelectorAll('.hotspot-target').forEach(target => {
    target.addEventListener('click', () => selectHotspot(target));

    target.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectHotspot(target);
      }
    });
  });

  return wrapper;
}


/* =========================================================
   CUSTOM AUDIO CONTROLS
   ========================================================= */

function renderAudioQuestion(question) {
  const audioSection = document.createElement('div');
  audioSection.className = 'audio-card';

  audioSection.innerHTML = `
    <div class="audio-controls">
      <button type="button" class="audio-play-button">Play</button>
      <button type="button" class="audio-replay-button">Replay</button>
      <span class="score-label" aria-live="polite">Audio prompt ready.</span>
    </div>

    <audio class="question-audio" preload="auto">
      <source src="${question.audioSrc}" type="audio/mpeg">
      Your browser does not support HTML5 audio.
    </audio>
  `;

  const audio = audioSection.querySelector('.question-audio');
  const playButton = audioSection.querySelector('.audio-play-button');
  const replayButton = audioSection.querySelector('.audio-replay-button');
  const statusLabel = audioSection.querySelector('.score-label');

  playButton.addEventListener('click', async () => {
    try {
      if (audio.paused) await audio.play();
      else audio.pause();
    } catch (error) {
      statusLabel.textContent = 'The audio could not be played.';
    }
  });

  replayButton.addEventListener('click', async () => {
    audio.currentTime = 0;

    try {
      await audio.play();
    } catch (error) {
      statusLabel.textContent = 'The audio could not be replayed.';
    }
  });

  audio.addEventListener('play', () => {
    playButton.textContent = 'Pause';
    statusLabel.textContent = 'Audio is playing.';
  });

  audio.addEventListener('pause', () => {
    playButton.textContent = 'Play';
    if (!audio.ended) statusLabel.textContent = 'Audio paused.';
  });

  audio.addEventListener('ended', () => {
    playButton.textContent = 'Play';
    statusLabel.textContent = 'Audio finished.';
  });

  audio.addEventListener('error', () => {
    statusLabel.textContent = 'The audio file could not be loaded.';
  });

  return audioSection;
}


/* =========================================================
   VIDEO WITH AUTOMATIC TIMESTAMP PAUSE
   ========================================================= */

function renderVideoQuestion(question) {
  const videoSection = document.createElement('div');
  videoSection.className = 'video-card';

  videoSection.innerHTML = `
    <div class="video-container">
      <video class="question-video" controls preload="metadata">
        <source src="${question.videoSrc}" type="video/mp4">
        Your browser does not support HTML5 video.
      </video>

      <div class="video-overlay hidden" role="dialog" aria-modal="true" aria-live="assertive">
        <div>
          <strong>Decision point reached at ${question.pauseTime} seconds</strong>
          <p>${question.pauseCopy}</p>
          <small>Select an answer below before the video can continue.</small>
        </div>
      </div>
    </div>
  `;

  const video = videoSection.querySelector('.question-video');
  const overlay = videoSection.querySelector('.video-overlay');
  let pausePointTriggered = false;

  /*
    Pause the video automatically when it reaches the
    programmed timestamp.
  */
  video.addEventListener('timeupdate', () => {
    if (video.currentTime >= question.pauseTime && !pausePointTriggered) {
      pausePointTriggered = true;
      video.pause();
      video.dataset.waitingForAnswer = 'true';

      overlay.classList.remove('hidden');
      requestAnimationFrame(() => overlay.classList.add('visible'));
    }
  });

  video.addEventListener('ended', () => {
    video.dataset.waitingForAnswer = 'false';
  });

  video.addEventListener('error', () => {
    overlay.classList.remove('hidden');
    overlay.classList.add('visible');

    overlay.innerHTML = `
      <div>
        <strong>Video unavailable</strong>
        <p>Check that assets/vr-scenario.mp4 exists in your project.</p>
      </div>
    `;
  });

  return videoSection;
}


/* =========================================================
   LOAD AND DISPLAY A QUESTION
   ========================================================= */

function loadQuestion(index) {
  const question = quizData[index];

  questionStartedAt = Date.now();
  quizContainer.replaceChildren();
  resultPanel.classList.add('hidden');

  const title = document.createElement('h2');
  const description = document.createElement('p');

  title.textContent = question.prompt;

  const descriptions = {
    audio: question.instructions,
    video: 'Play the video and observe the automatic timestamp pause.',
    hotspot: 'Select a region in the diagram or choose its matching option.',
    mcq: 'Choose the answer that best represents your interests.',
  };

  description.textContent = descriptions[question.type];

  quizContainer.append(title, description);

  if (question.type === 'mcq') {
    quizContainer.appendChild(renderStandardOptions(question, index));
    applySavedAnswer(index);
  }

  if (question.type === 'hotspot') {
    const hotspotWrapper = renderHotspotQuestion(question, index);
    quizContainer.appendChild(hotspotWrapper);
    applySavedAnswer(index, hotspotWrapper);
  }

  if (question.type === 'audio') {
    quizContainer.appendChild(renderAudioQuestion(question));
    quizContainer.appendChild(renderStandardOptions(question, index));
    applySavedAnswer(index);
  }

  if (question.type === 'video') {
    quizContainer.appendChild(renderVideoQuestion(question));
    quizContainer.appendChild(renderStandardOptions(question, index));
    applySavedAnswer(index);
  }

  updateHeader();
}


/* =========================================================
   QUESTION NAVIGATION
   ========================================================= */

function goToQuestion(index) {
  if (quizLocked) return;

  currentQuestion = Math.max(0, Math.min(index, totalQuestions - 1));
  loadQuestion(currentQuestion);

  quizContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

prevBtn.addEventListener('click', () => goToQuestion(currentQuestion - 1));
nextBtn.addEventListener('click', () => goToQuestion(currentQuestion + 1));


/* =========================================================
   SPEED AND STREAK SCORING ENGINE
   ========================================================= */

function calculateQuizResult() {
  const finalScore = { LL: 0, AR: 0, FS: 0, ML: 0 };
  const scoringDetails = [];

  let previousCategory = null;
  let streakLength = 0;

  answers.forEach((answer, questionIndex) => {
    if (!answer || !answer.score) return;

    const dominantCategory = Object.entries(answer.score).sort((a, b) => b[1] - a[1])[0][0];

    if (dominantCategory === previousCategory) streakLength += 1;
    else streakLength = 1;

    previousCategory = dominantCategory;

    // A repeated category produces a controlled streak bonus of up to 20%.
    const streakMultiplier = Math.min(1.2, 1 + (streakLength - 1) * 0.05);
    const combinedMultiplier = answer.speedMultiplier * streakMultiplier;

    Object.entries(answer.score).forEach(([category, value]) => {
      finalScore[category] += value * combinedMultiplier;
    });

    scoringDetails.push({
      question: questionIndex + 1,
      dominantCategory,
      elapsedSeconds: answer.elapsedSeconds,
      speedMultiplier: answer.speedMultiplier,
      streakLength,
      streakMultiplier: Number(streakMultiplier.toFixed(2)),
      combinedMultiplier: Number(combinedMultiplier.toFixed(2)),
    });
  });

  Object.keys(finalScore).forEach(category => {
    finalScore[category] = Number(finalScore[category].toFixed(2));
  });

  return { finalScore, scoringDetails };
}


/* =========================================================
   SUBMISSION AND TIMEOUT HANDLING
   ========================================================= */

function lockQuizControls() {
  quizLocked = true;

  quizContainer.querySelectorAll('input, button, video, audio').forEach(control => {
    if (control instanceof HTMLMediaElement) control.pause();
    else control.disabled = true;
  });

  prevBtn.disabled = true;
  nextBtn.disabled = true;
  submitBtn.disabled = true;
}

function submitQuiz(timedOut = false) {
  if (quizLocked) return;

  const answeredCount = answers.filter(Boolean).length;

  if (!timedOut && answeredCount < totalQuestions) {
    resultPanel.innerHTML = `
      <p class="error-message">
        Please answer all ${totalQuestions} questions before submitting.
        You have answered ${answeredCount}.
      </p>
    `;

    resultPanel.classList.remove('hidden');
    resultPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  clearInterval(timerInterval);
  lockQuizControls();

  const { finalScore, scoringDetails } = calculateQuizResult();

  try {
    localStorage.setItem('bseAnswers', JSON.stringify(answers));
    localStorage.setItem('bseResult', JSON.stringify(finalScore));
    localStorage.setItem('bseScoringDetails', JSON.stringify(scoringDetails));
    localStorage.setItem('bseTimedOut', String(timedOut));
  } catch (error) {
    console.error('The quiz results could not be saved.', error);
  }

  window.location.href = 'results.html';
}

submitBtn.addEventListener('click', () => submitQuiz(false));


/* =========================================================
   ONE-MINUTE COUNTDOWN TIMER
   ========================================================= */

function startQuizTimer() {
  countdownEl.textContent = formatTime(remainingSeconds);

  timerInterval = setInterval(() => {
    remainingSeconds -= 1;
    countdownEl.textContent = formatTime(remainingSeconds);

    if (remainingSeconds <= 15 && remainingSeconds > 0) {
      countdownEl.classList.add('timer-warning');
      timerMessageEl.textContent = 'Less than 15 seconds remains. Hurry!';
    }

    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);

      remainingSeconds = 0;
      countdownEl.textContent = '00:00';
      timerMessageEl.textContent = 'Time expired. Your current answers are being submitted.';

      submitQuiz(true);
    }
  }, 1000);
}


/* =========================================================
   START THE QUIZ
   ========================================================= */

function initialiseQuiz() {
  if (!quizContainer || !countdownEl || !prevBtn || !nextBtn || !submitBtn) {
    console.error('Required quiz-page elements are missing.');
    return;
  }

  /*
    Read the saved registration information. If the student
    did not complete registration, send them to the form.
  */
  let registration = null;

  try {
    registration = JSON.parse(localStorage.getItem('bseRegistration'));
  } catch (error) {
    registration = null;
  }

  const registrationComplete =
    registration &&
    registration.fullName &&
    registration.studentId &&
    registration.email &&
    registration.phone &&
    registration.specialisation;

  if (!registrationComplete) {
    window.location.replace('index.html#registration');
    return;
  }

  /*
    Validate the saved information again. This prevents an
    incomplete or incorrectly formatted registration object
    from unlocking the quiz.
  */
 const namePattern = /^[A-Za-z]+(?:[ '-][A-Za-z]+)+$/;
  const studentIdPattern = /^BSE-\d{4}-\d{4}$/i;
  const emailPattern = /^[a-z\d]+(?:[._-][a-z\d]+)*@bse\.ac\.mu$/i;
  const phonePattern = /^\+230\d{8}$/;
  const allowedSpecialisations = ['lowlevel', 'arvr', 'fullstack', 'ml'];

  const validName = namePattern.test(registration.fullName);
  const validStudentId = studentIdPattern.test(registration.studentId);
  const validEmail = emailPattern.test(registration.email);
  const validPhone = phonePattern.test(registration.phone);
  const validSpecialisation = allowedSpecialisations.includes(registration.specialisation);

  if (!validName || !validStudentId || !validEmail || !validPhone || !validSpecialisation) {
    localStorage.removeItem('bseRegistration');
    localStorage.removeItem('bseSpecialisation');
    window.location.replace('index.html#registration');
    return;
  }

  // Clear the previous attempt but preserve valid registration and theme data.
  localStorage.removeItem('bseAnswers');
  localStorage.removeItem('bseResult');
  localStorage.removeItem('bseScoringDetails');
  localStorage.removeItem('bseTimedOut');

  loadQuestion(currentQuestion);
  startQuizTimer();
}
 
window.addEventListener('DOMContentLoaded', initialiseQuiz);