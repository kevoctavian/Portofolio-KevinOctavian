/**
 * Experience section:
 *  - accessible accordion (first row open) — height animation is pure CSS
 *  - hovered row stays bright, others dim
 *  - floating, tilting preview follows the pointer (fine pointers only)
 */
import { prefersReduced, isFinePointer } from './utils.js';

export function initExperience() {
  const list = document.querySelector('[data-exp-list]');
  if (!list) return;
  const rows = [...list.querySelectorAll('[data-exp]')];

  const setOpen = (row, state) => {
    row.classList.toggle('is-open', state);
    row.querySelector('.exp-toggle')?.setAttribute('aria-expanded', String(state));
  };
  const toggle = (row) => {
    const next = !row.classList.contains('is-open');
    rows.forEach((r) => { if (r !== row) setOpen(r, false); });
    setOpen(row, next);
  };

  rows.forEach((row) => {
    row.querySelector('.exp-toggle')?.addEventListener('click', (e) => { e.stopPropagation(); toggle(row); });
    // Whole row is a click target for pointer users (button stays the keyboard path)
    row.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      if (String(window.getSelection?.() || '')) return;
      toggle(row);
    });
  });

  if (prefersReduced() || !isFinePointer() || !window.gsap) return;

  const gsap = window.gsap;
  const preview = document.querySelector('.hover-preview');
  if (!preview) return;
  const img = preview.querySelector('img');
  const kicker = preview.querySelector('.hp-kicker');
  const title = preview.querySelector('.hp-title');

  const qx = gsap.quickTo(preview, 'x', { duration: 0.55, ease: 'power3.out' });
  const qy = gsap.quickTo(preview, 'y', { duration: 0.55, ease: 'power3.out' });
  const qr = gsap.quickTo(preview, 'rotation', { duration: 0.7, ease: 'power3.out' });
  let settle = null;

  const place = (e) => {
    const w = preview.offsetWidth || 260;
    const h = preview.offsetHeight || 195;
    let x = e.clientX + 38;
    if (x + w > window.innerWidth - 16) x = e.clientX - w - 38;
    const y = Math.min(Math.max(16, e.clientY - h / 2), window.innerHeight - h - 16);
    qx(x); qy(y);
  };

  const show = (row, e) => {
    const src = row.dataset.previewImg;
    preview.classList.toggle('is-img', !!src);
    preview.classList.toggle('is-tile', !src);
    if (src) {
      if (!img.src.endsWith(src)) img.src = src;
      img.style.objectPosition = row.dataset.previewPos || '50% 0%';
    }
    kicker.textContent = row.dataset.previewKicker || '';
    title.textContent = row.dataset.previewTitle || '';
    // jump to pointer first so it doesn't fly in from the last position
    const w = preview.offsetWidth || 260;
    gsap.set(preview, { x: e.clientX + 38 + (e.clientX + 38 + w > innerWidth - 16 ? -(w + 76) : 0), y: Math.max(16, e.clientY - 100) });
    gsap.fromTo(preview, { autoAlpha: 0, scale: 0.82 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
    place(e);
  };

  rows.forEach((row) => {
    row.addEventListener('pointerenter', (e) => {
      list.classList.add('has-hover');
      row.classList.add('is-hovered');
      show(row, e);
    });
    row.addEventListener('pointermove', (e) => {
      place(e);
      qr(gsap.utils.clamp(-13, 13, e.movementX * 0.9));
      clearTimeout(settle);
      settle = setTimeout(() => qr(-3), 140);
    });
    row.addEventListener('pointerleave', () => {
      row.classList.remove('is-hovered');
      list.classList.remove('has-hover');
      gsap.to(preview, { autoAlpha: 0, scale: 0.88, duration: 0.35, ease: 'power3.in', overwrite: 'auto' });
    });
  });
}
