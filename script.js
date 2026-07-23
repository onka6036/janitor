const loader = document.querySelector('.loader');
const cursorGlow = document.querySelector('.cursor-glow');
const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const navPanel = document.querySelector('.nav-panel');
const themeToggle = document.getElementById('themeToggle');
const scrollTop = document.querySelector('.scroll-top');
const revealItems = document.querySelectorAll('.reveal');
const counterItems = document.querySelectorAll('.counter');
const testimonialCards = document.querySelectorAll('.testimonial-card');
const testimonialNav = document.querySelectorAll('.testimonial-nav');
const quoteForm = document.getElementById('quoteForm');
const formStatus = document.querySelector('.form-status');

if (loader) {
  window.addEventListener('load', () => {
    loader.classList.add('is-hidden');
    setTimeout(() => loader.remove(), 650);
  });
}

if (cursorGlow) {
  window.addEventListener('pointermove', (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  });
}

const updateHeader = () => {
  if (window.scrollY > 20) {
    header?.classList.add('scrolled');
  } else {
    header?.classList.remove('scrolled');
  }

  scrollTop?.classList.toggle('is-visible', window.scrollY > 600);
};

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

navToggle?.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  navPanel?.classList.toggle('is-open');
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    navPanel?.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('msk-theme', theme);
};

const savedTheme = localStorage.getItem('msk-theme');
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  applyTheme('dark');
} else {
  applyTheme('light');
}

themeToggle?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(current);
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealItems.forEach((item) => observer.observe(item));

const animateCounter = (counter) => {
  const target = Number(counter.dataset.target || 0);
  const suffix = counter.textContent.includes('%') ? '%' : '';
  const suffixText = counter.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(progress * target);
    counter.textContent = `${value}${suffixText}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      counter.textContent = `${target}${suffixText}`;
    }
  };

  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);

counterItems.forEach((item) => counterObserver.observe(item));

let activeIndex = 0;
const showTestimonial = (index) => {
  testimonialCards.forEach((card, i) => {
    card.classList.toggle('active', i === index);
  });
};

const rotateTestimonials = () => {
  activeIndex = (activeIndex + 1) % testimonialCards.length;
  showTestimonial(activeIndex);
};

testimonialNav.forEach((button) => {
  button.addEventListener('click', () => {
    const direction = button.dataset.direction === 'next' ? 1 : -1;
    activeIndex = (activeIndex + direction + testimonialCards.length) % testimonialCards.length;
    showTestimonial(activeIndex);
  });
});

setInterval(rotateTestimonials, 6000);
showTestimonial(activeIndex);

scrollTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

quoteForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(quoteForm);
  const name = data.get('name')?.toString().trim() || '';
  const email = data.get('email')?.toString().trim() || '';
  const message = data.get('message')?.toString().trim() || '';

  if (!name || !email || !message) {
    formStatus.textContent = 'Please complete your name, email, and message so we can prepare your quote.';
    return;
  }

  if (!email.includes('@')) {
    formStatus.textContent = 'Please enter a valid email address.';
    return;
  }

  formStatus.textContent = 'Thank you! We will reach out shortly with a customized quote.';
  quoteForm.reset();
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 760) {
    navPanel?.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }
});
