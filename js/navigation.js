/** Accessible navigation, smooth anchors, and active section feedback. */
import { scrollToTarget } from './scroll.js';
import { prefersReduced } from './utils.js';

export function initNavigation() {
  const toggleBtn = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const drawerLinks = drawer?.querySelectorAll('a, button') ?? [];
  const anchors = document.querySelectorAll('a[href^="#"]');
  if (!toggleBtn || !drawer) return;

  let open = false;
  let previousOverflow = '';
  function openDrawer() {
    open = true;
    previousOverflow = document.body.style.overflow;
    toggleBtn.setAttribute('aria-expanded', 'true');
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.inert = false;
    document.body.style.overflow = 'hidden';
    drawer.querySelector('a, button')?.focus();
  }
  function closeDrawer(restoreFocus = true) {
    if (!open) return;
    open = false;
    toggleBtn.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.inert = true;
    document.body.style.overflow = previousOverflow;
    if (restoreFocus) toggleBtn.focus();
  }

  toggleBtn.addEventListener('click', () => open ? closeDrawer() : openDrawer());
  drawer.addEventListener('click', (event) => { if (event.target === drawer) closeDrawer(); });
  drawerLinks.forEach((link) => link.addEventListener('click', () => closeDrawer(false)));
  drawer.inert = true;

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && open) closeDrawer();
    if (event.key !== 'Tab' || !open) return;
    const focusable = [...drawer.querySelectorAll('a[href], button:not([disabled])')];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });

  anchors.forEach((anchor) => anchor.addEventListener('click', (event) => {
    const id = anchor.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    scrollToTarget(target);
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }));

  // scroll.js drives the active link when the stacked layout is on;
  // this observer is only the fallback (reduced motion / no GSAP).
  if (!(prefersReduced() || !window.ScrollTrigger)) return;
  const sectionLinks = [...document.querySelectorAll('.nav-link[href^="#"]')];
  const sections = sectionLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!current) {
        sectionLinks.forEach((link) => {
          link.classList.remove('is-active');
          link.removeAttribute('aria-current');
        });
        return;
      }
      sectionLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${current.target.id}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-18% 0px -62% 0px', threshold: [0, 0.1, 0.35] });
    sections.forEach((section) => observer.observe(section));
  }
}
