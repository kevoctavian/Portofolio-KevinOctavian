/**
 * Motion choreography: Lenis smooth scroll, preloader, hero entrance,
 * split-text reveals, parallax, tilt, counters and section reveals.
 * Stacking cards / nav / progress live in scroll.js.
 */
import { splitChars, splitWords, openMasks, calibrateSplits, prefersReduced, isTouch, isFinePointer } from './utils.js';

let lenisInstance = null;
let lenisTick = null;
let initialized = false;

export function initAnimations() {
  if (initialized || !window.gsap) return;
  initialized = true;

  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  const reduced = prefersReduced();
  const touch = isTouch();
  const preloader = document.getElementById('preloader');

  if (ST) gsap.registerPlugin(ST);

  if (reduced) {
    preloader?.remove();
    return;
  }

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  // ------------------------------------------------------------------
  // Smooth scroll (desktop only). One RAF loop shared with GSAP.
  // ------------------------------------------------------------------
  if (!touch && window.Lenis && ST) {
    lenisInstance = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
    });
    lenisInstance.on('scroll', ST.update);
    lenisTick = (time) => lenisInstance?.raf(time * 1000);
    gsap.ticker.add(lenisTick);
    gsap.ticker.lagSmoothing(0);
    window.portfolioLenis = lenisInstance;
    lenisInstance.stop(); // locked until the intro has finished
  } else {
    document.body.style.overflow = 'hidden';
  }

  // ------------------------------------------------------------------
  // Split text
  // ------------------------------------------------------------------
  const heroChars = [...document.querySelectorAll('.hero-name-first, .hero-name-last')]
    .flatMap((el) => splitChars(el, { label: false, preserveWidth: true }));
  // Re-measure once the web fonts have actually loaded, and on resize
  document.fonts?.ready.then(calibrateSplits);
  let calTimer = null;
  window.addEventListener('resize', () => { clearTimeout(calTimer); calTimer = setTimeout(calibrateSplits, 120); });
  const titleGroups = [...document.querySelectorAll('[data-split]')]
    .map((el) => ({ el, chars: splitChars(el) }));
  const leadWords = splitWords(document.querySelector('[data-scrub-words]'));

  // ------------------------------------------------------------------
  // Initial states
  // ------------------------------------------------------------------
  gsap.set('.animate-nav-item', { autoAlpha: 0, y: -14 });
  gsap.set(heroChars, { yPercent: 118 });
  gsap.set('.hero-portrait-frame', { autoAlpha: 0, clipPath: 'inset(100% 0 0 0)' });
  gsap.set('.hero-portrait-img', { scale: 1.18 });
  gsap.set('.animate-hero-intro', { autoAlpha: 0, y: 18 });
  gsap.set('.animate-social-item', { autoAlpha: 0, x: 14 });
  gsap.set('.hero-footer-bar', { autoAlpha: 0, y: 10 });

  // ------------------------------------------------------------------
  // Entrance timeline
  // ------------------------------------------------------------------
  const progressBar = document.getElementById('preloader-progress');
  const countDisplay = document.getElementById('preloader-count');
  const tl = gsap.timeline({
    onComplete: () => {
      openMasks(heroChars);
      lenisInstance?.start();
      document.body.style.overflow = '';
      ST?.refresh();
      document.dispatchEvent(new CustomEvent('intro:done'));
    },
  });

  if (preloader) {
    const o = { v: 0 };
    tl.to(o, {
      v: 100,
      duration: 1.05,
      ease: 'power2.inOut',
      onUpdate: () => {
        const val = Math.round(o.v);
        if (progressBar) progressBar.style.width = `${val}%`;
        if (countDisplay) countDisplay.textContent = `${val < 10 ? '0' : ''}${val}%`;
      },
    });
    tl.to('.preloader-center', { y: -24, autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, '+=0.05');
    tl.to(preloader, {
      yPercent: -100,
      duration: 0.95,
      ease: 'power4.inOut',
      onComplete: () => preloader.remove(),
    }, '-=0.2');
  }

  tl.to('.animate-nav-item', { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, preloader ? '-=0.45' : 0)
    .to(heroChars, { yPercent: 0, duration: 1.15, stagger: { each: 0.045, from: 'start' }, ease: 'power4.out' }, '<0.05')
    .to('.hero-portrait-frame', { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'power3.inOut' }, '<0.25')
    .to('.hero-portrait-img', { scale: 1, duration: 1.6, ease: 'power3.out' }, '<')
    .to('.animate-hero-intro', { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, '<0.45')
    .to('.animate-social-item', { autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.07, ease: 'power3.out' }, '<0.1')
    .to('.hero-footer-bar', { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '<0.2');

  if (!ST) return;

  // ------------------------------------------------------------------
  // Section headings: ghost drift + char reveal + kicker fade
  // ------------------------------------------------------------------
  gsap.utils.toArray('[data-ghost]').forEach((ghost) => {
    gsap.fromTo(ghost, { xPercent: -7 }, {
      xPercent: 7,
      ease: 'none',
      scrollTrigger: { trigger: ghost.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  titleGroups.forEach(({ el, chars }) => {
    gsap.set(chars, { yPercent: 112 });
    gsap.to(chars, {
      yPercent: 0,
      duration: 1,
      stagger: 0.028,
      ease: 'power4.out',
      onComplete: () => openMasks(chars),
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  gsap.utils.toArray('.section-kicker-row, .section-subtitle-editorial').forEach((el) => {
    gsap.fromTo(el, { autoAlpha: 0, y: 16 }, {
      autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  // ------------------------------------------------------------------
  // Selected work: reveal + image parallax + 3D tilt
  // ------------------------------------------------------------------
  gsap.utils.toArray('#work .project-card').forEach((card, i) => {
    const media = card.querySelector('.project-media-wrapper');
    const parallax = card.querySelector('.project-media-parallax');
    const body = card.querySelectorAll('.project-body > *');

    gsap.fromTo(card, { autoAlpha: 0, y: 90 }, {
      autoAlpha: 1, y: 0, duration: 1.1, ease: 'power3.out', delay: (i % 2) * 0.12,
      scrollTrigger: { trigger: card, start: 'top 90%', once: true },
    });

    if (media && parallax) {
      gsap.fromTo(media, { clipPath: 'inset(0 0 100% 0)' }, {
        clipPath: 'inset(0 0 0% 0)', duration: 1.2, ease: 'power4.inOut',
        scrollTrigger: { trigger: card, start: 'top 85%', once: true },
      });
      gsap.fromTo(parallax, { scale: 1.25 }, {
        scale: 1, duration: 1.6, ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 85%', once: true },
      });
      // Scroll parallax uses yPercent on the wrapper; reveal uses scale; <img> keeps its CSS hover zoom
      gsap.fromTo(parallax, { yPercent: -5 }, {
        yPercent: 5, ease: 'none',
        scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }

    gsap.fromTo(body, { autoAlpha: 0, y: 22 }, {
      autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 70%', once: true },
    });

    if (isFinePointer()) {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, {
          rotationY: px * 5, rotationX: -py * 4, transformPerspective: 1100,
          duration: 0.6, ease: 'power3.out', overwrite: 'auto',
        });
      });
      card.addEventListener('pointerleave', () => {
        gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.9, ease: 'elastic.out(1, 0.6)', overwrite: 'auto' });
      });
    }
  });

  // ------------------------------------------------------------------
  // About: word-by-word fill on scroll, cards, pills, GPA counter
  // ------------------------------------------------------------------
  if (leadWords.length) {
    gsap.fromTo(leadWords, { opacity: 0.16 }, {
      opacity: 1, stagger: 0.14, ease: 'none',
      scrollTrigger: { trigger: '.about-lead-statement', start: 'top 82%', end: 'bottom 48%', scrub: true },
    });
  }

  gsap.fromTo('#about .about-paragraph, #about .about-highlight-box', { autoAlpha: 0, y: 30 }, {
    autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '.about-bio-pane', start: 'top 60%', once: true },
  });

  gsap.fromTo('#about .credentials-card', { autoAlpha: 0, y: 50, rotate: 1.2 }, {
    autoAlpha: 1, y: 0, rotate: 0, duration: 1, stagger: 0.18, ease: 'power3.out',
    scrollTrigger: { trigger: '.about-credentials-pane', start: 'top 82%', once: true },
  });

  gsap.fromTo('#about .skill-pills-row .tech-tag', { autoAlpha: 0, scale: 0.7, y: 10 }, {
    autoAlpha: 1, scale: 1, y: 0, duration: 0.55, stagger: 0.035, ease: 'back.out(1.8)',
    scrollTrigger: { trigger: '.skills-matrix', start: 'top 88%', once: true },
  });

  document.querySelectorAll('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const o = { v: 0 };
    el.textContent = (0).toFixed(dec);
    gsap.to(o, {
      v: end, duration: 1.8, ease: 'power3.out',
      onUpdate: () => { el.textContent = o.v.toFixed(dec); },
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  });

  // ------------------------------------------------------------------
  // Experience: rows rise in, hairlines draw
  // ------------------------------------------------------------------
  const rows = gsap.utils.toArray('#experience .experience-row');
  if (rows.length) {
    gsap.fromTo(rows, { autoAlpha: 0, y: 46 }, {
      autoAlpha: 1, y: 0, duration: 1, stagger: 0.14, ease: 'power3.out',
      clearProps: 'opacity,visibility,transform',
      scrollTrigger: { trigger: '#experience .experience-list', start: 'top 86%', once: true },
    });
    gsap.fromTo(rows, { '--line': 0 }, {
      '--line': 1, duration: 1.4, stagger: 0.14, ease: 'power3.inOut',
      scrollTrigger: { trigger: '#experience .experience-list', start: 'top 86%', once: true },
    });
  }

  // ------------------------------------------------------------------
  // Contact
  // ------------------------------------------------------------------
  const contactCard = document.querySelector('#contact .contact-card-editorial');
  if (contactCard) {
    gsap.fromTo(contactCard, { autoAlpha: 0, y: 70, scale: 0.96 }, {
      autoAlpha: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: contactCard, start: 'top 90%', once: true },
    });
    gsap.fromTo('#contact .contact-desc, #contact .contact-social-row, #contact .contact-direct-link',
      { autoAlpha: 0, y: 24 }, {
        autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', delay: 0.25,
        scrollTrigger: { trigger: contactCard, start: 'top 78%', once: true },
      });
  }

  gsap.fromTo('.editorial-footer-bar > *', { autoAlpha: 0, y: 16 }, {
    autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.editorial-footer-bar', start: 'top 98%', once: true },
  });
}

export function cleanupAnimations() {
  if (window.gsap && lenisTick) window.gsap.ticker.remove(lenisTick);
  lenisTick = null;
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
    window.portfolioLenis = null;
  }
  window.ScrollTrigger?.getAll().forEach((t) => t.kill());
  initialized = false;
}
