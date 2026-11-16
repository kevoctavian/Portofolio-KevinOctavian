/** Small shared helpers for the motion layer. */

export const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isFinePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
export const isTouch = () => window.matchMedia('(hover: none), (pointer: coarse)').matches;

/**
 * Split an element's text into masked characters:
 * <span.split-word><span.split-mask><span.split-char>A</span></span>…</span>
 * Words stay unbreakable so wrapping still happens between words.
 * Returns the array of .split-char elements.
 */
export function splitChars(el, { label = true, preserveWidth = false } = {}) {
  if (!el) return [];
  if (el._chars) return el._chars;

  const text = el.textContent.replace(/\s+/g, ' ').trim();
  if (label && /^H[1-6]$/.test(el.tagName)) el.setAttribute('aria-label', text);

  el.textContent = '';
  const frag = document.createDocumentFragment();
  const chars = [];

  text.split(' ').forEach((word, wi, arr) => {
    const w = document.createElement('span');
    w.className = 'split-word';
    w.setAttribute('aria-hidden', 'true');
    [...word].forEach((ch) => {
      const mask = document.createElement('span');
      mask.className = 'split-mask';
      const c = document.createElement('span');
      c.className = 'split-char';
      c.textContent = ch;
      mask.appendChild(c);
      w.appendChild(mask);
      chars.push(c);
    });
    frag.appendChild(w);
    if (wi < arr.length - 1) frag.appendChild(document.createTextNode(' '));
  });

  el.appendChild(frag);
  el._chars = chars;
  if (preserveWidth) trackWidth(el, text, chars);
  return chars;
}

/**
 * Splitting into inline-blocks drops kerning, so the line gets wider than the
 * original text. Keep an invisible unsplit twin and spread the difference over
 * the characters so the layout is identical to the unsplit version.
 */
const tracked = [];
function trackWidth(el, text, chars) {
  const twin = el.cloneNode(false);
  twin.textContent = text;
  twin.removeAttribute('aria-label');
  twin.setAttribute('aria-hidden', 'true');
  twin.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;white-space:nowrap;left:0;top:0;';
  twin.classList.remove('animate-hero-name');
  el.parentElement.appendChild(twin);
  tracked.push({ el, twin, chars });
  calibrate({ el, twin, chars });
}

function calibrate({ el, twin, chars }) {
  chars.forEach((c) => { c.style.marginRight = '0'; });
  const natural = twin.getBoundingClientRect().width;
  const current = el.getBoundingClientRect().width;
  const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
  const em = (natural - current) / chars.length / fs;
  chars.forEach((c) => { c.style.marginRight = `${em.toFixed(5)}em`; });
}

export function calibrateSplits() {
  tracked.forEach(calibrate);
}

/** Wrap each word in <span.sw> (used for scroll-scrubbed paragraph reveal). */
export function splitWords(el) {
  if (!el) return [];
  if (el._words) return el._words;
  const text = el.textContent.replace(/\s+/g, ' ').trim();
  el.textContent = '';
  const words = [];
  text.split(' ').forEach((word, i, arr) => {
    const s = document.createElement('span');
    s.className = 'sw';
    s.textContent = word;
    el.appendChild(s);
    words.push(s);
    if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
  });
  el._words = words;
  return words;
}

/** Let masks overflow again once the reveal is done (needed for wave / hover effects). */
export function openMasks(chars) {
  chars.forEach((c) => c.parentElement?.classList.add('is-open'));
}
