/* =========================================================
   Elixa Renewables — UI interactions
   Header state, mobile nav, scroll reveals, count-up stats,
   card tilt, and the enquiry form.
   ========================================================= */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Sticky header state ---- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobile nav ---- */
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const closeNav = () => {
    links.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });

  /* ---- Reveal on scroll ---- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---- Count-up stats ---- */
  const nums = document.querySelectorAll('.num');
  const runCount = (el) => {
    const target = parseFloat(el.dataset.target) || 0;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const dur = 1500;
    const start = performance.now();
    const fmt = (v) => prefix + Math.round(v).toLocaleString('en-GB') + suffix;
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && !prefersReduced) {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { runCount(en.target); io2.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach((el) => io2.observe(el));
  } else {
    nums.forEach((el) => {
      el.textContent = (el.dataset.prefix || '') + (parseFloat(el.dataset.target) || 0).toLocaleString('en-GB') + (el.dataset.suffix || '');
    });
  }

  /* ---- Card tilt (pointer, fine devices only) ---- */
  if (!prefersReduced && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.tilt').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ---- Footer year ---- */
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Enquiry form ---- */
  const form = document.getElementById('quoteForm');
  const note = document.getElementById('formNote');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!name || !emailOk) {
        note.textContent = 'Please add your name and a valid email so we can reply.';
        note.className = 'form-note err';
        return;
      }

      // No backend: hand off to the visitor's email client, pre-filled.
      const subject = encodeURIComponent(`Enquiry: ${form.service.value}`);
      const body = encodeURIComponent(
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Phone: ${form.phone.value.trim() || '—'}\n` +
        `Interested in: ${form.service.value}\n\n` +
        `${form.message.value.trim()}`
      );
      window.location.href = `mailto:info@elixarenewables.co.uk?subject=${subject}&body=${body}`;

      note.textContent = 'Thanks! Your email app should open with the details ready to send.';
      note.className = 'form-note ok';
      form.reset();
    });
  }
})();
