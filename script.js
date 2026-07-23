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

const chatToggle = document.querySelector('.chat-toggle');
const chatWidget = document.getElementById('chatWidget');
const chatClose = document.querySelector('.chat-close');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const clearChatBtn = document.getElementById('clearChatBtn');
const quickActionButtons = document.querySelectorAll('.chat-chip');
const chatStorageKey = 'msk-chat-history';
const companyEmail = 'mskjanitorialservices@outlook.com';
const companyPhone = '(475) 275-5166';

const formatTime = (date = new Date()) => new Intl.DateTimeFormat([], {
  hour: 'numeric',
  minute: '2-digit'
}).format(date);

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const createDefaultMessages = () => [{
  role: 'bot',
  text: 'Hello 👋 Welcome to MSK Janitorial Services LLC. How can we help you today?',
  time: formatTime()
}];

const loadChatHistory = () => {
  try {
    const saved = localStorage.getItem(chatStorageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Unable to read chat history', error);
  }

  return createDefaultMessages();
};

const saveChatHistory = (messages) => {
  localStorage.setItem(chatStorageKey, JSON.stringify(messages));
};

let chatMessagesState = loadChatHistory();

const renderChat = () => {
  if (!chatMessages) return;

  chatMessages.innerHTML = '';
  chatMessagesState.forEach((item) => {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${item.role}`;
    bubble.innerHTML = `
      <div class="chat-bubble-text">${escapeHtml(item.text)}</div>
      <span class="chat-time">${item.time}</span>
    `;
    chatMessages.appendChild(bubble);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
};

const showTypingIndicator = () => {
  if (!chatMessages) return;

  const typingBubble = document.createElement('div');
  typingBubble.className = 'chat-bubble bot typing';
  typingBubble.innerHTML = `
    <div class="typing-dots"><span></span><span></span><span></span></div>
    <span class="chat-time">typing</span>
  `;
  chatMessages.appendChild(typingBubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

const removeTypingIndicator = () => {
  const typingBubble = chatMessages?.querySelector('.chat-bubble.typing');
  typingBubble?.remove();
};

const getBotReply = (text) => {
  const value = text.toLowerCase();

  if (/(commercial|office|business|corporate|retail)/.test(value)) {
    return 'We provide professional commercial cleaning for offices, retail spaces, medical facilities, and more. We can tailor a plan to your schedule and property size.';
  }

  if (/(residential|home|apartment|house)/.test(value)) {
    return 'Our residential cleaning service includes kitchens, bathrooms, living spaces, and other high-use areas with flexible scheduling and dependable attention to detail.';
  }

  if (/(deep|move|move-in|move-out)/.test(value)) {
    return 'We offer move-in and move-out cleaning as well as deep cleaning for seasonal resets, post-event cleanup, and special projects.';
  }

  if (/(floor|window|janitorial|contract)/.test(value)) {
    return 'We offer floor care, window cleaning, and customized janitorial contracts for commercial and residential properties.';
  }

  if (/(quote|estimate|pricing|cost|price)/.test(value)) {
    return 'We would be happy to provide a customized quote. Please share your property type, size, and preferred service frequency and we will follow up promptly.';
  }

  if (/(hours|business hours|open|closing|time)/.test(value)) {
    return 'Our business hours are Monday–Friday from 8:00 AM to 6:00 PM, with Saturday by appointment and emergency service available on Sundays.';
  }

  if (/(contact|phone|email|address|location)/.test(value)) {
    return 'You can reach us at (475) 275-5166 or mskjanitorialservices@outlook.com. We are located at 246 Goose Lane, Guilford, CT 06437.';
  }

  if (/(service area|connecticut|town|area)/.test(value)) {
    return 'We proudly serve residential and commercial clients throughout Connecticut, including Guilford and nearby communities.';
  }

  if (/(book|schedule|appointment)/.test(value)) {
    return 'We can help schedule your cleaning service. Please tell us your preferred date, service type, and property size.';
  }

  if (/(thank|thanks|hello|hi)/.test(value)) {
    return 'You’re welcome! We’re here to help with cleaning plans, quotes, service options, and business hours.';
  }

  return 'Thanks for reaching out. We can help with commercial cleaning, residential cleaning, deep cleaning, floor care, window cleaning, janitorial contracts, quotes, and business hours.';
};

const addChatMessage = (text, role = 'user') => {
  chatMessagesState.push({
    role,
    text,
    time: formatTime()
  });

  saveChatHistory(chatMessagesState);
  renderChat();
};

const launchContactEmail = (message) => {
  const subject = encodeURIComponent(`Website inquiry from ${window.location.hostname}`);
  const body = encodeURIComponent(`Hello MSK Janitorial Services,\n\nI reached out through your website chat.\n\nMessage:\n${message}\n\nPlease contact me at your earliest convenience.\n`);
  window.location.href = `mailto:${companyEmail}?subject=${subject}&body=${body}`;
};

const handleChatSubmit = (text) => {
  const trimmed = text.trim();
  if (!trimmed) return;

  addChatMessage(trimmed, 'user');
  chatInput.value = '';
  showTypingIndicator();

  window.setTimeout(() => {
    removeTypingIndicator();
    const reply = getBotReply(trimmed);
    addChatMessage(reply, 'bot');

    if (/quote|book|schedule|contact|service|hours|phone|email|help/i.test(trimmed)) {
      launchContactEmail(trimmed);
    }
  }, 750);
};

const openChat = () => {
  chatWidget?.classList.add('is-open');
  chatToggle?.setAttribute('aria-expanded', 'true');
  chatInput?.focus();
};

const closeChat = () => {
  chatWidget?.classList.remove('is-open');
  chatToggle?.setAttribute('aria-expanded', 'false');
};

chatToggle?.addEventListener('click', () => {
  const isOpen = chatWidget?.classList.contains('is-open');
  if (isOpen) {
    closeChat();
  } else {
    openChat();
  }
});

chatClose?.addEventListener('click', closeChat);

chatForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  handleChatSubmit(chatInput.value);
});

quickActionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    handleChatSubmit(button.dataset.message || button.textContent);
  });
});

clearChatBtn?.addEventListener('click', () => {
  chatMessagesState = createDefaultMessages();
  saveChatHistory(chatMessagesState);
  renderChat();
  openChat();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && chatWidget?.classList.contains('is-open')) {
    closeChat();
  }
});

renderChat();
