(function () {
  const overlay = document.getElementById('page-transition');
  if (!overlay) return;

  function navigateWith(href) {
    try { sessionStorage.setItem('univend:page-transition', '1'); } catch (e) {}
    overlay.classList.add('is-covering');
    setTimeout(function () { window.location.href = href; }, 750);
  }

  document.querySelectorAll('a[href]').forEach(function (a) {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (a.target && a.target !== '' && a.target !== '_self') return;
    try {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
    } catch (e) { return; }

    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      navigateWith(href);
    });
  });

  let revealed = false;
  try {
    if (sessionStorage.getItem('univend:page-transition')) {
      sessionStorage.removeItem('univend:page-transition');
      overlay.classList.add('no-anim', 'is-covering');
      requestAnimationFrame(function () {
        overlay.offsetHeight;
        overlay.classList.remove('no-anim');
        requestAnimationFrame(function () {
          overlay.classList.remove('is-covering');
          overlay.classList.add('is-revealing');
          revealed = true;
          setTimeout(function () {
            overlay.classList.remove('is-revealing');
          }, 1100);
        });
      });
    }
  } catch (e) {}

  window.addEventListener('pageshow', function (e) {
    if (e.persisted && !revealed) {
      overlay.classList.remove('is-covering', 'is-revealing');
    }
  });
})();

(function () {
  let grid = document.getElementById('grid-32-underlay');

  if (!grid) {
    grid = document.createElement('div');
    grid.id = 'grid-32-underlay';
    document.body.insertBefore(grid, document.body.firstChild);
  }

  function updateGridHeight() {
    const allRecords = document.getElementById('allrecords');
    const contentBottom = allRecords
      ? allRecords.getBoundingClientRect().bottom + window.pageYOffset
      : document.documentElement.clientHeight;

    const fullHeight = Math.max(contentBottom, window.innerHeight);
    const nextHeight = Math.ceil(fullHeight) + 'px';

    if (grid.style.height !== nextHeight) {
      grid.style.height = nextHeight;
    }
  }

  function updateGrid() {
    document.body.style.setProperty('padding-top', '0', 'important');
    document.body.style.setProperty('overflow-x', 'hidden', 'important');
    grid.style.setProperty('display', 'block', 'important');
    updateGridHeight();
  }

  window.addEventListener('load', updateGrid);
  window.addEventListener('resize', updateGrid);

  setTimeout(updateGrid, 200);
  setTimeout(updateGrid, 800);
  setTimeout(updateGrid, 1500);
  setTimeout(updateGrid, 3000);

  const observer = new MutationObserver(function (mutations) {
    const shouldUpdate = mutations.some(function (mutation) {
      return mutation.target !== grid;
    });
    if (shouldUpdate) {
      updateGrid();
    }
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class', 'style'],
    childList: true,
    subtree: true
  });
})();

(function () {
  const burger = document.getElementById('page-burger');
  const nav = document.getElementById('page-nav');
  if (!burger || !nav) return;
  function setOpen(open) {
    document.body.classList.toggle('is-nav-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  burger.addEventListener('click', function () {
    setOpen(!document.body.classList.contains('is-nav-open'));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('li[data-target], a[href]')) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
})();

(function () {
  const items = Array.from(document.querySelectorAll('.visual-section__subnav li[data-target]'));
  if (!items.length) return;
  const targets = items.map(function (li) {
    return { li: li, el: document.getElementById(li.dataset.target) };
  }).filter(function (t) { return t.el; });

  function setActive(id) {
    items.forEach(function (li) {
      li.classList.toggle('is-current', li.dataset.target === id);
    });
  }

  items.forEach(function (li) {
    li.addEventListener('click', function () {
      const t = document.getElementById(li.dataset.target);
      if (!t) return;
      const top = t.getBoundingClientRect().top + window.pageYOffset - 40;
      window.scrollTo({ top: top, behavior: 'smooth' });
      setActive(li.dataset.target);
    });
  });

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      const probe = window.innerHeight * 0.35;
      let active = targets[0];
      for (const t of targets) {
        const top = t.el.getBoundingClientRect().top;
        if (top - probe <= 0) active = t;
      }
      setActive(active.li.dataset.target);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

(function () {
  const targets = document.querySelectorAll('.visual-section__work .snap');
  if (!targets.length || !('IntersectionObserver' in window)) return;
  targets.forEach(function (el) { el.classList.add('reveal'); });

  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        e.target.classList.remove('is-passed');
      } else {
        e.target.classList.remove('is-visible');
        if (e.boundingClientRect.top < 0) {
          e.target.classList.add('is-passed');
        } else {
          e.target.classList.remove('is-passed');
        }
      }
    });
  }, { threshold: 0, rootMargin: '-8% 0px -12% 0px' });

  targets.forEach(function (el) { obs.observe(el); });
})();
