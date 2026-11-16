/**
 * Scroll architecture:
 *  - sections become sticky "cards" that stack on top of each other (>=768px)
 *  - the card underneath scales back + dims while the next one slides over it
 *  - floating nav (always visible, frosted pill after scroll), progress bar, active link
 *  - natural-position helpers so anchors / triggers ignore sticky offsets
 */
import { prefersReduced } from './utils.js';

const root = document.documentElement;
let sections = [];
let tops = [];
let wrapper = null;
let ready = false;

function pageGap() {
  return parseFloat(getComputedStyle(wrapper || document.querySelector('.page-wrapper')).paddingTop) || 0;
}

/** Position the section would have if nothing were sticky (document Y). */
export function naturalTop(section) {
  const main = section.parentElement;
  let y = main.getBoundingClientRect().top + window.scrollY;
  for (const sib of main.children) {
    if (sib === section) break;
    const cs = getComputedStyle(sib);
    y += sib.offsetHeight + (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0);
  }
  return y;
}

export function scrollToTarget(target, { immediate = false } = {}) {
  if (!target) return;
  const lenis = window.portfolioLenis;
  const isHero = target === sections[0];
  let y;
  if (root.classList.contains('stack-on') && target.hasAttribute('data-stack')) {
    y = isHero ? 0 : naturalTop(target) - pageGap();
  } else {
    y = target.getBoundingClientRect().top + window.scrollY - (target.hasAttribute('data-stack') ? pageGap() : 0);
  }
  y = Math.max(0, y);
  if (lenis) lenis.scrollTo(y, { duration: immediate ? 0 : 1.5, easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) });
  else window.scrollTo({ top: y, behavior: prefersReduced() || immediate ? 'auto' : 'smooth' });
}

export function initScroll() {
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  sections = [...document.querySelectorAll('#main-content > [data-stack]')];
  wrapper = document.querySelector('.page-wrapper');
  if (!sections.length || !wrapper) return;

  const reduced = prefersReduced();
  const mq = window.matchMedia('(min-width: 768px)');

  // ------------------------------------------------------------------
  // Layout: sticky offsets so tall cards pin by their BOTTOM edge
  // ------------------------------------------------------------------
  function layout() {
    const on = mq.matches && !reduced;
    root.classList.toggle('stack-on', on);
    if (!on) {
      sections.forEach((s) => s.style.removeProperty('--stack-top'));
      tops = [];
      return;
    }
    const gap = pageGap();
    const vh = window.innerHeight;
    sections.forEach((s) => {
      const h = s.offsetHeight;
      s.style.setProperty('--stack-top', `${Math.min(gap, vh - h - gap)}px`);
    });
    tops = sections.map(naturalTop);
  }
  layout();

  if (reduced || !gsap || !ST) return;
  ST.config({ ignoreMobileResize: true });

  // Measure with sticky switched off so triggers use natural positions.
  ST.addEventListener('refreshInit', () => root.classList.remove('stack-on'));
  ST.addEventListener('refresh', layout);

  // ------------------------------------------------------------------
  // Stack depth effect: previous card recedes while the next covers it.
  // gsap.matchMedia reverts it automatically on small screens.
  // ------------------------------------------------------------------
  const mm = gsap.matchMedia();
  mm.add('(min-width: 768px)', () => {
    sections.slice(0, -1).forEach((section, i) => {
      const next = sections[i + 1];
      gsap.fromTo(
        section,
        { scale: 1, '--dim': 0 },
        {
          scale: 0.93,
          '--dim': 0.5,
          ease: 'none',
          scrollTrigger: {
            start: () => naturalTop(next) - window.innerHeight + pageGap(),
            end: () => naturalTop(next) - pageGap(),
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    });
  });
  mm.add('(min-width: 768px)', () => {
    sections.slice(1).forEach((section) => {
      const content = [...section.children];
      gsap.fromTo(content, { y: 110, opacity: 0.0 }, {
        y: 0,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          start: () => naturalTop(section) - window.innerHeight * 0.95,
          end: () => naturalTop(section) - window.innerHeight * 0.25,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    });
  });
  mq.addEventListener?.('change', () => ST.refresh());

  // ------------------------------------------------------------------
  // Progress bar
  // ------------------------------------------------------------------
  const bar = document.querySelector('.scroll-progress');
  if (bar) {
    gsap.to(bar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.25 },
    });
  }

  // ------------------------------------------------------------------
  // Floating nav + active link
  // ------------------------------------------------------------------
  const nav = document.querySelector('.editorial-nav');
  const links = [...document.querySelectorAll('.nav-link[href^="#"]')];
  const linkTargets = links.map((l) => document.querySelector(l.getAttribute('href')));

  const setActive = (idx) => {
    links.forEach((link, i) => {
      const active = linkTargets[i] === sections[idx];
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  ST.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      // Navbar stays put; only its look changes (frosted pill after scroll)
      if (nav) nav.classList.toggle('is-stuck', y > 40);

      // Active section by natural positions (sticky-safe)
      const probe = y + window.innerHeight * 0.45;
      let idx = -1;
      const list = tops.length ? tops : sections.map(naturalTop);
      list.forEach((t, i) => { if (t <= probe) idx = i; });
      setActive(idx <= 0 ? -1 : idx);
    },
  });

  // ------------------------------------------------------------------
  // Keep geometry in sync with fonts / resizes / accordion height changes
  // ------------------------------------------------------------------
  let t = null;
  const schedule = () => {
    layout();
    clearTimeout(t);
    t = setTimeout(() => ST.refresh(), 180);
  };
  if ('ResizeObserver' in window) {
    new ResizeObserver(schedule).observe(document.getElementById('main-content'));
  }
  window.addEventListener('resize', schedule);
  document.fonts?.ready.then(() => ST.refresh());
  window.addEventListener('load', () => ST.refresh());

  ready = true;
}

export const stackReady = () => ready;
