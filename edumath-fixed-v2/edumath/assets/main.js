/* ════════════════════════════════════════════
   EDU MATH — Main JS
   ════════════════════════════════════════════ */

/* ── Navbar scroll shadow ─────────────────────────── */
window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 20);
});

/* ── Hamburger menu ─────────────────────────── */
function toggleMenu() {
  document.querySelector('.nav-links')?.classList.toggle('open');
}

/* ── Animated counter ─────────────────────────── */
function animateCounters() {
  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    const duration = 1800;
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current >= 1000 ? (current / 1000).toFixed(current >= 10000 ? 0 : 1) + 'K' : current;
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target >= 1000 ? (target / 1000).toFixed(target >= 10000 ? 0 : 1) + 'K' : target;
    };
    requestAnimationFrame(update);
  });
}

/* ── Intersection observer for counters ─────────────────────────── */
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { animateCounters(); observer.disconnect(); }
  }, { threshold: 0.5 });
  observer.observe(heroStats);
}

/* ── Fade-in animations ─────────────────────────── */
const fadeEls = document.querySelectorAll('.grade-card, .feature-card, .testimonial-card');
if (fadeEls.length && 'IntersectionObserver' in window) {
  fadeEls.forEach(el => { el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; el.style.transition = 'opacity .5s ease, transform .5s ease'; });
  const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  fadeEls.forEach(el => fadeObserver.observe(el));
}
