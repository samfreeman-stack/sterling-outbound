// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Contact form submission (Netlify Forms via fetch, with graceful fallback)
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const encoded = new URLSearchParams(formData).toString();

    status.textContent = 'Sending...';

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encoded,
    })
      .then(() => {
        status.textContent = "Thank you — we've received your message and will be in touch shortly.";
        form.reset();
      })
      .catch(() => {
        status.textContent = 'Something went wrong. Please email us directly at hello@sterlingoutbound.co.uk.';
      });
  });
}
