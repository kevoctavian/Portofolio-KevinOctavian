/**
 * Hero interactions:
 *  - cursor spotlight on the portrait reveals a high-contrast "ink" version
 *  - letters of the name ripple away from the pointer
 *  - name / portrait drift with the mouse (depth)
 *  - scroll: name splits apart while the next card covers the hero
 */
import { prefersReduced, isFinePointer } from './utils.js';
import { naturalTop } from './scroll.js';

export function initHeroFX() {
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  if (!gsap || prefersReduced()) return;

  const hero = document.querySelector('.hero-section');
  const frame = document.querySelector('.hero-portrait-frame');
  const img = frame?.querySelector('.hero-portrait-img');
  const nameFirst = document.querySelector('.hero-name-first');
  const nameLast = document.querySelector('.hero-name-last');
  const portraitWrap = document.querySelector('.hero-portrait-wrapper');
  if (!hero) return;

  // ------------------------------------------------------------------
  // Scroll choreography (driven by the next card covering the hero)
  // ------------------------------------------------------------------
  const work = document.getElementById('work');
  if (ST && work) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      const gap = () => parseFloat(getComputedStyle(document.querySelector('.page-wrapper')).paddingTop) || 0;
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          start: () => naturalTop(work) - window.innerHeight + gap(),
          end: () => naturalTop(work) - gap(),
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
        .to(nameFirst, { yPercent: -22, xPercent: -2 }, 0)
        .to(nameLast, { yPercent: -8, xPercent: 2 }, 0)
        .to(portraitWrap, { yPercent: -5, scale: 1.08 }, 0)
        .to('.hero-left-content, .hero-right-content', { autoAlpha: 0.1, y: -36 }, 0)
        .to('.hero-footer-bar', { autoAlpha: 0 }, 0);
    });
  }

  if (!isFinePointer()) return;

  // ------------------------------------------------------------------
  // 1. Spotlight reveal on the portrait
  // ------------------------------------------------------------------
  if (frame && img) {
    const ink = document.createElement('img');
    ink.className = 'hero-portrait-ink';
    ink.alt = '';
    ink.setAttribute('aria-hidden', 'true');
    ink.decoding = 'async';
    // Fallback: darker version of the same photo.
    const syncSrc = () => { if (!ink.classList.contains('is-color')) ink.src = img.currentSrc || img.src; };
    syncSrc();
    if (!img.complete) img.addEventListener('load', syncSrc, { once: true });
    frame.appendChild(ink);

    // Preferred: a real colour photo placed next to the original.
    // Drop `kevin-portrait-color.png` (same framing/size, transparent background)
    // into assets/images/profile/ and the spotlight reveals it in full colour.
    const colorSrc = 'assets/images/profile/kevin-portrait-color.png';
    const probe = new Image();
    probe.onload = () => { ink.classList.add('is-color'); ink.src = colorSrc; };
    probe.src = colorSrc;

    const pos = { x: 0, y: 0 };
    const rad = { r: 1 };
    const render = () => {
      frame.style.setProperty('--mx', `${pos.x}px`);
      frame.style.setProperty('--my', `${pos.y}px`);
      frame.style.setProperty('--r', `${Math.max(rad.r, 1)}px`);
    };
    const local = (e) => {
      const r = frame.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width };
    };

    frame.addEventListener('pointerenter', (e) => {
      const p = local(e);
      pos.x = p.x; pos.y = p.y; render();
      gsap.to(rad, { r: p.w * 0.38, duration: 0.7, ease: 'power3.out', onUpdate: render, overwrite: true });
    });
    frame.addEventListener('pointermove', (e) => {
      const p = local(e);
      gsap.to(pos, { x: p.x, y: p.y, duration: 0.35, ease: 'power3.out', onUpdate: render, overwrite: true });
    });
    frame.addEventListener('pointerleave', () => {
      gsap.to(rad, { r: 1, duration: 0.6, ease: 'power3.inOut', onUpdate: render, overwrite: true });
    });
  }

  // ------------------------------------------------------------------
  // 2. Letter ripple + 3. mouse depth (enabled once the intro is done)
  // ------------------------------------------------------------------
  document.addEventListener('intro:done', () => {
    const chars = [...hero.querySelectorAll('.hero-name .split-char')];
    const setY = chars.map((c) => gsap.quickTo(c, 'y', { duration: 0.55, ease: 'power3.out' }));
    const header = hero.querySelector('.hero-header');

    header?.addEventListener('pointermove', (e) => {
      chars.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const d = e.clientX - cx;
        const dy = Math.abs(e.clientY - (r.top + r.height / 2));
        const influence = Math.exp(-(d * d) / (2 * 120 * 120)) * Math.exp(-(dy * dy) / (2 * 220 * 220));
        setY[i](-34 * influence);
      });
    });
    header?.addEventListener('pointerleave', () => setY.forEach((fn) => fn(0)));

    const qFirst = gsap.quickTo(nameFirst, 'x', { duration: 0.9, ease: 'power3.out' });
    const qLast = gsap.quickTo(nameLast, 'x', { duration: 0.9, ease: 'power3.out' });
    const qPx = gsap.quickTo(frame, 'x', { duration: 1, ease: 'power3.out' });
    const qPy = gsap.quickTo(frame, 'y', { duration: 1, ease: 'power3.out' });

    hero.addEventListener('pointermove', (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      qFirst(nx * 22);
      qLast(nx * 34);
      qPx(-nx * 16);
      qPy(-ny * 10);
    });
    hero.addEventListener('pointerleave', () => { qFirst(0); qLast(0); qPx(0); qPy(0); });
  }, { once: true });
}
