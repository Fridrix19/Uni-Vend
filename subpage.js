(function () {
  const overlay = document.getElementById('page-transition');
  if (!overlay) return;

  function navigateWith(href, mode) {
    const isLogo = mode === 'logo';
    try { sessionStorage.setItem('univend:page-transition', isLogo ? 'logo' : 'default'); } catch (e) {}
    overlay.classList.remove('is-covering', 'is-revealing', 'is-logo-covering', 'is-logo-revealing');
    overlay.classList.add(isLogo ? 'is-logo-covering' : 'is-covering');
    setTimeout(function () { window.location.href = href; }, isLogo ? 900 : 750);
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
      navigateWith(href, a.classList.contains('hero__nav-dot--home') ? 'logo' : 'default');
    });
  });

  let revealed = false;
  try {
    const transitionMode = sessionStorage.getItem('univend:page-transition');
    if (transitionMode) {
      sessionStorage.removeItem('univend:page-transition');
      const isLogo = transitionMode === 'logo';
      const coverClass = isLogo ? 'is-logo-covering' : 'is-covering';
      const revealClass = isLogo ? 'is-logo-revealing' : 'is-revealing';
      overlay.classList.add('no-anim', coverClass);
      requestAnimationFrame(function () {
        overlay.offsetHeight;
        overlay.classList.remove('no-anim');
        requestAnimationFrame(function () {
          overlay.classList.remove(coverClass);
          overlay.classList.add(revealClass);
          revealed = true;
          setTimeout(function () {
            overlay.classList.remove(revealClass);
          }, isLogo ? 1000 : 1100);
        });
      });
    }
  } catch (e) {}

  window.addEventListener('pageshow', function (e) {
    if (e.persisted && !revealed) {
      overlay.classList.remove('is-covering', 'is-revealing', 'is-logo-covering', 'is-logo-revealing');
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

    if (window.matchMedia('(max-width: 833px)').matches) {
      grid.style.setProperty('display', 'none', 'important');
      return;
    }

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
  const nav = document.getElementById('page-nav');
  if (!nav) return;

  const dots = nav.querySelector('.visual-section__dots');
  const subnav = nav.querySelector('.visual-section__subnav');
  const activeDot = dots ? dots.querySelector('.hero__nav-dot.is-active') : null;
  const activeItem = activeDot ? activeDot.closest('li') : null;
  if (!dots || !subnav || !activeItem) return;

  const originalParent = subnav.parentNode;
  const originalNext = subnav.nextSibling;
  const mobileQuery = window.matchMedia('(max-width: 833px)');

  function syncMobileSubnav() {
    if (mobileQuery.matches) {
      if (subnav.parentNode !== activeItem) activeItem.appendChild(subnav);
    } else if (subnav.parentNode !== originalParent) {
      originalParent.insertBefore(subnav, originalNext);
    }
  }

  syncMobileSubnav();
  if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', syncMobileSubnav);
  else mobileQuery.addListener(syncMobileSubnav);
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

(function () {
  const tabs = Array.from(document.querySelectorAll('[data-video-use-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-video-use-panel]'));
  if (!tabs.length || !panels.length) return;

  function syncVideo(panel, active) {
    panel.querySelectorAll('video').forEach(function (video) {
      if (active) {
        video.play().catch(function () {});
      } else {
        video.pause();
      }
    });
  }

  function setActive(name) {
    tabs.forEach(function (tab) {
      const active = tab.dataset.videoUseTab === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    panels.forEach(function (panel) {
      const active = panel.dataset.videoUsePanel === name;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
      syncVideo(panel, active);
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      setActive(tab.dataset.videoUseTab);
    });
  });

  const initial = tabs.find(function (tab) { return tab.classList.contains('is-active'); }) || tabs[0];
  setActive(initial.dataset.videoUseTab);
})();

(function () {
  const root =
    document.querySelector('section.video-structure[data-structure-tab]') ||
    document.querySelector('section.video-structure');
  const tabs = Array.from(document.querySelectorAll('[data-video-structure-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-video-structure-panel]'));
  const previewVideos = Array.from(document.querySelectorAll('.video-structure__preview-video'));
  if (!tabs.length || !panels.length || !previewVideos.length || !root) return;

  var flowStep = 0;
  var progressRoot = document.getElementById('video-structure-progress');
  var progressLabel = progressRoot && progressRoot.querySelector('.video-structure__progress-label');
  var progressBar = progressRoot && progressRoot.querySelector('.video-structure__progress-bar');

  var hintEl = document.getElementById('video-structure-preview-hint');
  var hintTextEl = hintEl && hintEl.querySelector('.video-structure__preview-hint-text');

  function updateStructureProgress() {
    if (!progressRoot || !progressLabel || !progressBar) return;
    if (flowStep >= 3) {
      progressLabel.textContent = 'Видео готово';
      progressBar.style.setProperty('--progress', '100%');
      progressRoot.classList.add('video-structure__progress--complete');
      return;
    }
    progressRoot.classList.remove('video-structure__progress--complete');
    progressLabel.textContent = 'Прогресс готовности видео';
    var pct = flowStep === 0 ? '5%' : flowStep === 1 ? '33%' : '66%';
    progressBar.style.setProperty('--progress', pct);
  }

  function canAccessTab(name) {
    if (name === 'plaque') return true;
    if (name === 'logo') return flowStep >= 1;
    if (name === 'subtitles') return flowStep >= 2;
    return true;
  }

  function toastIfTabBlocked(name) {
    if (name === 'logo' && flowStep < 1) return 'Вы не добавили плашку';
    if (name === 'subtitles' && flowStep < 1) return 'Вы не добавили плашку';
    if (name === 'subtitles' && flowStep < 2) return 'Вы не добавили логотип';
    return null;
  }

  function syncStructureTabs() {
    tabs.forEach(function (tab) {
      var id = tab.dataset.videoStructureTab;
      var locked = !canAccessTab(id);
      tab.classList.toggle('is-locked', locked);
      tab.setAttribute('aria-disabled', locked ? 'true' : 'false');
    });
  }

  function updatePreviewHint() {
    if (!hintEl || !hintTextEl) return;
    var name = root.getAttribute('data-structure-tab') || 'plaque';
    var msg = '';
    if (name === 'plaque' && flowStep < 1) msg = 'Вы не добавили плашку';
    else if (name === 'logo' && flowStep < 2) msg = 'Вы не добавили логотип';
    else if (name === 'subtitles' && flowStep < 3) msg = 'Вы не добавили субтитры';

    if (msg) {
      hintTextEl.textContent = msg;
      hintEl.hidden = false;
    } else {
      hintEl.hidden = true;
      hintTextEl.textContent = '';
    }
  }

  previewVideos.forEach(function (v) {
    v.muted = true;
    var initial = v.play();
    if (initial && typeof initial.catch === 'function') initial.catch(function () {});
  });

  function setActive(name) {
    root.setAttribute('data-structure-tab', name);

    tabs.forEach(function (tab) {
      const on = tab.dataset.videoStructureTab === name;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    panels.forEach(function (panel) {
      const on = panel.dataset.videoStructurePanel === name;
      panel.hidden = !on;
      panel.classList.toggle('is-active', on);
    });

    var syncTime = 0;
    previewVideos.forEach(function (video) {
      if (!video.classList.contains('is-hidden') && isFinite(video.currentTime)) {
        syncTime = video.currentTime;
      }
    });
    if (!syncTime && previewVideos[0] && isFinite(previewVideos[0].currentTime)) {
      syncTime = previewVideos[0].currentTime;
    }

    previewVideos.forEach(function (video) {
      const on = video.dataset.videoStructureClip === name;
      video.classList.toggle('is-hidden', !on);
    });

    previewVideos.forEach(function (video) {
      if (isFinite(syncTime)) {
        try {
          video.currentTime = syncTime;
        } catch (e) {}
      }
      var p = video.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    });
    updateStructureProgress();
    syncStructureTabs();
    updatePreviewHint();
  }

  const nextAfterAction = { plaque: 'logo', logo: 'subtitles' };
  const toastAfterAction = {
    plaque: 'Вы добавили плашку',
    logo: 'Вы добавили логотип',
    subtitles: 'Вы добавили субтитры',
  };
  const subtitlesSrcDefault = 'video-content/swap/notitle.mp4';
  const subtitlesSrcDone = 'video-content/swap/done.mp4';
  const subtitlesLabelAdd = 'Добавить субтитры на видео';
  const subtitlesLabelRetry = 'Попробовать еще раз';

  var subsPreviewVideo = null;
  previewVideos.forEach(function (v) {
    if (v.dataset.videoStructureClip === 'subtitles') subsPreviewVideo = v;
  });

  function readSyncTime() {
    var t = 0;
    previewVideos.forEach(function (video) {
      if (!video.classList.contains('is-hidden') && isFinite(video.currentTime)) {
        t = video.currentTime;
      }
    });
    if (!t && previewVideos[0] && isFinite(previewVideos[0].currentTime)) {
      t = previewVideos[0].currentTime;
    }
    return t;
  }

  function applySrcAndSync(video, url, syncTime) {
    video.src = url;
    video.load();
    video.addEventListener(
      'loadeddata',
      function () {
        try {
          if (isFinite(syncTime) && isFinite(video.duration)) {
            video.currentTime = Math.min(syncTime, Math.max(0, video.duration - 0.05));
          }
        } catch (e) {}
        var p = video.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      },
      { once: true }
    );
  }
  var toastEl = document.getElementById('video-structure-video-toast');
  var toastTextEl = toastEl && toastEl.querySelector('.video-structure__video-toast-text');
  var toastHideTimer = null;
  var toastTransitionTimer = null;

  function showVideoStructureToast(text) {
    if (!toastEl || !toastTextEl) return;
    if (toastHideTimer) clearTimeout(toastHideTimer);
    if (toastTransitionTimer) clearTimeout(toastTransitionTimer);
    toastTextEl.textContent = text;
    toastEl.hidden = false;
    requestAnimationFrame(function () {
      toastEl.classList.add('is-visible');
    });
    toastHideTimer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
      toastTransitionTimer = setTimeout(function () {
        toastEl.hidden = true;
        toastHideTimer = null;
        toastTransitionTimer = null;
      }, 520);
    }, 1000);
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var name = tab.dataset.videoStructureTab;
      var blocked = toastIfTabBlocked(name);
      if (blocked) {
        showVideoStructureToast(blocked);
        return;
      }
      setActive(name);
    });
  });

  root.querySelectorAll('.video-structure__button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = btn.closest('[data-video-structure-panel]');
      if (!panel) return;
      var step = panel.dataset.videoStructurePanel;

      if (step === 'subtitles') {
        if (!subsPreviewVideo) return;
        if (btn.classList.contains('video-structure__button--retry')) {
          flowStep = 0;
          btn.classList.remove('video-structure__button--retry');
          btn.textContent = subtitlesLabelAdd;
          var syncBack = readSyncTime();
          applySrcAndSync(subsPreviewVideo, subtitlesSrcDefault, syncBack);
          setActive('plaque');
          return;
        }
        flowStep = 3;
        var syncDone = readSyncTime();
        applySrcAndSync(subsPreviewVideo, subtitlesSrcDone, syncDone);
        btn.classList.add('video-structure__button--retry');
        btn.textContent = subtitlesLabelRetry;
        updateStructureProgress();
        syncStructureTabs();
        updatePreviewHint();
        if (toastAfterAction.subtitles) showVideoStructureToast(toastAfterAction.subtitles);
        return;
      }

      var next = nextAfterAction[step];
      if (!next) return;
      if (step === 'plaque') flowStep = 1;
      if (step === 'logo') flowStep = 2;
      setActive(next);
      var msg = toastAfterAction[step];
      if (msg) showVideoStructureToast(msg);
    });
  });

  const initial =
    tabs.find(function (tab) {
      return tab.classList.contains('is-active');
    }) || tabs[0];
  setActive(initial.dataset.videoStructureTab);
})();
