// ============================================
// JURNAL — Main interactions
// ============================================

(function () {
  'use strict';

  // ---------- Mobile nav toggle ----------
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded',
        navLinks.classList.contains('open') ? 'true' : 'false');
    });

    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  // ---------- Fade-up on scroll ----------
  const fadeEls = document.querySelectorAll('.fade-up');
  if ('IntersectionObserver' in window && fadeEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 80);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    fadeEls.forEach(el => io.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  // ---------- Filter tabs (category pages) ----------
  const filterTabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.journal-card[data-category]');

  if (filterTabs.length && cards.length) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const filter = tab.dataset.filter;

        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        cards.forEach(card => {
          const cat = card.dataset.category;
          const show = filter === 'all' || cat === filter;
          card.style.display = show ? '' : 'none';
          card.style.animation = show ? 'fadeIn 0.5s var(--transition) both' : '';
        });
      });
    });
  }

  // ---------- Newsletter (demo only) ----------
  const form = document.querySelector('.newsletter-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      if (!input || !input.value) return;
      const btn = form.querySelector('button');
      const original = btn.textContent;
      btn.textContent = 'Terima kasih ✦';
      btn.disabled = true;
      input.value = '';
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 2400);
    });
  }

  // ---------- Reading progress (single article) ----------
  const progressBar = document.querySelector('.reading-progress');
  if (progressBar) {
    const update = () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop) /
        Math.max(1, (h.scrollHeight - h.clientHeight));
      progressBar.style.transform = `scaleX(${scrolled})`;
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }
})();

// Keyframe (added dynamically so it lives in JS land)
const style = document.createElement('style');
style.textContent = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(style);
