/* ============================================================
   AJASCHOOL Corporate Homepage — script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ----------------------------------------------------------
     GNB: scroll background + active link
     ---------------------------------------------------------- */
  const gnb = document.querySelector('.gnb');
  const gnbLinks = document.querySelectorAll('.gnb__link');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    // Background toggle
    if (window.scrollY > 60) {
      gnb.classList.add('gnb--scrolled');
    } else {
      gnb.classList.remove('gnb--scrolled');
    }

    // Active section highlight
    let currentId = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        currentId = section.id;
      }
    });

    gnbLinks.forEach(link => {
      link.classList.remove('gnb__link--active');
      if (link.getAttribute('href') === '#' + currentId) {
        link.classList.add('gnb__link--active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----------------------------------------------------------
     GNB: smooth scroll on link click
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      // Close drawer if open
      closeDrawer();
    });
  });

  /* ----------------------------------------------------------
     GNB: mobile drawer
     ---------------------------------------------------------- */
  const hamburger = document.querySelector('.gnb__hamburger');
  const drawer = document.querySelector('.gnb__drawer');
  const overlay = document.querySelector('.gnb__overlay');
  const drawerClose = document.querySelector('.gnb__drawer-close');

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  /* ----------------------------------------------------------
     Scroll reveal (IntersectionObserver)
     ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: show everything
    revealEls.forEach(el => el.classList.add('revealed'));
  }

  /* ----------------------------------------------------------
     NEWS: scroll-driven category activation
     ---------------------------------------------------------- */
  const newsCategories = document.querySelectorAll('.news__category');

  if (newsCategories.length) {
    const newsObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          entry.target.classList.toggle('news__category--active', entry.isIntersecting);
        });
      },
      { threshold: 0.3, rootMargin: '0px 0px -10% 0px' }
    );

    newsCategories.forEach(cat => newsObserver.observe(cat));
  }

  /* ----------------------------------------------------------
     Animated counters
     ---------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-count]');

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    counters.forEach(el => counterObserver.observe(el));
  } else {
    counters.forEach(el => {
      el.textContent = Number(el.dataset.count).toLocaleString();
    });
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = Math.round(eased * target);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  /* ----------------------------------------------------------
     History tabs
     ---------------------------------------------------------- */
  const historyTabs = document.querySelectorAll('.history__tab');
  const historyEras = document.querySelectorAll('.history__era');

  historyTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const era = tab.dataset.era;

      historyTabs.forEach(t => t.classList.remove('history__tab--active'));
      tab.classList.add('history__tab--active');

      historyEras.forEach(e => {
        e.classList.remove('history__era--active');
        if (e.dataset.era === era) {
          e.classList.add('history__era--active');
        }
      });
    });
  });
});
