async function loadComponents() {
    const components = [
        ['#about-component', 'components/about.html'],
        ['#skills-component', 'components/skills.html'],
        ['#projects-component', 'components/projects.html'],
        ['#contact-component', 'components/contact.html']
    ];

    await Promise.all(
        components.map(async ([selector, file]) => {
            const response = await fetch(file);
            if (!response.ok) {
                throw new Error(`Could not load ${file}: ${response.status}`);
            }

            document.querySelector(selector).innerHTML = await response.text();
        })
    );

    initializePage();
}

document.addEventListener('DOMContentLoaded', () => {
    loadComponents().catch((error) => {
        console.error('Failed to load page components:', error);
    });
});

function initializePage() {
/* =========================================================
   THEME TOGGLE (persists in-memory only — no localStorage
   available in this sandbox; swap to localStorage in prod)
   ========================================================= */
const themeToggle = document.querySelector('.theme-toggle');
const root = document.documentElement;

themeToggle.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    root.setAttribute('data-theme', isLight ? 'dark' : 'light');
    themeToggle.setAttribute('aria-pressed', String(!isLight));
    themeToggle.textContent = isLight ? '🌙' : '☀️';
});

/* =========================================================
   MOBILE NAV TOGGLE
   ========================================================= */
const navToggle = document.querySelector('.nav__toggle');
const navLinks = document.querySelector('.nav__links');

navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.classList.toggle('is-active', isOpen);
    document.body.classList.toggle('nav-open', isOpen);
});

// close mobile menu when a link is clicked
navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.classList.remove('is-active');
        document.body.classList.remove('nav-open');
    });
});

/* =========================================================
   SCROLLSPY — highlight active nav link
   ========================================================= */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav__links a');

const scrollSpyObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            const id = entry.target.getAttribute('id');
            const anchor = document.querySelector(`.nav__links a[href="#${id}"]`);
            if (!anchor) return;
            if (entry.isIntersecting) {
                navAnchors.forEach((a) => a.classList.remove('is-active'));
                anchor.classList.add('is-active');
            }
        });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
);

sections.forEach((section) => scrollSpyObserver.observe(section));

/* =========================================================
   REVEAL ON SCROLL
   ========================================================= */
const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
).matches;

const revealTargets = document.querySelectorAll(
    '.skill-card, .project-card, .about__facts li, .section__title, .section__subtitle'
);

revealTargets.forEach((el) => el.classList.add('reveal'));

if (prefersReducedMotion) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
} else {
    const revealObserver = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );
    revealTargets.forEach((el) => revealObserver.observe(el));
}

/* =========================================================
   BACK TO TOP
   ========================================================= */
const backToTop = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
    backToTop.classList.toggle('is-visible', window.scrollY > 600);
});

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
});

/* =========================================================
   CONTACT FORM
   No backend is wired up. This validates client-side and
   opens the user's mail client with the message pre-filled.
   Swap the TODO block for a fetch() call to Formspree,
   Netlify Forms, or your own endpoint when one exists.
   ========================================================= */
const form = document.querySelector('.contact__form');
const formStatus = document.querySelector('.form__status');

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !subject || !message) {
        showStatus('Fill in every field before sending.', 'error');
        return;
    }
    if (!emailPattern.test(email)) {
        showStatus('Enter a valid email address.', 'error');
        return;
    }

    // TODO: replace with a real submission endpoint, e.g.:
    // await fetch('https://formspree.io/f/XXXXX', { method: 'POST', body: new FormData(form) })
    const mailto = `mailto:gus.ssilva05@gmail.com?subject=${encodeURIComponent(
        subject
    )}&body=${encodeURIComponent(`${message}\n\n— ${name} (${email})`)}`;
    window.location.href = mailto;

    showStatus('Opening your email client…', 'success');
    form.reset();
});

function showStatus(text, type) {
    formStatus.textContent = text;
    formStatus.className = `form__status form__status--${type}`;
}
}