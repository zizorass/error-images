(() => {
  'use strict';

  // ---------- Footer year ----------
  document.getElementById('year').textContent = new Date().getFullYear();

  // ---------- Theme toggle ----------
  const THEME_KEY = 'portfolio-theme';
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');

  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  };

  const storedTheme = localStorage.getItem(THEME_KEY);
  if (storedTheme) {
    applyTheme(storedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  // ---------- Mobile nav ----------
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.querySelector('.main-nav');

  const closeNav = () => {
    mainNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  mainNav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') closeNav();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
      closeNav();
      navToggle.focus();
    }
  });

  // ---------- Scroll reveal ----------
  const revealEls = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 3, 2) * 60}ms`;
      observer.observe(el);
    });
  }

  // ---------- Contact form validation ----------
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');

  const validators = {
    name: (value) => (value.trim().length > 0 ? '' : 'Please enter your name.'),
    email: (value) => {
      if (!value.trim()) return 'Please enter your email.';
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailPattern.test(value) ? '' : 'Please enter a valid email address.';
    },
    message: (value) => (value.trim().length > 0 ? '' : 'Please enter a message.'),
  };

  const showFieldError = (field, message) => {
    const errorEl = document.getElementById(`${field.id}-error`);
    if (message) {
      field.setAttribute('aria-invalid', 'true');
      errorEl.textContent = message;
    } else {
      field.removeAttribute('aria-invalid');
      errorEl.textContent = '';
    }
  };

  Object.keys(validators).forEach((name) => {
    const field = form.elements[name];
    field.addEventListener('blur', () => {
      showFieldError(field, validators[name](field.value));
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let firstInvalid = null;
    Object.keys(validators).forEach((name) => {
      const field = form.elements[name];
      const message = validators[name](field.value);
      showFieldError(field, message);
      if (message && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      statusEl.textContent = 'Please fix the errors above.';
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const label = submitBtn.querySelector('.btn-label');
    submitBtn.disabled = true;
    label.textContent = 'Sending…';
    statusEl.textContent = '';

    setTimeout(() => {
      submitBtn.disabled = false;
      label.textContent = 'Send message';
      statusEl.textContent = `Thanks, ${form.elements.name.value.trim()}! Your message has been sent.`;
      form.reset();
    }, 900);
  });
})();
