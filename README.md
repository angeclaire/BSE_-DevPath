# BSE DevPath

BSE DevPath is a front-end web application that helps incoming Software Engineering students discover which specialisation best matches their interests, strengths and goals. Students register, take a short adaptive quiz, and receive a personalised recommendation with a visual score breakdown.

## Author

- Name: Uwineza Ange Claire
- Student ID:680780449
- Programme:BSc (Hons) Software Engineering
- Module: Front-End Web Development

## Features

- Landing & Registration : Students select a specialisation of interest and register with full inline validation (name, student ID, institutional email, phone number).
- Adaptive Quiz :A 10 question timed quiz with a live countdown, progress bar, and question navigation (Previous / Next / Submit).
- Results Dashboard : A pure HTML5 Canvas bar chart visualises scores across all four specialisations, alongside a personalised top recommendation and a detailed breakdown of every specialisation.
- Contact Page: Author/project information plus a validated contact form.
- Shared Theme & Navigation — Light/dark mode toggle (persisted in `localStorage`), responsive mobile navigation, and a consistent header/footer across all pages.
- Route Guarding — The quiz and results pages check `localStorage` for prior registration/quiz data and redirect back to the landing page if missing.

## Specialisations Covered

1. Low-Level Programming
2. AR/VR Development
3. Full-Stack Web Development
4. Machine Learning

## Project Structure

```
BSE_-DevPath/
├── index.html      # Home page: specialisation cards + registration form
├── quiz.html         # Quiz page: questions, timer, progress
├── results.html      # Results page: Canvas chart, recommendations, breakdown
├── contact.html       # Contact page: author info + contact form
├── quiz.js            # Quiz logic: questions, timer, scoring
├── script.js          # Shared logic: theme, navigation, form validation, localStorage
├── style.css          # Shared styling for all pages
└── assets/            # Logos, images and other static assets
```

## Tech Stack

- HTML5 (semantic markup, ARIA attributes for accessibility)
- CSS3 (custom properties for light/dark theming, responsive layout)
- Vanilla JavaScript (no frameworks or build tools)
- HTML5 Canvas API (results chart)
- Browser `localStorage` (persisting registration, quiz answers, results and theme)

## Getting Started

No build step or dependencies are required.

1. Clone the repository:
   ```bash
   git clone https://github.com/angeclaire/BSE_-DevPath.git
   ```
2. Open `index.html` in a browser (or serve the folder with a simple local server, e.g. the VS Code "Live Server" extension, to avoid any `file://` restrictions).
3. Register and select a specialisation to begin.

## Usage Flow

1. Landing page : pick a specialisation card and complete the registration form.
2. Quiz page :answer all 10 questions before the timer runs out.
3. Results page: view your recommended specialisation, score chart and detailed breakdown.
4. Contact page :reach out with questions or feedback.

## Accessibility

The app uses semantic HTML, ARIA live regions for dynamic feedback (validation errors, quiz timer, results), keyboard accessible controls, and descriptive alt text for images.

## License

This project was developed for academic purposes as part of the Front-End Web Development module.