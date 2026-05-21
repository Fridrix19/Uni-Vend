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

  function resetGridInlineBox() {
    grid.style.removeProperty('display');
    grid.style.removeProperty('height');
    grid.style.removeProperty('min-height');
  }

  function updateGrid() {
    document.body.style.setProperty('padding-top', '0', 'important');
    document.body.style.setProperty('overflow-x', 'hidden', 'important');

    if (window.matchMedia('(max-width: 1728px)').matches) {
      grid.style.setProperty('display', 'none', 'important');
      grid.style.setProperty('height', '0px', 'important');
      grid.style.setProperty('min-height', '0px', 'important');
      return;
    }

    resetGridInlineBox();
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
  const tabs = Array.from(document.querySelectorAll('[data-music-use-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-music-use-panel]'));
  if (!tabs.length || !panels.length) return;

  function syncVideo(panel, active) {
    panel.querySelectorAll('video').forEach(function (video) {
      if (active) {
        var p = video.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      } else {
        video.pause();
      }
    });
  }

  function setActive(name) {
    tabs.forEach(function (tab) {
      const active = tab.dataset.musicUseTab === name;
      tab.classList.toggle('is-active', active);
      tab.classList.toggle('hero__button--primary', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    panels.forEach(function (panel) {
      const active = panel.dataset.musicUsePanel === name;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
      syncVideo(panel, active);
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      setActive(tab.dataset.musicUseTab);
    });
  });

  const initial = tabs.find(function (tab) { return tab.classList.contains('is-active'); }) || tabs[0];
  setActive(initial.dataset.musicUseTab);
})();

(function () {
  const tabs = Array.from(document.querySelectorAll('[data-video-settings-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-video-settings-panel]'));
  if (!tabs.length || !panels.length) return;

  function setActive(name) {
    tabs.forEach(function (tab) {
      const active = tab.dataset.videoSettingsTab === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    panels.forEach(function (panel) {
      const active = panel.dataset.videoSettingsPanel === name;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      setActive(tab.dataset.videoSettingsTab);
    });
  });

  const initial = tabs.find(function (tab) { return tab.classList.contains('is-active'); }) || tabs[0];
  setActive(initial.dataset.videoSettingsTab);
})();

(function () {
  const root = document.querySelector('.video-checklist');
  if (!root) return;

  const video = root.querySelector('[data-video-checklist-video]');
  const message = root.querySelector('[data-video-checklist-message]');
  const submit = root.querySelector('[data-video-checklist-submit]');
  const mute = root.querySelector('[data-video-checklist-mute]');
  const timer = root.querySelector('[data-video-checklist-timer]');
  const timerNum = root.querySelector('[data-video-checklist-timer-num]');
  const timerProgress = timer && timer.querySelector('.video-checklist__timer-progress');
  const items = Array.from(root.querySelectorAll('[data-video-checklist-item]'));
  const checks = Array.from(root.querySelectorAll('[data-video-checklist-check]'));
  if (!video || !message || !submit || !mute || !timer || !timerNum || !timerProgress || !items.length || !checks.length) return;

  const steps = ['format', 'plaque', 'logo', 'subtitles', 'sound'];
  const labels = {
    format: 'Формат и соотношение сторон',
    plaque: 'Плашка',
    logo: 'Логотип',
    subtitles: 'Субтитры',
    sound: 'Звуковое сопровождение'
  };
  const videoByStep = {
    plaque: 'video-content/swap/nologo-notitle.mp4',
    logo: 'video-content/swap/notitle.mp4',
    subtitles: 'video-content/swap/done.mp4',
    sound: 'video-content/swap/done_sound.mp4'
  };
  var currentIndex = 0;
  var messageTimer = null;
  var scanTimer = null;
  var lastKnownTime = 0;
  var isSoundClip = false;
  var resetTimer = null;
  var resetInterval = null;

  function stopResetTimer() {
    window.clearTimeout(resetTimer);
    window.clearInterval(resetInterval);
    timer.hidden = true;
    timerNum.textContent = '10';
    timerProgress.style.strokeDashoffset = '0';
  }

  function updateMuteButton() {
    mute.hidden = !isSoundClip;
    mute.classList.toggle('is-muted', video.muted);
    mute.textContent = video.muted ? 'Вкл' : 'Звук';
    mute.setAttribute('aria-label', video.muted ? 'Включить звук' : 'Выключить звук');
  }

  function showMessage(text, duration) {
    window.clearTimeout(messageTimer);
    message.textContent = text;
    message.classList.add('is-visible');
    if (duration) {
      messageTimer = window.setTimeout(function () {
        message.classList.remove('is-visible');
      }, duration);
    }
  }

  function readChecklistTime() {
    if (isFinite(video.currentTime)) {
      lastKnownTime = video.currentTime;
    }
    return lastKnownTime;
  }

  function setVideo(src, withSound) {
    var syncTime = readChecklistTime();
    root.classList.add('is-switching-video');
    video.src = src;
    isSoundClip = withSound;
    video.muted = !withSound;
    video.loop = true;
    video.playsInline = true;
    video.load();

    function applyTimeAndPlay() {
      if (isFinite(syncTime)) {
        try {
          var duration = isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
          video.currentTime = duration ? Math.min(syncTime, Math.max(duration - 0.1, 0)) : syncTime;
        } catch (e) {}
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
      updateMuteButton();
      window.setTimeout(function () {
        root.classList.remove('is-switching-video');
      }, 260);
    }

    if (video.readyState >= 1) {
      applyTimeAndPlay();
    } else {
      video.addEventListener('loadedmetadata', applyTimeAndPlay, { once: true });
    }
  }

  function syncChecklist(changedName) {
    items.forEach(function (item) {
      const name = item.dataset.videoChecklistItem;
      const index = steps.indexOf(name);
      const enabled = index <= currentIndex;
      const checked = index < currentIndex;
      const check = item.querySelector('[data-video-checklist-check]');

      item.classList.toggle('is-enabled', enabled);
      item.classList.toggle('is-checked', checked);
      item.classList.toggle('is-just-checked', name === changedName && checked);
      item.classList.toggle('is-just-enabled', name === steps[currentIndex] && enabled && name !== changedName);
      if (check) check.disabled = !enabled;
      if (name === changedName || name === steps[currentIndex]) {
        window.setTimeout(function () {
          item.classList.remove('is-just-checked', 'is-just-enabled');
        }, 520);
      }
    });
  }

  function resetChecklist() {
    window.clearTimeout(scanTimer);
    root.classList.remove('is-scanning', 'is-switching-video');
    stopResetTimer();
    currentIndex = 0;
    lastKnownTime = 0;
    isSoundClip = false;
    message.classList.remove('is-visible');
    setVideo('video-content/swap/nologo-notitle-notablet.mp4', false);
    syncChecklist();
  }

  function startResetTimer() {
    var seconds = 10;
    stopResetTimer();
    timer.hidden = false;
    timerNum.textContent = String(seconds);
    timerProgress.style.strokeDashoffset = '0';
    resetInterval = window.setInterval(function () {
      seconds -= 1;
      timerNum.textContent = String(Math.max(seconds, 0));
      timerProgress.style.strokeDashoffset = String((10 - seconds) * 10);
      if (seconds <= 0) {
        stopResetTimer();
        resetChecklist();
      }
    }, 1000);
  }

  function advance(name) {
    const index = steps.indexOf(name);
    if (index === -1 || index !== currentIndex) return;

    stopResetTimer();
    currentIndex = Math.min(currentIndex + 1, steps.length);
    if (videoByStep[name]) {
      setVideo(videoByStep[name], name === 'sound');
    }
    message.classList.remove('is-visible');
    syncChecklist(name);
  }

  mute.addEventListener('click', function () {
    if (!isSoundClip) return;
    video.muted = !video.muted;
    updateMuteButton();
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  });

  checks.forEach(function (check) {
    check.addEventListener('click', function () {
      advance(check.dataset.videoChecklistCheck);
    });
  });

  submit.addEventListener('click', function () {
    window.clearTimeout(scanTimer);
    root.classList.remove('is-scanning');

    if (currentIndex < steps.length) {
      showMessage('Вы не добавили «' + labels[steps[currentIndex]] + '»', 2200);
      return;
    }

    message.classList.remove('is-visible');
    window.requestAnimationFrame(function () {
      root.classList.add('is-scanning');
    });
    scanTimer = window.setTimeout(function () {
      root.classList.remove('is-scanning');
      showMessage('Видео соответствует требованиям', 0);
      startResetTimer();
    }, 1900);
  });

  video.addEventListener('timeupdate', readChecklistTime);
  video.addEventListener('loadedmetadata', function () {
    if (isFinite(video.currentTime)) lastKnownTime = video.currentTime;
  });

  updateMuteButton();
  stopResetTimer();
  syncChecklist();
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

(function () {
  var BAR_COUNT = 40;
  var BASE_HEIGHT = 30;
  var TICK_MS = 110;

  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return m + ':' + (s < 10 ? '0' + s : s);
  }

  function buildBars(container) {
    if (container.querySelector('.audio-player__wave-bar')) return;
    for (var i = 0; i < BAR_COUNT; i++) {
      var bar = document.createElement('span');
      bar.className = 'audio-player__wave-bar';
      bar.style.height = BASE_HEIGHT + '%';
      container.appendChild(bar);
    }
  }

  function flatBars(bars) {
    for (var i = 0; i < bars.length; i++) {
      bars[i].style.height = BASE_HEIGHT + '%';
    }
  }

  function tickBars(bars) {
    for (var i = 0; i < bars.length; i++) {
      var phase = (Date.now() / 200) + i * 0.45;
      var pulse = (Math.sin(phase) + 1) / 2;
      var noise = Math.random();
      var h = 25 + pulse * 45 + noise * 30;
      bars[i].style.height = Math.min(100, h) + '%';
    }
  }

  var players = document.querySelectorAll('.audio-player');
  var allAudios = [];

  players.forEach(function (player) {
    var btn = player.querySelector('.audio-player__btn');
    var audio = player.querySelector('audio');
    var time = player.querySelector('.audio-player__time');
    var wave = player.querySelector('.audio-player__wave');
    if (!btn || !audio || !time || !wave) return;

    allAudios.push(audio);
    buildBars(wave);
    var bars = wave.querySelectorAll('.audio-player__wave-bar');
    var visualizerId = null;

    function startVisualizer() {
      if (visualizerId) return;
      visualizerId = setInterval(function () { tickBars(bars); }, TICK_MS);
    }

    function stopVisualizer() {
      if (visualizerId) {
        clearInterval(visualizerId);
        visualizerId = null;
      }
      flatBars(bars);
    }

    function updateProgress() {
      var dur = audio.duration;
      var cur = audio.currentTime;
      if (!isFinite(dur) || dur <= 0) {
        time.textContent = formatTime(cur);
        return;
      }
      var ratio = cur / dur;
      var played = Math.floor(ratio * bars.length);
      for (var i = 0; i < bars.length; i++) {
        bars[i].classList.toggle('is-played', i < played);
      }
      time.textContent = formatTime(audio.paused ? dur : cur);
    }

    audio.addEventListener('loadedmetadata', function () {
      time.textContent = formatTime(audio.duration);
    });
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('play', startVisualizer);
    audio.addEventListener('pause', stopVisualizer);
    audio.addEventListener('ended', function () {
      player.classList.remove('is-playing');
      btn.setAttribute('aria-label', 'Воспроизвести');
      for (var i = 0; i < bars.length; i++) bars[i].classList.remove('is-played');
      stopVisualizer();
      time.textContent = formatTime(audio.duration);
    });

    btn.addEventListener('click', function () {
      if (audio.paused) {
        allAudios.forEach(function (a) {
          if (a !== audio && !a.paused) {
            a.pause();
            var p = a.closest('.audio-player');
            if (p) p.classList.remove('is-playing');
          }
        });
        audio.play();
        player.classList.add('is-playing');
        btn.setAttribute('aria-label', 'Пауза');
      } else {
        audio.pause();
        player.classList.remove('is-playing');
        btn.setAttribute('aria-label', 'Воспроизвести');
      }
    });

    wave.addEventListener('click', function (event) {
      var rect = wave.getBoundingClientRect();
      var ratio = (event.clientX - rect.left) / rect.width;
      if (audio.duration && isFinite(audio.duration)) {
        audio.currentTime = Math.max(0, Math.min(audio.duration, ratio * audio.duration));
        updateProgress();
      }
    });
  });
})();

(function () {
  const roots = Array.from(document.querySelectorAll('.video-faq, .music-faq'));
  if (!roots.length) return;

  roots.forEach(function (root) {
    const items = Array.from(root.querySelectorAll('.video-faq__item, .music-faq__item'));
    const questions = Array.from(root.querySelectorAll('.video-faq__question, .music-faq__question'));

    function closeAll(except) {
      items.forEach(function (item) {
        if (item === except) return;
        const question = item.querySelector('.video-faq__question, .music-faq__question');
        const answer = item.querySelector('.video-faq__answer, .music-faq__answer');
        if (question) question.setAttribute('aria-expanded', 'false');
        if (answer) answer.hidden = true;
        item.classList.remove('is-open');
      });
    }

    questions.forEach(function (question) {
      question.addEventListener('click', function () {
        const item = question.closest('.video-faq__item, .music-faq__item');
        const answer = item ? item.querySelector('.video-faq__answer, .music-faq__answer') : null;
        if (!item || !answer) return;
        const willOpen = answer.hidden;
        closeAll(item);
        question.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        answer.hidden = !willOpen;
        item.classList.toggle('is-open', willOpen);
      });
    });
  });
})();

(function () {
  const root = document.querySelector('.video-realized');
  if (!root) return;

  const pages = Array.from(root.querySelectorAll('[data-video-realized-page]'));
  if (!pages.length) return;

  const slider = root.querySelector('.video-realized__grid');
  const items = Array.from(root.querySelectorAll('.video-realized__item'));

  function setPage(page) {
    var index = Number(page);
    var item = items[index];
    pages.forEach(function (button) {
      const isActive = button.dataset.videoRealizedPage === String(page);
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    if (slider && item) {
      slider.scrollTo({ left: item.offsetLeft - slider.offsetLeft, behavior: 'smooth' });
    }
  }

  pages.forEach(function (button) {
    button.addEventListener('click', function () {
      setPage(button.dataset.videoRealizedPage);
    });
  });

  setPage(0);
})();
