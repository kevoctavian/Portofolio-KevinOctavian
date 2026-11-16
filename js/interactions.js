/**
 * KEVIN OCTAVIANUS — PERSONAL PORTFOLIO 2026
 * Micro-Interactions & Editorial Utilities
 */

let toastTimeout = null;
let interactionsInitialized = false;

export function showToast(message, actionLabel = '', actionUrl = '') {
  let toast = document.getElementById('editorial-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'editorial-toast';
    toast.className = 'editorial-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  toast.replaceChildren();
  const dot = document.createElement('span');
  dot.className = 'editorial-toast-dot';
  dot.setAttribute('aria-hidden', 'true');
  const text = document.createElement('span');
  text.className = 'editorial-toast-text';
  text.textContent = message;
  toast.append(dot, text);
  if (actionLabel && actionUrl) {
    const action = document.createElement('a');
    action.href = actionUrl;
    action.className = 'editorial-toast-action';
    action.textContent = actionLabel;
    toast.append(action);
  }

  toast.classList.add('is-visible');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 3800);
}

export function initInteractions() {
  if (interactionsInitialized) return;
  interactionsInitialized = true;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Live Jakarta Time (WIB / UTC+7) Clock in Technical Footer
  const timeElements = document.querySelectorAll('.live-time-target, #live-jakarta-time');
  if (timeElements.length > 0) {
    function updateJakartaTime() {
      try {
        const now = new Date();
        const options = {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        };
        const formatter = new Intl.DateTimeFormat('en-GB', options);
        const timeStr = `${formatter.format(now)} WIB`;
        timeElements.forEach(el => { el.textContent = timeStr; });
      } catch (e) {
        timeElements.forEach(el => { el.textContent = '13:30:00 WIB'; });
      }
    }
    updateJakartaTime();
    const timer = setInterval(updateJakartaTime, 1000);
    window.addEventListener('pagehide', () => clearInterval(timer), { once: true });
  }

  // 2. Desktop-Only Refined Magnetic Hover for Primary Interactive CTA Buttons
  if (supportsHover && !isTouchDevice && !prefersReducedMotion) {
    const magneticElements = document.querySelectorAll('.btn-dark, .btn-pill');

    magneticElements.forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        el.style.transition = 'background-color 0.2s ease, box-shadow 0.2s ease';
        el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease, box-shadow 0.2s ease';
        el.style.transform = '';
      });
    });
  }

  // 3. Email: the link opens a Gmail compose window (To: already filled in).
  //    We only add a small confirmation toast; the browser handles the navigation.
  const copyBtn = document.getElementById('copy-email-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      showToast('Opening Gmail to compose a message to kevinoctavian710@gmail.com');
    });
  }

  // 4. Back To Top Action
  const backToTopBtn = document.querySelector('.btn-back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      if (window.portfolioLenis) window.portfolioLenis.scrollTo(0, { duration: 1.8, easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) });
      else window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  // 5. Lucide Icons Initializer
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
