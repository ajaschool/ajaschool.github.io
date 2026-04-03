/* ============================================================
   AJASCHOOL Corporate Homepage — script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ----------------------------------------------------------
     GNB: scroll background + active link + scroll progress + back-to-top
     ---------------------------------------------------------- */
  const gnb = document.querySelector('.gnb');
  const gnbLinks = document.querySelectorAll('.gnb__link');
  const sections = document.querySelectorAll('section[id]');
  const newsCategories = document.querySelectorAll('.news__category');
  const scrollProgress = document.querySelector('.scroll-progress');
  const backToTop = document.querySelector('.back-to-top');

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

    updateNewsCategoryState();

    // Scroll progress bar
    if (scrollProgress) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      scrollProgress.style.width = scrollPercent + '%';
    }

    // Back to top button
    if (backToTop) {
      if (window.scrollY > 600) {
        backToTop.classList.add('back-to-top--visible');
      } else {
        backToTop.classList.remove('back-to-top--visible');
      }
    }
  }

  function updateNewsCategoryState() {
    if (!newsCategories.length) return;

    const viewportAnchor = window.innerHeight * 0.42;
    let activeCategory = null;
    let closestCategory = null;
    let closestDistance = Infinity;

    newsCategories.forEach(category => {
      const rect = category.getBoundingClientRect();
      const containsAnchor = rect.top <= viewportAnchor && rect.bottom >= viewportAnchor;
      const distanceToCenter = Math.abs(rect.top + rect.height / 2 - viewportAnchor);

      if (distanceToCenter < closestDistance) {
        closestDistance = distanceToCenter;
        closestCategory = category;
      }

      if (containsAnchor) {
        activeCategory = category;
      }
    });

    const targetCategory = activeCategory || closestCategory;

    newsCategories.forEach(category => {
      category.classList.toggle('news__category--active', category === targetCategory);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateNewsCategoryState);
  onScroll();

  // Back to top click
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

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
     Scroll reveal (IntersectionObserver) with staggered delay
     ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay;
            if (delay) entry.target.style.transitionDelay = delay + 's';
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
     Animated counters with pulse on completion
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
      } else {
        el.classList.add('counter-done');
      }
    }

    requestAnimationFrame(tick);
  }

  /* ----------------------------------------------------------
     History tabs with fade transition
     ---------------------------------------------------------- */
  const historyTabs = document.querySelectorAll('.history__tab');
  let historyTransitioning = false;

  historyTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (historyTransitioning) return;
      const era = tab.dataset.era;
      const currentActive = document.querySelector('.history__era--active');
      const nextEra = document.querySelector(`.history__era[data-era="${era}"]`);
      if (currentActive === nextEra) return;

      historyTransitioning = true;

      // Update tab styling immediately
      historyTabs.forEach(t => t.classList.remove('history__tab--active'));
      tab.classList.add('history__tab--active');

      // Fade out current
      if (currentActive) {
        currentActive.style.opacity = '0';
        currentActive.style.transform = 'translateY(12px)';
      }

      setTimeout(() => {
        // Hide old, show new
        if (currentActive) {
          currentActive.classList.remove('history__era--active');
          currentActive.style.opacity = '';
          currentActive.style.transform = '';
        }
        nextEra.classList.add('history__era--active');
        nextEra.style.opacity = '0';
        nextEra.style.transform = 'translateY(12px)';

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            nextEra.style.opacity = '1';
            nextEra.style.transform = 'translateY(0)';
            setTimeout(() => {
              historyTransitioning = false;
            }, 400);
          });
        });
      }, 300);
    });
  });
});
