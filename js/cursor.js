/** Custom cursor: a lagging ring that grows on links and becomes a label bubble on [data-cursor]. */
import { prefersReduced, isFinePointer } from './utils.js';

const LABELS = { view: 'View', open: 'Open', close: 'Close', drag: 'Drag' };

export function initCursor() {
  const gsap = window.gsap;
  if (!gsap || prefersReduced() || !isFinePointer()) return;

  const ring = document.querySelector('.cursor-ring');
  const label = document.querySelector('.cursor-label');
  const labelText = label?.querySelector('span');
  if (!ring || !label) return;

  gsap.set([ring, label], { xPercent: 0, yPercent: 0 });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });
  const lx = gsap.quickTo(label, 'x', { duration: 0.3, ease: 'power3.out' });
  const ly = gsap.quickTo(label, 'y', { duration: 0.3, ease: 'power3.out' });

  let labelOn = false;

  const showLabel = (text) => {
    if (labelText) labelText.textContent = text;
    if (labelOn) return;
    labelOn = true;
    ring.classList.add('is-label');
    gsap.to(label, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.7)', overwrite: 'auto' });
  };
  const hideLabel = () => {
    if (!labelOn) return;
    labelOn = false;
    ring.classList.remove('is-label');
    gsap.to(label, { scale: 0, opacity: 0, duration: 0.3, ease: 'power3.in', overwrite: 'auto' });
  };

  const labelFor = (el) => {
    const kind = el.dataset.cursor;
    if (kind === 'open') return el.classList.contains('is-open') ? LABELS.close : LABELS.open;
    return LABELS[kind] || kind;
  };

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    ring.classList.add('is-active');
    rx(e.clientX); ry(e.clientY);
    lx(e.clientX); ly(e.clientY);
  }, { passive: true });

  document.documentElement.addEventListener('pointerleave', () => { ring.classList.remove('is-active'); hideLabel(); });

  document.addEventListener('pointerover', (e) => {
    const lab = e.target.closest?.('[data-cursor]');
    if (lab) { showLabel(labelFor(lab)); ring.classList.remove('is-link'); return; }
    hideLabel();
    ring.classList.toggle('is-link', !!e.target.closest?.('a[href], button, [role="button"], input, textarea, select'));
  });

  // keep "Open/Close" in sync after a toggle
  document.addEventListener('click', (e) => {
    const lab = e.target.closest?.('[data-cursor="open"]');
    if (lab) requestAnimationFrame(() => labelOn && showLabel(labelFor(lab)));
  });
}
