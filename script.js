const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('#nav-links');
const contactForm = document.querySelector('.contact-form');

navToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const submitButton = contactForm.querySelector('button[type="submit"]');
  submitButton.textContent = 'Inquiry received';
  submitButton.disabled = true;
});
