'use strict';

/* =========================================================
   SHARED PAGE ELEMENTS, THEME, AND NAVIGATION
   ========================================================= */

const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const siteLogo = document.getElementById('siteLogo');
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.getElementById('mainNav');

function applyTheme(theme) {
  body.dataset.theme = theme;

  if (themeToggle) {
    const darkMode = theme === 'dark';
    themeToggle.textContent = darkMode ? 'Light' : 'Dark';
    themeToggle.setAttribute('aria-pressed', String(darkMode));
  }

  if (siteLogo) {
    siteLogo.src = theme === 'dark' ? 'assets/logo-dark.svg' : 'assets/logo.svg';
  }

  localStorage.setItem('bseTheme', theme);
}

function restoreTheme() {
  applyTheme(localStorage.getItem('bseTheme') === 'dark' ? 'dark' : 'light');
}

themeToggle?.addEventListener('click', () => {
  applyTheme(body.dataset.theme === 'dark' ? 'light' : 'dark');
});

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') !== 'true';
    navToggle.setAttribute('aria-expanded', String(open));
    mainNav.classList.toggle('nav-open', open);
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      mainNav.classList.remove('nav-open');
    });
  });
}


/* =========================================================
   SAFE LOCAL-STORAGE READING
   ========================================================= */

function readStoredJSON(key, fallback) {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallback;
  } catch (error) {
    console.error(`Unable to read ${key} from localStorage.`, error);
    return fallback;
  }
}


/* =========================================================
   REGISTRATION FORM ELEMENTS AND REGEX PATTERNS
   ========================================================= */

const regForm = document.getElementById('regForm');
const specialisationCards = document.querySelectorAll('.card[data-key]');
const selectedSpecialisation = document.getElementById('specialisation');
const specialisationError = document.getElementById('specialisationError');

const registrationInputs = {
  fullName: document.getElementById('fullName'),
  studentId: document.getElementById('studentId'),
  email: document.getElementById('email'),
  phone: document.getElementById('phone'),
};

const registrationErrors = {
  fullName: document.getElementById('fullNameError'),
  studentId: document.getElementById('studentIdError'),
  email: document.getElementById('emailError'),
  phone: document.getElementById('phoneError'),
};

// Custom patterns required by the assessment brief.
const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '\-][A-Za-zÀ-ÖØ-öø-ÿ]+)+$/;
const studentIdRegex = /^BSE-\d{4}-\d{4}$/i;
const institutionalEmailRegex = /^[a-z\d]+(?:[._-][a-z\d]+)*@bse\.ac\.mu$/i;
const phoneRegex = /^\+230\d{8}$/;
const generalEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;


/* =========================================================
   REUSABLE INLINE FIELD FEEDBACK
   ========================================================= */

function updateFieldState(input, errorElement, message) {
  if (!input || !errorElement) return;

  const invalid = Boolean(message);
  const hasValue = Boolean(input.value.trim());

  errorElement.textContent = message;
  input.classList.toggle('is-invalid', invalid);
  input.classList.toggle('is-valid', !invalid && hasValue);
  input.setAttribute('aria-invalid', String(invalid));
}


/* =========================================================
   REGISTRATION VALIDATION
   ========================================================= */

function validateRegistrationField(fieldName) {
  const input = registrationInputs[fieldName];
  const errorElement = registrationErrors[fieldName];

  if (!input || !errorElement) return true;

  const value = input.value.trim();
  let message = '';

  if (fieldName === 'fullName') {
    if (!value) message = 'Please enter your full name.';
    else if (!nameRegex.test(value)) message = 'Enter at least two names using letters, spaces, apostrophes, or hyphens only.';
  }

  if (fieldName === 'studentId' && !studentIdRegex.test(value)) {
    message = 'Student ID must follow the format BSE-2026-0001.';
  }

  if (fieldName === 'email' && !institutionalEmailRegex.test(value)) {
    message = 'Use your institutional email, for example student.id@bse.ac.mu.';
  }

  if (fieldName === 'phone' && !phoneRegex.test(value)) {
    message = 'Enter +230 followed by exactly eight digits.';
  }

  updateFieldState(input, errorElement, message);
  return message === '';
}

function validateRegistrationForm() {
  let valid = true;

  Object.keys(registrationInputs).forEach(fieldName => {
    if (!validateRegistrationField(fieldName)) valid = false;
  });

  if (!selectedSpecialisation?.value) {
    if (specialisationError) specialisationError.textContent = 'Please select one specialisation card before continuing.';
    valid = false;
  } else if (specialisationError) {
    specialisationError.textContent = '';
  }

  return valid;
}


/* =========================================================
   SPECIALISATION SELECTION
   ========================================================= */

function setSpecialisation(key) {
  specialisationCards.forEach(card => {
    const selected = card.dataset.key === key;
    card.classList.toggle('selected', selected);
    card.setAttribute('aria-pressed', String(selected));
  });

  if (selectedSpecialisation) selectedSpecialisation.value = key;
  if (specialisationError) specialisationError.textContent = '';

  localStorage.setItem('bseSpecialisation', key);
}

specialisationCards.forEach(card => {
  card.addEventListener('click', () => setSpecialisation(card.dataset.key));
});

Object.keys(registrationInputs).forEach(fieldName => {
  const input = registrationInputs[fieldName];
  if (!input) return;

  input.addEventListener('input', () => validateRegistrationField(fieldName));
  input.addEventListener('blur', () => validateRegistrationField(fieldName));
});


/* =========================================================
   RESTORE AND SUBMIT REGISTRATION
   ========================================================= */

function restoreRegistrationForm() {
  if (!regForm) return;

  const saved = readStoredJSON('bseRegistration', {});

  Object.keys(registrationInputs).forEach(fieldName => {
    if (saved[fieldName] && registrationInputs[fieldName]) {
      registrationInputs[fieldName].value = saved[fieldName];
    }
  });

  const savedSpecialisation = saved.specialisation || localStorage.getItem('bseSpecialisation');
  if (savedSpecialisation) setSpecialisation(savedSpecialisation);
}

regForm?.addEventListener('submit', event => {
  event.preventDefault();

  if (!validateRegistrationForm()) {
    const firstInvalidField = regForm.querySelector('.is-invalid');

    if (firstInvalidField) firstInvalidField.focus();
    else specialisationError?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    return;
  }

  const registrationData = {
    fullName: registrationInputs.fullName.value.trim(),
    studentId: registrationInputs.studentId.value.trim().toUpperCase(),
    email: registrationInputs.email.value.trim().toLowerCase(),
    phone: registrationInputs.phone.value.trim(),
    specialisation: selectedSpecialisation.value,
  };

  localStorage.setItem('bseRegistration', JSON.stringify(registrationData));
  window.location.href = 'quiz.html';
});


/* =========================================================
   CONTACT FORM VALIDATION
   ========================================================= */

const contactForm = document.getElementById('contactForm');

const contactInputs = {
  contactName: document.getElementById('contactName'),
  contactEmail: document.getElementById('contactEmail'),
  contactSubject: document.getElementById('contactSubject'),
  contactMessage: document.getElementById('contactMessage'),
};

const contactErrors = {
  contactName: document.getElementById('contactNameError'),
  contactEmail: document.getElementById('contactEmailError'),
  contactSubject: document.getElementById('contactSubjectError'),
  contactMessage: document.getElementById('contactMessageError'),
};

function validateContactField(fieldName) {
  const input = contactInputs[fieldName];
  const errorElement = contactErrors[fieldName];

  if (!input || !errorElement) return true;

  const value = input.value.trim();
  let message = '';

  if (fieldName === 'contactName') {
    if (!value) message = 'Please enter your full name.';
    else if (!nameRegex.test(value)) message = 'Enter at least two names using letters only.';
  }

  if (fieldName === 'contactEmail' && !generalEmailRegex.test(value)) {
    message = 'Enter a valid email address.';
  }

  if (fieldName === 'contactSubject' && value.length < 3) {
    message = 'The subject must contain at least three characters.';
  }

  if (fieldName === 'contactMessage' && value.length < 10) {
    message = 'The message must contain at least ten characters.';
  }

  updateFieldState(input, errorElement, message);
  return message === '';
}

function validateContactForm() {
  let valid = true;

  Object.keys(contactInputs).forEach(fieldName => {
    if (!validateContactField(fieldName)) valid = false;
  });

  return valid;
}

Object.keys(contactInputs).forEach(fieldName => {
  const input = contactInputs[fieldName];
  if (!input) return;

  input.addEventListener('input', () => validateContactField(fieldName));
  input.addEventListener('blur', () => validateContactField(fieldName));
});

contactForm?.addEventListener('submit', event => {
  event.preventDefault();

  const status = document.getElementById('contactStatus');

  if (!validateContactForm()) {
    if (status) status.textContent = 'Please correct the highlighted fields.';
    contactForm.querySelector('.is-invalid')?.focus();
    return;
  }

  if (status) status.textContent = 'Your message passed validation successfully.';

  contactForm.reset();

  Object.values(contactInputs).forEach(input => {
    if (!input) return;

    input.classList.remove('is-valid', 'is-invalid');
    input.setAttribute('aria-invalid', 'false');
  });

  Object.values(contactErrors).forEach(error => {
    if (error) error.textContent = '';
  });
});


/* =========================================================
   RESULTS PAGE INITIALISATION
   ========================================================= */
function initialiseResultsPage() {
  const canvas = document.getElementById('resultsCanvas');
  if (!canvas) return;

  /*
    Protect the Results page. A student must register first
    and must have at least one saved quiz answer.
  */
  const registration = readStoredJSON('bseRegistration', null);
  const answers = readStoredJSON('bseAnswers', []);
  let finalScore = readStoredJSON('bseResult', null);

  const registrationComplete =
    registration &&
    registration.fullName &&
    registration.studentId &&
    registration.email &&
    registration.phone &&
    registration.specialisation;

  const quizCompleted =
    Array.isArray(answers) &&
    answers.some(answer => answer && answer.score) &&
    finalScore;

  if (!registrationComplete) {
    window.location.replace('landing.html#registration');
    return;
  }

  if (!quizCompleted) {
    window.location.replace('quiz.html');
    return;
  }

  const keys = ['LL', 'AR', 'FS', 'ML'];

  const labels = {
    LL: 'Low-Level Programming',
    AR: 'AR/VR Development',
    FS: 'Full-Stack Engineering',
    ML: 'Machine Learning',
  };

  const colours = {
    LL: '#7c3aed',
    AR: '#f43f5e',
    FS: '#f59e0b',
    ML: '#0ea5e9',
  };
  // Recalculate basic totals when stored result data is unavailable.
  if (!finalScore) {
    finalScore = { LL: 0, AR: 0, FS: 0, ML: 0 };

    answers.forEach(answer => {
      if (!answer?.score) return;

      Object.entries(answer.score).forEach(([category, value]) => {
        finalScore[category] += value;
      });
    });
  }

  keys.forEach(key => {
    const value = Number(finalScore[key]);
    finalScore[key] = Number.isFinite(value) ? value : 0;
  });

  const answeredCount = answers.filter(answer => answer?.score).length;
  const hasResult = answeredCount > 0 && keys.some(key => finalScore[key] > 0);
  const maximumScore = Math.max(answers.length, 10) * 3;
  const percentages = {};

  keys.forEach(key => {
    percentages[key] = Math.max(0, Math.min(100, Math.round((finalScore[key] / maximumScore) * 100)));
  });

  const orderedScores = keys.map(key => [key, finalScore[key]]).sort((first, second) => second[1] - first[1]);
  const primaryKey = hasResult ? orderedScores[0][0] : null;
  const primaryPercentage = primaryKey ? percentages[primaryKey] : 0;


/* =========================================================
   RESULTS TEXT
   ========================================================= */

  const welcomeBanner = document.getElementById('welcomeBanner');

  if (welcomeBanner) {
    welcomeBanner.innerHTML = `
      <h2>Congratulations, ${registration.fullName || 'Student'}!</h2>
      <p class="muted">
        ${hasResult
          ? 'Here is your BSE Specialisation Profile based on your quiz responses.'
          : 'Complete the quiz to generate your BSE Specialisation Profile.'}
      </p>
    `;
  }

  const primaryCard = document.getElementById('primaryCard');

  if (primaryCard) {
    primaryCard.innerHTML = hasResult
      ? `
        <div>
          <div class="pill">Top match</div>
          <h3 style="margin: 7px 0 0;">${labels[primaryKey]}</h3>
          <p class="muted" style="margin: 7px 0 0;">
            This path best aligns with the interests and preferences recorded in your quiz.
          </p>
        </div>

        <div>
          <div class="primary-score">${primaryPercentage}%</div>
          <div class="muted">Match score</div>
        </div>
      `
      : `
        <div>
          <div class="pill">Insufficient answers</div>
          <h3 style="margin: 7px 0 0;">No recommendation yet</h3>
          <p class="muted" style="margin: 7px 0 0;">
            Answer the quiz questions before requesting a recommendation.
          </p>
        </div>

        <a class="primary" href="quiz.html">Return to Quiz</a>
      `;
  }


/* =========================================================
   SPECIALISATION DETAILS AND RECOMMENDATIONS
   ========================================================= */

  const trackDetails = {
    LL: {
      modules: ['Systems Programming', 'Operating Systems', 'Embedded Systems'],
      languages: ['C', 'C++', 'Rust'],
      careers: ['Embedded Developer', 'Firmware Engineer', 'Systems Programmer'],
      resources: ['The C Programming Language', 'Rust By Example'],
    },
    AR: {
      modules: ['3D Graphics', 'Real-Time Rendering', 'XR User Experience'],
      languages: ['C#', 'C++', 'GLSL'],
      careers: ['XR Developer', 'Graphics Engineer', 'Game Developer'],
      resources: ['Learn OpenGL', 'Unity Learn'],
    },
    FS: {
      modules: ['Frontend Development', 'Backend APIs', 'Databases'],
      languages: ['JavaScript', 'TypeScript', 'SQL'],
      careers: ['Full-Stack Developer', 'Frontend Engineer', 'Backend Engineer'],
      resources: ['MDN Web Docs', 'freeCodeCamp'],
    },
    ML: {
      modules: ['Probability and Statistics', 'Machine Learning Models', 'Data Pipelines'],
      languages: ['Python', 'R', 'SQL'],
      careers: ['Machine Learning Engineer', 'Data Scientist', 'AI Research Assistant'],
      resources: ['Deep Learning Book', 'fast.ai'],
    },
  };

  const breakdown = document.getElementById('breakdown');

  if (breakdown) {
    breakdown.replaceChildren();

    keys.forEach(key => {
      const details = document.createElement('details');
      details.className = 'rec-details';

      details.innerHTML = `
        <summary><strong>${labels[key]}</strong> — ${percentages[key]}% match</summary>

        <div class="content">
          <p><strong>Core modules:</strong> ${trackDetails[key].modules.join(', ')}</p>
          <p><strong>Recommended languages:</strong> ${trackDetails[key].languages.join(', ')}</p>
          <p><strong>Industry roles:</strong> ${trackDetails[key].careers.join(', ')}</p>
          <p><strong>Learning resources:</strong> ${trackDetails[key].resources.join(', ')}</p>
        </div>
      `;

      breakdown.appendChild(details);
    });
  }

  const recommendations = document.getElementById('recommendations');

  if (recommendations) {
    recommendations.innerHTML = hasResult
      ? `
        <div class="rec-item">
          <strong>${labels[primaryKey]} — ${primaryPercentage}% match</strong>
          <p class="muted">Your answers gave this specialisation the highest weighted category score.</p>
        </div>

        <div class="rec-item">
          <strong>Recommended next steps</strong>
          <ul>
            <li>Begin a small project connected to this track.</li>
            <li>Explore the recommended modules and languages.</li>
            <li>Record your progress in a Learning Journey Plan.</li>
          </ul>
        </div>
      `
      : `
        <div class="rec-item">
          <strong>Complete the quiz</strong>
          <p class="muted">A recommendation cannot be calculated from unanswered questions.</p>
        </div>
      `;
  }


/* =========================================================
   DYNAMIC HTML5 CANVAS CHART
   ========================================================= */

  const context = canvas.getContext('2d');

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (!width || !height) return;

    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawBarChart() {
    resizeCanvas();

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const darkTheme = body.dataset.theme === 'dark';
    const backgroundColour = darkTheme ? '#0f172a' : '#ffffff';
    const textColour = darkTheme ? '#f8fafc' : '#0f172a';
    const mutedColour = darkTheme ? '#cbd5e1' : '#475569';

    context.clearRect(0, 0, width, height);
    context.fillStyle = backgroundColour;
    context.fillRect(0, 0, width, height);

    const padding = width < 500 ? 38 : 55;
    const topPadding = 60;
    const bottomPadding = 70;
    const chartWidth = width - padding * 2;
    const chartHeight = height - topPadding - bottomPadding;
    const categorySpace = chartWidth / keys.length;
    const barWidth = Math.max(25, categorySpace * 0.55);

    // Draw chart grid and percentage labels.
    context.lineWidth = 1;
    context.font = `${width < 500 ? 10 : 12}px Inter, sans-serif`;

    for (let percentage = 0; percentage <= 100; percentage += 20) {
      const y = topPadding + chartHeight - (percentage / 100) * chartHeight;

      context.beginPath();
      context.strokeStyle = darkTheme ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.10)';
      context.moveTo(padding, y);
      context.lineTo(width - padding, y);
      context.stroke();

      context.fillStyle = mutedColour;
      context.textAlign = 'right';
      context.textBaseline = 'middle';
      context.fillText(`${percentage}%`, padding - 8, y);
    }

    const shortLabels = { LL: 'Low-Level', AR: 'AR/VR', FS: 'Full-Stack', ML: 'ML' };

    keys.forEach((key, index) => {
      const percentage = percentages[key];
      const x = padding + categorySpace * index + (categorySpace - barWidth) / 2;
      const barHeight = (percentage / 100) * chartHeight;
      const y = topPadding + chartHeight - barHeight;

      context.fillStyle = darkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)';
      context.fillRect(x, topPadding, barWidth, chartHeight);

      context.fillStyle = colours[key];
      context.fillRect(x, y, barWidth, barHeight);

      context.fillStyle = textColour;
      context.font = `700 ${width < 500 ? 11 : 14}px Inter, sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'bottom';
      context.fillText(`${percentage}%`, x + barWidth / 2, Math.max(y - 6, topPadding - 3));

      context.textBaseline = 'top';
      context.fillText(shortLabels[key], x + barWidth / 2, topPadding + chartHeight + 14);
    });

    context.fillStyle = textColour;
    context.font = `800 ${width < 500 ? 15 : 19}px Inter, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.fillText('BSE Specialisation Match', width / 2, 18);
  }


/* =========================================================
   CANVAS CONFETTI ANIMATION
   ========================================================= */

  const particles = [];

  function createConfetti(amount) {
    const particleColours = ['#2563eb', '#7c3aed', '#06b6d4', '#f97316', '#10b981'];

    for (let index = 0; index < amount; index += 1) {
      particles.push({
        x: canvas.clientWidth / 2 + (Math.random() - 0.5) * 180,
        y: -20 - Math.random() * 80,
        horizontalSpeed: (Math.random() - 0.5) * 3,
        verticalSpeed: 1 + Math.random() * 2.5,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        size: 5 + Math.random() * 8,
        colour: particleColours[Math.floor(Math.random() * particleColours.length)],
        life: 110 + Math.random() * 80,
      });
    }
  }

  function updateAndDrawConfetti() {
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];

      particle.x += particle.horizontalSpeed;
      particle.y += particle.verticalSpeed;
      particle.verticalSpeed += 0.035;
      particle.rotation += particle.rotationSpeed;
      particle.life -= 1;

      context.save();
      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);
      context.fillStyle = particle.colour;
      context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      context.restore();

      if (particle.life <= 0 || particle.y > canvas.clientHeight + 30) {
        particles.splice(index, 1);
      }
    }
  }

  function animateCanvas() {
    drawBarChart();
    updateAndDrawConfetti();

    if (particles.length > 0) requestAnimationFrame(animateCanvas);
  }

  drawBarChart();

  if (hasResult) {
    createConfetti(75);
    animateCanvas();
  }

  let resizeTimer;

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawBarChart, 120);
  });

  themeToggle?.addEventListener('click', () => setTimeout(drawBarChart, 0));


/* =========================================================
   RESULTS PAGE BUTTONS
   ========================================================= */

  document.getElementById('restartBtn')?.addEventListener('click', () => {
    localStorage.removeItem('bseAnswers');
    localStorage.removeItem('bseResult');
    localStorage.removeItem('bseScoringDetails');
    localStorage.removeItem('bseTimedOut');
    window.location.href = 'quiz.html';
  });

  document.getElementById('saveImageBtn')?.addEventListener('click', () => {
    drawBarChart();

    const downloadLink = document.createElement('a');
    downloadLink.download = 'bse-specialisation-results.png';
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.click();
  });
}


/* =========================================================
   START SHARED FEATURES
   ========================================================= */

restoreTheme();
restoreRegistrationForm();
initialiseResultsPage();