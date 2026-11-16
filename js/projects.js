/**
 * KEVIN OCTAVIANUS — PERSONAL PORTFOLIO 2026
 * Project Case Studies Data & Accessible Modal Dialog
 */

export const PROJECTS_DATA = {
  inventory: {
    id: 'inventory',
    title: 'Internal Inventory Management System',
    subtitle: 'Centralized Business Application for Stock, QC, & Purchasing Workflows',
    category: 'Internal Web Application',
    timeline: 'Sep 2025 – Aug 2026',
    role: 'Web Application Developer & IT Support',
    company: 'PT Javinci Berkat Kreatif Sentosa',
    problem: 'Inventory and operational records were maintained in separate spreadsheet files that had to be stored and managed individually. Access to up-to-date information and centralized reporting was more difficult, requiring a structured and centralized data management approach.',
    solution: 'An internal web application backed by PostgreSQL providing centralized data management, integrated inventory and purchasing workflows, goods receipt and QC modules, stock monitoring and reporting, structured database storage, and easier data retrieval and filtering.',
    contributions: [
      'Developed Stock Min/Max reporting modules and inventory mutation summaries to support stock monitoring and operational reporting.',
      'Built Quality Control (QC) inspection modules with complete CRUD functionality for raw material verification.',
      'Implemented PDF shipment receipt upload and validation features to streamline document management and verification workflows.',
      'Enhanced Purchase Order (PO) management systems with goods receipt integration, dynamic filtering, and AJAX-based product autocompletion.',
      'Structured PostgreSQL database schemas for centralized storage, easier data retrieval, and dynamic filtering across operational records.'
    ],
    technologies: ['Python', 'Django', 'PostgreSQL', 'JavaScript', 'AJAX', 'HTML5/CSS3'],
    images: [
      { src: 'assets/images/projects/inventory/min-max.png', alt: 'Stock Min/Max Reporting Module Interface' },
      { src: 'assets/images/projects/inventory/mutation-summary.png', alt: 'Inventory Mutation Summary Table and Filters' },
      { src: 'assets/images/projects/inventory/qc-menu.png', alt: 'Quality Control Raw Material Inspection Module' },
      { src: 'assets/images/projects/inventory/po-menu.png', alt: 'Purchase Order Management Dashboard' }
    ]
  },
  'rice-leaf': {
    id: 'rice-leaf',
    title: 'Rice Leaf Disease Classification',
    subtitle: 'Machine Learning Web Application for Agricultural Disease Identification',
    category: 'Applied Machine Learning & Web App',
    timeline: 'Academic Capstone Project',
    role: 'Fullstack & ML Application Developer',
    company: 'Informatics Research',
    problem: 'Identifying rice leaf diseases manually in agricultural fields is challenging, time-consuming, and prone to misdiagnosis, which can lead to delayed treatment and crop yield losses.',
    solution: 'A web-based image classification application using Random Forest algorithm to accurately identify and classify rice leaf conditions into four distinct classes: Brown Bacterial Leaf Blight, Rice Blast, Tungro, and Healthy leaf tissue.',
    contributions: [
      'Designed and developed the full web application interface allowing users to upload leaf photos and receive real-time classification results.',
      'Integrated OpenCV image preprocessing workflows to prepare agricultural photographs for model inference.',
      'Trained and evaluated the Random Forest classifier across verified leaf disease datasets.',
      'Implemented administrative dashboard, classification history logging, confusion matrix evaluations, and disease mitigation reference pages.'
    ],
    technologies: ['Python', 'Django', 'Random Forest', 'OpenCV', 'PostgreSQL', 'JavaScript'],
    images: [
      { src: 'assets/images/projects/rice-leaf/DiseaseInfo.png', alt: 'Disease Information and Mitigation Reference Page' },
      { src: 'assets/images/projects/rice-leaf/Upload.png', alt: 'Rice Leaf Image Upload and Diagnosis Interface' },
      { src: 'assets/images/projects/rice-leaf/AdminDashboard.png', alt: 'Administrative Dashboard and Dataset Metrics' },
      { src: 'assets/images/projects/rice-leaf/ConfusionMatrix.png', alt: 'Classification Model Performance and Confusion Matrix' }
    ]
  }
};

export function initProjectsModal() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;

  const closeBtn = modal.querySelector('.modal-close-btn');
  const modalBox = modal.querySelector('.modal-dialog-box');
  const triggerBtns = document.querySelectorAll('[data-open-project]');
  let lastFocusedElement = null;
  let previousOverflow = '';
  let closeTimer = null;

  let revealOrigin = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const canAnimate = () => !!window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reach = (o) => Math.hypot(Math.max(o.x, window.innerWidth - o.x), Math.max(o.y, window.innerHeight - o.y)) + 40;

  function openModal(projectId, origin) {
    const data = PROJECTS_DATA[projectId];
    if (!data) return;
    if (origin) revealOrigin = origin;

    lastFocusedElement = document.activeElement;

    // Populate modal contents
    document.getElementById('modal-project-title').textContent = data.title;
    document.getElementById('modal-project-subtitle').textContent = data.subtitle;
    document.getElementById('modal-project-role').textContent = `${data.role} · ${data.company}`;
    document.getElementById('modal-project-problem').textContent = data.problem;
    document.getElementById('modal-project-solution').textContent = data.solution;

    // Contributions
    const contribList = document.getElementById('modal-project-contributions');
    contribList.innerHTML = data.contributions.map(c => `<li>${c}</li>`).join('');

    // Technologies
    const techList = document.getElementById('modal-project-tech');
    techList.innerHTML = data.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('');

    // Gallery
    const galleryRow = document.getElementById('modal-project-gallery');
    galleryRow.innerHTML = data.images.map(img => `
      <div class="modal-gallery-item">
        <img src="${img.src}" alt="${img.alt}" loading="lazy">
      </div>
    `).join('');

    // Display
    clearTimeout(closeTimer);
    previousOverflow = document.body.style.overflow;
    modal.inert = false;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    window.portfolioLenis?.stop();
    const page = document.querySelector('.page-wrapper');
    if (page) page.inert = true;

    // Trap focus
    closeBtn.focus();

    // Circular reveal from the clicked point + staggered content
    if (canAnimate()) {
      const gsap = window.gsap;
      const { x, y } = revealOrigin;
      modal.classList.add('is-revealing');
      gsap.fromTo(modal,
        { clipPath: `circle(0px at ${x}px ${y}px)` },
        {
          clipPath: `circle(${reach(revealOrigin)}px at ${x}px ${y}px)`,
          duration: 0.95, ease: 'power3.inOut',
          onComplete: () => { gsap.set(modal, { clearProps: 'clipPath' }); modal.classList.remove('is-revealing'); },
        });
      gsap.fromTo(modalBox, { y: 60, scale: 0.94 }, { y: 0, scale: 1, duration: 1.1, ease: 'power3.out', clearProps: 'transform' });
      gsap.fromTo('.modal-header > *, .modal-body > .pillar-block, .modal-gallery-item',
        { autoAlpha: 0, y: 34 },
        { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07, delay: 0.35, ease: 'power3.out', clearProps: 'opacity,visibility,transform' });
    }
  }

  function closeModal() {
    if (!modal.classList.contains('is-open') || modal.dataset.closing) return;
    if (canAnimate()) {
      const gsap = window.gsap;
      const { x, y } = revealOrigin;
      modal.dataset.closing = '1';
      modal.classList.add('is-revealing');
      gsap.to(modal, {
        clipPath: `circle(0px at ${x}px ${y}px)`,
        duration: 0.7, ease: 'power3.inOut',
        onComplete: () => {
          delete modal.dataset.closing;
          gsap.set(modal, { clearProps: 'clipPath' });
          modal.classList.remove('is-revealing');
          finishModalClose();
        },
      });
      return;
    }
    finishModalClose();
  }

  function finishModalClose() {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = previousOverflow;
    const page = document.querySelector('.page-wrapper');
    if (page) page.inert = false;
    const finishClose = () => {
      clearTimeout(closeTimer);
      modal.setAttribute('aria-hidden', 'true');
      modal.inert = true;
      modal.removeEventListener('transitionend', onTransitionEnd);
      if (lastFocusedElement?.isConnected) lastFocusedElement.focus();
      window.portfolioLenis?.start();
    };
    const onTransitionEnd = (event) => { if (event.target === modal) finishClose(); };
    modal.addEventListener('transitionend', onTransitionEnd);
    closeTimer = setTimeout(finishClose, 350);
  }

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projId = btn.getAttribute('data-open-project');
      let origin;
      if (e.clientX || e.clientY) origin = { x: e.clientX, y: e.clientY };
      else {
        const r = btn.getBoundingClientRect(); // keyboard activation
        origin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      openModal(projId, origin);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
      return;
    }
    if (e.key === 'Tab' && modal.classList.contains('is-open')) {
      const focusable = [...modal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) { e.preventDefault(); first?.focus(); }
    }
  });

  modal.inert = true;
}
