/**
 * KEVIN OCTAVIANUS — PERSONAL PORTFOLIO 2026
 * Main Application Orchestrator
 */

import { initNavigation } from './navigation.js';
import { initAnimations } from './animations.js';
import { initScroll } from './scroll.js';
import { initHeroFX } from './hero-fx.js';
import { initCursor } from './cursor.js';
import { initExperience } from './experience.js';
import { initInteractions } from './interactions.js';
import { initProjectsModal } from './projects.js';

document.addEventListener('DOMContentLoaded', () => {
  // Mark JavaScript as active
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js-ready');

  // Each module is isolated so one failure never takes the page down.
  const steps = [
    ['navigation', initNavigation],
    ['animations', initAnimations],   // splits text, Lenis, entrance + reveals
    ['scroll', initScroll],           // stacking cards, nav chrome, progress
    ['hero', initHeroFX],
    ['cursor', initCursor],
    ['experience', initExperience],
    ['interactions', initInteractions],
    ['projects', initProjectsModal],
  ];
  steps.forEach(([name, fn]) => {
    try { fn(); } catch (err) { console.error(`[portfolio] ${name} failed:`, err); }
  });

  console.log('%c KEVIN OCTAVIANUS %c Portfolio 2026 Initialized ',
    'background: #171717; color: #FFFFFF; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
    'background: #F5F5F3; color: #171717; padding: 4px 8px;');
});
