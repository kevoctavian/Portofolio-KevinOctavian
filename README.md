# Kevin Octavianus — Personal Portfolio 2026
## Phase 02: Full Portfolio Implementation (Content & Storytelling Refinement)

A reference-inspired, monochrome editorial personal portfolio website for **Kevin Octavianus**, Aspiring Web Developer with an Informatics background.

Built with a focus on editorial typography, fluid layouts, accessible interaction design, problem-solution project storytelling, and choreographed GSAP animations.

---

## 1. Project Overview

- **Identity:** Kevin Octavianus — Aspiring Web Developer
- **Education:** Bachelor of Informatics, Universitas Bunda Mulia (GPA: 3.68)
- **Design Philosophy:** Reference-Inspired Monochrome Editorial
- **Status:** Phase 02 Complete (Hero, Selected Works, About, Practical Experience, Contact, Case Study Modal)
- **Location:** `D:\PORTOFOLIO\kevin-portfolio-2026`

---

## 2. Content Strategy & Storytelling Direction

### A. Identity-First Positioning
- Kevin Octavianus is positioned authentically as an **aspiring Web Developer** with a solid foundation in Informatics and practical experience developing internal business web applications.
- Avoids exaggerated seniority claims or generic buzzwords; focuses on practical problem solving, clean structured code, and continuous professional growth in frontend and backend development.

### B. Prioritized Major Projects (Problem-Solution Framework)
1. **Internal Inventory Management System** (PT Javinci Berkat Kreatif Sentosa):
   - **Problem:** Disconnected inventory, purchasing, goods receipt, QC inspection, and stock monitoring workflows causing tracking errors and reporting delays.
   - **Solution:** A centralized Django/PostgreSQL web application integrating Min/Max reporting, stock mutation tracking, QC raw material inspection, Purchase Orders, and PDF receipt verification.
   - **Technologies:** Python, Django, PostgreSQL, JavaScript, AJAX, HTML5/CSS3.
2. **Rice Leaf Disease Classification** (Informatics Capstone):
   - **Problem:** Identifying agricultural rice leaf diseases manually in the field is subjective, time-consuming, and prone to misdiagnosis.
   - **Solution:** An image classification web application using Random Forest and OpenCV to classify rice leaf conditions into 4 classes (Bacterial Leaf Blight, Rice Blast, Tungro, and Healthy).
   - **Technologies:** Python, Django, Random Forest, OpenCV, PostgreSQL, JavaScript.

*(Note: Strict exclusion maintained — no references or case studies of AbbaYouth exist in this portfolio).*

---

## 3. Technology Stack

- **HTML5:** Semantic markup, accessible landmarks, picture elements, skip link.
- **CSS3:** Native CSS custom properties, CSS Grid, Flexbox, fluid `clamp()`, clip-path, modern media queries (`@media (hover: hover)`, `@media (prefers-reduced-motion)`).
- **Vanilla JavaScript (ES Modules):** Clean modular architecture (`navigation.js`, `animations.js`, `interactions.js`, `projects.js`).
- **GSAP 3 & ScrollTrigger:** High-performance animation engine for sequenced entrance choreography and subtle scroll parallax.
- **Lenis Smooth Scroll:** Hardware-accelerated smooth scrolling on desktop viewports.
- **Lucide Icons:** Crisp vector icons for social profiles and navigation actions.

---

## 4. Project Structure

```
kevin-portfolio-2026/
│
├── index.html                   # Semantic HTML entry point (Hero, Works, About, Exp, Contact)
├── README.md                    # Project documentation & content strategy
├── DESIGN-SYSTEM.md             # Full design tokens & UI guidelines
├── package.json                 # Dependency manifest (Playwright testing)
│
├── references/                  # Extracted video references & analysis
│   ├── portofolioreferences.mp4 # Reference video
│   └── frames/                  # Extracted keyframes (layout & typography inspection)
│
├── assets/
│   ├── images/
│   │   ├── profile/             # Monochrome portraits & SVG placeholders
│   │   │   ├── kevin-portrait.png         # Grayscale cutout with alpha channel
│   │   │   ├── kevin-portrait.jpg         # Grayscale portrait on #F5F5F3 surface
│   │   │   └── kevin-portrait-placeholder.svg # Editorial vector placeholder
│   │   ├── projects/
│   │   │   ├── inventory/       # Real screenshots: Min-Max, Mutations, QC, PO
│   │   │   └── rice-leaf/       # Real screenshots: DiseaseInfo, Upload, Dashboard, ConfusionMatrix
│   │   └── gallery/             # Reserved for visual asset repository
│   ├── fonts/                   # Space Grotesk, Inter, JetBrains Mono
│   └── vendor/                  # Local offline copies of GSAP, Lenis, Lucide
│       ├── gsap.min.js
│       ├── ScrollTrigger.min.js
│       ├── lenis.min.js
│       └── lucide.min.js
│
├── css/
│   ├── variables.css            # Color tokens, fluid typography, spacing
│   ├── base.css                 # Reset, atmospheric noise, focus states
│   ├── typography.css           # Space Grotesk, Inter, JetBrains Mono scales
│   ├── layout.css               # 12/8/4 column grid & elevated canvas
│   ├── components.css           # Navigation, buttons, social pills, scroll mouse, toast
│   ├── hero.css                 # Hero header, portrait staging, left/right columns
│   ├── sections.css             # Selected works, about, experience, contact, modal
│   ├── animations.css           # Preloader, clip-paths, prefers-reduced-motion
│   └── responsive.css           # Breakpoints (1440px, 1024px, 768px, 390px)
│
└── js/
    ├── main.js                  # Application orchestrator
    ├── navigation.js            # Mobile drawer, smooth anchor jumps, keyboard trapping
    ├── animations.js            # GSAP preloader & entrance sequence
    ├── interactions.js          # Jakarta WIB real-time clock, email copy action
    └── projects.js              # Project case study data & accessible modal dialog
```

---

## 5. Local Development Instructions

Because this project utilizes ES Modules (`<script type="module" src="js/main.js">`), it should be served via a local HTTP server rather than opened directly via `file://`.

```bash
cd D:\PORTOFOLIO\kevin-portfolio-2026
npx serve -l 3000
# or
python -m http.server 3000
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 6. Verification & Automated Testing

Visual regression testing and accessibility checks are executed using Playwright:

```bash
cd D:\PORTOFOLIO\kevin-portfolio-2026
node run_tests.js
```
Captures full-page and viewport screenshots across 1440px, 1024px, 768px, and 390px viewports.

---

## 7. Phase 03 — Motion & Scroll Layer

Inspired by `references/portofolioreferences.mp4`. Content and design tokens are unchanged; this phase only adds motion.

| Feature | Where |
| :--- | :--- |
| Sections as stacked cards: the card underneath scales back + dims while the next slides over it (>=768px) | `js/scroll.js`, `css/motion.css` |
| Floating nav: frosted pill after scroll, hides on scroll down / returns on scroll up, active link, scroll progress bar | `js/scroll.js` |
| Char-by-char title reveals, giant ghost titles with scroll drift | `js/utils.js`, `js/animations.js` |
| Hero: cursor spotlight on portrait, letter ripple, mouse depth, name separates on scroll | `js/hero-fx.js` |
| Selected Work: staggered grid, image parallax, 3D tilt, "View" cursor, circular modal reveal | `js/animations.js`, `js/projects.js` |
| About: word-by-word scroll fill, GPA count-up | `js/animations.js` |
| Experience: dark accordion, dimmed siblings, floating tilting preview | `js/experience.js` |
| Custom cursor ring / label | `js/cursor.js` |

Accessibility & fallbacks: `prefers-reduced-motion` disables the whole layer (static cards, no preloader); touch devices skip cursor/tilt/Lenis; below 768px cards flow normally instead of stacking; no-JS keeps all content visible.
