# KEVIN OCTAVIANUS — DESIGN SYSTEM SPECIFICATION
## Phase 02: Full Portfolio Specification & Content Architecture
**Version:** 2.0.0  
**Design Direction:** Reference-Inspired Monochrome Editorial Portfolio  
**Target Viewports:** Mobile (375px+), Tablet (768px+), Laptop (1024px+), Desktop (1440px+)

---

## 1. Design Philosophy

The design system for **Kevin Octavianus 2026** is built upon a **Monochrome Editorial** philosophy. It merges the disciplined typography and structured grid systems of high-end Swiss and Dutch editorial print design with modern interactive web performance and authentic problem-solution storytelling.

Key tenets:
1. **Typographic Supremacy:** Typography acts as the primary visual architecture rather than mere body text. Giant contrast scales establish immediate authority.
2. **Strict Monochrome Restraint:** Rejection of arbitrary rainbow accents. Depth, hierarchy, and focus are achieved entirely through tonal value, whitespace, borders, and tactile grayscale imagery.
3. **Reference-Inspired Asymmetric Layout:** Drawing inspiration from high-fashion and creative director lookbooks, featuring outlined versus solid typographic layering, anchored portraiture, and technical kickers.
4. **Architectural Elevation:** The website sits as an elevated canvas with subtle tactile framing over an atmospheric textured background.
5. **Problem-Solution Storytelling:** Projects are presented with clear separation of the operational problem, technical solution, and verifiable contributions.
6. **Identity-First Grounded Positioning:** Transparent, honest portrayal of an aspiring Web Developer with an Informatics background, without empty buzzwords or inflated claims.

---

## 2. Color Design Tokens

The palette is strictly monochromatic with a single functional status dot for real-time work availability.

| Token | Hex Value | Role & Usage |
| :--- | :--- | :--- |
| `--color-bg` | `#F5F5F3` | Primary body background (warm limestone off-white) |
| `--color-surface` | `#FFFFFF` | Elevated editorial canvas / card background |
| `--color-text` | `#171717` | Deep obsidian black for primary headings & active states |
| `--color-muted` | `#777777` | Neutral mid-gray for descriptions, metadata & secondary labels |
| `--color-border` | `#DCDCDC` | Crisp structural hairline borders |
| `--color-border-light` | `#EBEBEA` | Hairline dividers and internal card separators |
| `--color-dark` | `#262626` | Matte dark neutral for primary buttons and chips |
| `--color-dark-hover` | `#0D0D0D` | Deep black for interactive button hover states |
| `--color-status-green` | `#10B981` | Availability indicator pulse dot (Emerald 500) |
| `--color-status-glow` | `rgba(16, 185, 129, 0.35)` | Subtle pulsating halo for availability indicator |

---

## 3. Typography Scale & Hierarchy

The typographic hierarchy utilizes three complementary typefaces:
- **Display:** `Space Grotesk` (Geometric, punchy, editorial character with high legibility)
- **Body:** `Inter` (Optimized for digital reading, balanced neutral proportions)
- **Technical & Metadata:** `JetBrains Mono` (Structured monospace for kickers, counts, and status indicators)

### Responsive Fluid Scale (`CSS clamp()`)

| Level | Desktop (1440px+) | Mobile (390px) | CSS Clamp Expression |
| :--- | :--- | :--- | :--- |
| **Hero Display Name** | `100px – 147px` | `48px – 64px` | `clamp(3.2rem, 8.8vw + 0.5rem, 9.2rem)` |
| **Section Heading (H2)** | `64px – 84px` | `36px – 48px` | `clamp(2.25rem, 4.5vw + 0.5rem, 5.25rem)` |
| **Card & Sub Headings (H3)**| `24px – 32px` | `20px – 22px` | `clamp(1.25rem, 1.8vw + 0.5rem, 2rem)` |
| **Lead / Intro Statement** | `18px – 20px` | `15px – 16px` | `clamp(1.05rem, 1.1vw + 0.2rem, 1.25rem)` |
| **Body Standard** | `16px – 17px` | `14px – 15px` | `clamp(0.9375rem, 0.9vw + 0.2rem, 1.0625rem)` |
| **Caption / Small** | `13px – 14px` | `12px – 13px` | `clamp(0.8125rem, 0.6vw + 0.2rem, 0.875rem)` |
| **Monospace Metadata** | `11px – 12px` | `10px – 11px` | `clamp(0.6875rem, 0.5vw + 0.2rem, 0.75rem)` |

---

## 4. Section Architecture & Components (Phase 02)

### A. Section 1: Hero Prototype
- Monumental outlined `KEVIN` + solid `OCTAVIANUS` title with ~40px centered portrait overlap.
- Subtitle: `// 01 — ASPIRING WEB DEVELOPER` & `Web Application Developer`.
- Intro: *"Building practical, functional, and user-friendly web applications that solve real-world problems."*
- CTAs: `Explore Work ↓` and `About Kevin`.

### B. Section 2: Selected Works (`#work`)
- 2-Column Responsive Grid of compact problem-solution project cards.
- **Project 01:** Internal Inventory Management System (PT Javinci Berkat Kreatif Sentosa | Python, Django, PostgreSQL, JavaScript, AJAX).
- **Project 02:** Rice Leaf Disease Classification (Informatics Capstone | Python, Django, Random Forest, OpenCV, PostgreSQL).
- Each card displays floating type badges, problem & solution pillars, technology tags, and a `View Case Study →` dialog trigger.

### C. Section 3: About Kevin (`#about`)
- Two-column asymmetric editorial layout.
- Left: Identity-first narrative detailing Informatics background, hands-on experience, and continuous development growth.
- Right: Education card (Bachelor of Informatics, UBM, GPA: 3.68) and core technical skillset matrix (Languages, Frameworks, Databases, Systems).

### D. Section 4: Practical Experience (`#experience`)
- Chronological row format with dates, company names, and bulleted contributions:
  - **PT Javinci Berkat Kreatif Sentosa** — Web Application Developer & IT Support (Sep 2025 – Aug 2026).
  - **Genius Bimbel** — Academic Tutor in Mathematics (Oct 2024 – May 2025).
  - **CertNexus Credential** — GenAIBIZ™ (GAZ-210).

### E. Section 5: Contact Card (`#contact`)
- High-contrast matte dark (`#262626`) conversion card.
- Clickable direct email card with instant clipboard copy action (`kevinoctavian710@gmail.com`).
- Direct WhatsApp / Phone and location metadata.

### F. Case Study Modal Dialog (`#project-modal`)
- Accessible dialog (`role="dialog"`, `aria-modal="true"`) for comprehensive problem, solution, contribution breakdown, and feature screenshots.
- Focus trapping, Escape key listener, and background scroll lock.

---

## 5. Accessibility Rules (A11y)

- **Contrast Ratios:** Text color `#171717` on `#FFFFFF` provides `16.1:1` (exceeds WCAG AAA).
- **Focus Rings:** High-contrast `outline: 2px solid var(--color-text)` with `outline-offset: 4px` on all interactive links and buttons.
- **Reduced Motion:** Full `@media (prefers-reduced-motion: reduce)` support instantly disables all animations, bypasses preloader, and renders static layout.
- **Touch Target Compliance:** Minimum `44px` height on all buttons and social pill elements across mobile devices.
