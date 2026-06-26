/* Iron Horse Rentals — script.js */

/* ── SCROLL PROGRESS BAR ── */
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.prepend(progressBar);
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
  progressBar.style.width = (pct * 100).toFixed(2) + '%';
}, { passive: true });

/* ── PAGE LOADER ── */
(function initLoader() {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;
  const dismiss = () => loader.classList.add('done');
  // Only animate on first page of the session; skip instantly on subsequent pages
  if (sessionStorage.getItem('ihrLoaded')) {
    loader.classList.add('done');
    return;
  }
  sessionStorage.setItem('ihrLoaded', '1');
  window.addEventListener('load', () => setTimeout(dismiss, 1000));
  setTimeout(dismiss, 3000); // hard fallback
})();

/* ── CUSTOM CURSOR ── */
(function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const ring = document.createElement('div');
  const dot  = document.createElement('div');
  ring.className = 'c-ring';
  dot.className  = 'c-dot';
  document.body.append(ring, dot);

  let mx = -100, my = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function raf() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(raf);
  })();

  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, .fc, .faq-q, .nav-toggle')) {
      ring.classList.add('on-link');
    } else {
      ring.classList.remove('on-link');
    }
  });
})();

/* ── NAV SCROLL STYLE ── */
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── MOBILE MENU ── */
const toggle   = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
toggle?.addEventListener('click', () => {
  toggle.classList.toggle('open');
  navLinks.classList.toggle('open');
});
document.addEventListener('click', e => {
  if (!e.target.closest('.site-header')) {
    toggle?.classList.remove('open');
    navLinks?.classList.remove('open');
  }
});

/* ── DROPDOWN (mobile tap) ── */
document.querySelectorAll('.has-dd > a').forEach(a => {
  a.addEventListener('click', e => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      a.closest('.has-dd').classList.toggle('open');
    }
  });
});

/* ── ACTIVE NAV ── */
const page = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  const href = a.getAttribute('href')?.split('#')[0];
  if (href === page || (page === '' && href === 'index.html')) {
    a.closest('li')?.classList.add('active');
  }
});

/* ── SPLIT TEXT REVEAL (IntersectionObserver) ── */
(function initSplitReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('txt-revealed');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.hero-title, .h2, .page-hero h1').forEach(el => obs.observe(el));
})();

/* ── HERO ABOVE-FOLD REVEAL ── */
(function heroReveal() {
  const loaderPresent = !!document.getElementById('pageLoader');
  const delay = loaderPresent ? 1080 : 80;
  setTimeout(() => {
    const hero = document.querySelector('.hero-title');
    if (hero) hero.classList.add('txt-revealed');
    document.querySelectorAll('.hero-eyebrow, .hero-desc, .hero-btns, .hero-stats')
      .forEach(el => { el.classList.add('fade-up', 'is-in'); });
  }, delay);
})();

/* ── FADE-UP + CARD STAGGER REVEAL ── */
(function initFadeReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('is-in');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.07 });

  /* Cards with stagger within their parent */
  const staggerSel = '.feat-card, .step-item, .val-card, .req-card, .c-card, .td, .fc';
  document.querySelectorAll(staggerSel).forEach((el, _i) => {
    const siblings = Array.from(el.parentElement?.querySelectorAll(':scope > ' + el.tagName + ',' + ':scope > .feat-card, :scope > .step-item, :scope > .val-card, :scope > .req-card, :scope > .c-card, :scope > .td') || []);
    const idx = siblings.indexOf(el);
    if (idx > 0 && idx <= 4) el.style.transitionDelay = (idx * 0.1) + 's';
    obs.observe(el);
  });

  /* Generic fade-up for labels, subs, rules, and section paragraphs */
  document.querySelectorAll(
    'section .label, section .sub, section .rule, section > .container > p, .about-p, .about-lead'
  ).forEach(el => {
    el.classList.add('fade-up');
    obs.observe(el);
  });
})();

/* ── HERO PARALLAX ── */
(function initParallax() {
  const img = document.querySelector('.hero-bg img');
  if (!img) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.addEventListener('scroll', () => {
    img.style.transform = `translateY(${window.scrollY * 0.28}px) scale(1.08)`;
  }, { passive: true });
})();

/* ── ANIMATED STAT COUNTERS ── */
(function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const raw = el.dataset.count;
      if (!raw) return;
      const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
      const prefix = raw.match(/^[^0-9]*/)?.[0] || '';
      const suffix = raw.match(/[^0-9.]*$/)?.[0] || '';
      let start = null;
      const dur = 1500;
      function tick(ts) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + (Number.isInteger(num) ? Math.floor(num * eased) : (num * eased).toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = raw;
      }
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));
})();

/* ── FAQ ACCORDION ── */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const ans  = item.querySelector('.faq-a');
    const open = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-a').style.maxHeight = null;
    });
    if (!open) {
      item.classList.add('open');
      ans.style.maxHeight = ans.scrollHeight + 'px';
    }
  });
});

/* ── FORM HANDLER ── */
function handleForm(formId, successId, btnLabel) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(f => {
      if (!f.value.trim()) { f.style.borderColor = '#b03020'; valid = false; }
      else f.style.borderColor = '';
    });
    if (!valid) return;
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true; btn.textContent = 'Sending…';
    setTimeout(() => {
      btn.disabled = false; btn.textContent = btnLabel;
      form.reset();
      const s = document.getElementById(successId);
      if (s) {
        s.style.display = 'block';
        s.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => s.style.display = 'none', 7000);
      }
    }, 1100);
  });
}
handleForm('reservationForm', 'resSuccess', 'Request Reservation');
handleForm('contactForm', 'contactSuccess', 'Send Message');

/* ── PRE-SELECT TRAILER FROM HASH ── */
const sel = document.getElementById('trailerSelect');
if (sel) {
  const h = location.hash.replace('#', '');
  const map = { dump: 'dump', 'car-hauler': 'car-hauler', utility: 'utility' };
  if (map[h]) sel.value = map[h];
}

/* ── DATE MINIMUMS ── */
const today = new Date().toISOString().split('T')[0];
document.querySelectorAll('input[type=date]').forEach(d => d.min = today);
