/* ------------------------------------------------------------------
   Lightweight slider system — wraps existing horizontal "row" blocks
   into a viewport + dot navigation, hides the native scrollbar.
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  // Generic sliders that just need dot navigation on the existing children.
  // Items aren't restructured; one slide == one direct child.
  var GENERIC_SLIDERS = [
    { selector: '.examples-row' },
    { selector: '.weights-examples' },
    { selector: '.hierarchy-block__photo' },
    { selector: '.sticker-rules', fixedPages: true },
    { selector: '.tech-specs', fixedPages: true },
    { selector: '.intervals-block', fixedPages: true }
  ];

  // Breakpoint that mirrors visual.css horizontal-scroll fallback.
  var BREAK = 1934;

  var SLIDER_TEXT_RESET_SELECTOR = [
    '.font-sample__title',
    '.font-sample__caption',
    '.font-sample__big',
    '.font-sample__alphabet',
    '.font-sample__digits',
    '.intervals-col__label',
    '.weight-sample__title',
    '.weight-sample__alphabet',
    '.weight-sample__digits',
    '.sticker-rule__text'
  ].join(',');

  function isMobileMode() {
    return window.innerWidth < BREAK;
  }

  function setImportantStyle(node, prop, value) {
    if (!node || !node.style) return;
    if (node.style.getPropertyValue(prop) === value && node.style.getPropertyPriority(prop) === 'important') return;
    node.style.setProperty(prop, value, 'important');
  }

  function normalizeSlideContent(el) {
    if (!el || !el.querySelectorAll) return;
    Array.prototype.slice.call(el.querySelectorAll(SLIDER_TEXT_RESET_SELECTOR)).forEach(function (node) {
      // Saved editor transforms are absolute visual nudges. Once the block is
      // converted into a slider, those nudges no longer match the new flow and
      // can overlap rows. Slider slides should use normal document flow height.
      setImportantStyle(node, 'transform', 'none');
      setImportantStyle(node, 'translate', 'none');
    });
  }

  function makeIntrinsicHeight(el, viewport) {
    if (!el) return;

    normalizeSlideContent(el);

    // The visual editor can persist fixed inline heights on slider blocks.
    // A fixed height plus horizontal scrolling makes browsers expose an
    // unwanted vertical scroller. Keep the block at its natural full height.
    setImportantStyle(el, 'height', 'auto');
    setImportantStyle(el, 'max-height', 'none');
    setImportantStyle(el, 'min-height', 'max-content');
    setImportantStyle(el, 'overflow', 'visible');
    setImportantStyle(el, 'overflow-y', 'visible');

    if (!viewport) return;
    setImportantStyle(viewport, 'height', 'auto');
    setImportantStyle(viewport, 'max-height', 'none');
    setImportantStyle(viewport, 'min-height', 'max-content');
    setImportantStyle(viewport, 'overflow-y', 'clip');
  }

  function isEditorFrame() {
    return !!(window.frameElement && window.frameElement.id === 'iframe');
  }

  function alignStandalonePaletteToEditor(root) {
    if (!root || isEditorFrame()) return;
    if (!window.matchMedia || !window.matchMedia('(max-width: 833px)').matches) return;

    var title = document.querySelector('#section-colors');
    if (!title || !root.getBoundingClientRect || !title.getBoundingClientRect) return;

    var rootStyle = getComputedStyle(root);
    var grid = parseFloat(getComputedStyle(document.body).getPropertyValue('--site-grid-size')) || 16;
    var rootRect = root.getBoundingClientRect();
    var titleRect = title.getBoundingClientRect();
    var desiredTop = titleRect.bottom + (grid * 2);
    var currentTop = rootStyle.position === 'static' ? 0 : (parseFloat(rootStyle.top) || 0);
    var nextTop = Math.round(currentTop + desiredTop - rootRect.top);

    setImportantStyle(root, 'position', 'relative');
    setImportantStyle(root, 'top', nextTop + 'px');
  }

  function normalizePaletteSystem() {
    var root = document.querySelector('.palette-system');
    if (!root) return;

    setImportantStyle(root, 'height', 'auto');
    setImportantStyle(root, 'max-height', 'none');
    setImportantStyle(root, 'overflow', 'visible');
    setImportantStyle(root, 'flex-direction', 'column');
    setImportantStyle(root, 'flex-wrap', 'nowrap');

    Array.prototype.slice.call(root.querySelectorAll('.palette-system__panels, .palette-system__panel')).forEach(function (node) {
      setImportantStyle(node, 'width', '100%');
      setImportantStyle(node, 'max-width', '100%');
      setImportantStyle(node, 'height', 'auto');
      setImportantStyle(node, 'max-height', 'none');
      setImportantStyle(node, 'overflow', 'visible');
      setImportantStyle(node, 'top', '0px');
      setImportantStyle(node, 'left', '0px');
      setImportantStyle(node, 'transform', 'none');
      setImportantStyle(node, 'translate', 'none');
    });

    Array.prototype.slice.call(root.querySelectorAll('.palette-system__viewport, .palette-system__track, .palette-combo')).forEach(function (node) {
      setImportantStyle(node, 'height', 'auto');
      setImportantStyle(node, 'max-height', 'none');
      setImportantStyle(node, 'min-height', 'var(--palette-slide-min-height)');
      setImportantStyle(node, 'overflow-y', node.classList.contains('palette-system__viewport') ? 'hidden' : 'visible');
      if (!node.classList.contains('palette-system__track')) {
        setImportantStyle(node, 'top', '0px');
        setImportantStyle(node, 'left', '0px');
        setImportantStyle(node, 'transform', 'none');
        setImportantStyle(node, 'translate', 'none');
      }
    });

    Array.prototype.slice.call(root.querySelectorAll('.palette-color')).forEach(function (card) {
      setImportantStyle(card, 'height', 'var(--palette-card-height)');
      setImportantStyle(card, 'max-height', 'none');
      setImportantStyle(card, 'top', '0px');
      setImportantStyle(card, 'left', '0px');
      setImportantStyle(card, 'right', 'auto');
      setImportantStyle(card, 'bottom', 'auto');
      setImportantStyle(card, 'transform', 'none');
      setImportantStyle(card, 'translate', 'none');
    });

    Array.prototype.slice.call(root.querySelectorAll('.palette-system__title, .palette-combo__title')).forEach(function (title) {
      setImportantStyle(title, 'width', '100%');
      setImportantStyle(title, 'max-width', '100%');
      setImportantStyle(title, 'height', 'auto');
      setImportantStyle(title, 'max-height', 'none');
      setImportantStyle(title, 'top', '0px');
      setImportantStyle(title, 'left', '0px');
      setImportantStyle(title, 'transform', 'none');
      setImportantStyle(title, 'translate', 'none');
    });

    alignStandalonePaletteToEditor(root);
  }

  function schedulePaletteNormalization() {
    normalizePaletteSystem();
    [50, 250, 850, 1600].forEach(function (delay) {
      window.setTimeout(normalizePaletteSystem, delay);
    });
  }

  function buildShell(el, opts) {
    var options = opts || {};
    var viewport = el.querySelector(':scope > .slider-shell__viewport');

    el.classList.add('slider-shell');
    if (options.tabs) el.classList.add('slider-shell--tabs');
    else el.classList.remove('slider-shell--tabs');

    if (viewport) {
      var dotsExisting = el.querySelector(':scope > .slider-shell__dots');
      if (!dotsExisting) {
        dotsExisting = document.createElement('div');
        dotsExisting.className = 'slider-shell__dots';
        dotsExisting.setAttribute('role', 'tablist');
        el.appendChild(dotsExisting);
      }
      makeIntrinsicHeight(el, viewport);
      el.dataset.sliderInit = '1';
      return { root: el, viewport: viewport, dots: dotsExisting, opts: options };
    }

    // Старые сохранения могли оставить точки как sibling или прямого ребёнка.
    // Удаляем их перед новой обёрткой, чтобы сайт не отличался после каждого save/load.
    var orphanDots = el.nextElementSibling;
    if (orphanDots && orphanDots.classList && orphanDots.classList.contains('slider-shell__dots')) orphanDots.remove();
    Array.prototype.slice.call(el.querySelectorAll(':scope > .slider-shell__dots')).forEach(function (dotsNode) {
      dotsNode.remove();
    });

    el.dataset.sliderInit = '1';

    // Move the existing children into a new viewport <div>.
    viewport = document.createElement('div');
    viewport.className = 'slider-shell__viewport';
    while (el.firstChild) viewport.appendChild(el.firstChild);
    el.appendChild(viewport);

    makeIntrinsicHeight(el, viewport);

    var dots = document.createElement('div');
    dots.className = 'slider-shell__dots';
    dots.setAttribute('role', 'tablist');
    el.appendChild(dots);

    return { root: el, viewport: viewport, dots: dots, opts: options };
  }

  function getVisibleSlides(viewport) {
    return Array.prototype.slice.call(viewport.children).filter(function (slide) {
      if (!slide || slide.nodeType !== 1) return false;
      if (slide.hidden) return false;
      return slide.getClientRects().length > 0 || slide.offsetWidth > 0 || slide.offsetHeight > 0;
    });
  }

  function getSlideLeft(viewport, slide) {
    if (!viewport || !slide || !viewport.getBoundingClientRect || !slide.getBoundingClientRect) return 0;
    var viewportRect = viewport.getBoundingClientRect();
    var slideRect = slide.getBoundingClientRect();
    return Math.max(0, slideRect.left - viewportRect.left + viewport.scrollLeft);
  }

  function syncDots(state) {
    makeIntrinsicHeight(state.root, state.viewport);
    var v = state.viewport;
    var slides = getVisibleSlides(v);
    var pageCount;

    state.slides = slides;

    if (state.opts.fixedPages) {
      pageCount = v.scrollWidth <= v.clientWidth + 1 ? 1 : Math.max(1, slides.length);
    } else {
      // Page width = viewport client width. Page count = ceil(scrollWidth/clientWidth).
      pageCount = Math.max(1, Math.ceil(v.scrollWidth / Math.max(1, v.clientWidth)));
    }

    if (state.dots.childElementCount !== pageCount) {
      state.dots.innerHTML = '';
      for (var i = 0; i < pageCount; i++) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'slider-shell__dot';
        b.dataset.sliderDot = String(i);
        b.setAttribute('role', 'tab');
        if (state.opts.tabs) b.textContent = String(i + 1);
        b.setAttribute('aria-label', (state.opts.label || 'Слайд') + ' ' + (i + 1));
        b.addEventListener('click', (function (idx) {
          return function () { goTo(state, idx); };
        })(i));
        state.dots.appendChild(b);
      }
    }
    state.pageCount = pageCount;
    // Hide the dot strip when the slider only has a single page —
    // avoids a lonely dot on wide viewports.
    state.dots.style.display = pageCount > 1 ? '' : 'none';
    updateActiveDot(state);
  }

  function currentPage(state) {
    var v = state.viewport;
    var pageW = v.clientWidth || 1;
    if (state.opts.fixedPages) {
      var slides = state.slides && state.slides.length ? state.slides : getVisibleSlides(v);
      var closest = 0;
      var closestDistance = Infinity;
      for (var i = 0; i < slides.length; i++) {
        var distance = Math.abs(v.scrollLeft - getSlideLeft(v, slides[i]));
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = i;
        }
      }
      return closest;
    }
    return Math.round(v.scrollLeft / pageW);
  }

  function updateActiveDot(state) {
    var idx = currentPage(state);
    var dots = state.dots.children;
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('is-active', i === idx);
      dots[i].setAttribute('aria-selected', i === idx ? 'true' : 'false');
    }
  }

  function goTo(state, idx) {
    var v = state.viewport;
    var pageW = v.clientWidth;
    var left = pageW * idx;
    if (state.opts.fixedPages) {
      var slides = state.slides && state.slides.length ? state.slides : getVisibleSlides(v);
      if (slides[idx]) left = getSlideLeft(v, slides[idx]);
    }
    v.scrollTo({ left: left, behavior: 'smooth' });
  }

  function attachListeners(state) {
    var raf = null;
    state.viewport.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        updateActiveDot(state);
      });
    }, { passive: true });

    var ro = (typeof ResizeObserver !== 'undefined') ? new ResizeObserver(function () {
      syncDots(state);
    }) : null;
    if (ro) ro.observe(state.viewport);

    window.addEventListener('resize', function () { syncDots(state); });
  }

  // ----------------------------------------------------------------
  // Special builder: typography .font-block
  // ----------------------------------------------------------------
  function buildFontBlock() {
    var block = document.querySelector('.font-block');
    if (!block) return;

    if (block.querySelector(':scope > .slider-shell__viewport')) {
      var existingState = buildShell(block, { fixedPages: true, label: 'Шрифт' });
      if (existingState) {
        syncDots(existingState);
        attachListeners(existingState);
      }
      return;
    }

    var copy = block.querySelector('.font-block__copy');
    var bold = block.querySelector('.font-sample--bold');
    var light = block.querySelector('.font-sample--light');
    if (!copy || !bold || !light) return;

    var paragraphs = copy.querySelectorAll('p');
    var pBold = paragraphs[0] ? paragraphs[0].cloneNode(true) : null;
    var pLight = paragraphs[1] ? paragraphs[1].cloneNode(true) : null;
    var credit = copy.querySelector('.font-block__credit');
    var creditClone = credit ? credit.cloneNode(true) : null;

    function makeCopy(node) {
      var c = document.createElement('div');
      c.className = 'font-block__copy';
      if (node) c.appendChild(node);
      if (creditClone) c.appendChild(creditClone.cloneNode(true));
      return c;
    }

    var slide1 = document.createElement('div');
    slide1.className = 'font-block__slide';
    slide1.appendChild(makeCopy(pBold));
    slide1.appendChild(bold);

    var slide2 = document.createElement('div');
    slide2.className = 'font-block__slide';
    slide2.appendChild(makeCopy(pLight));
    slide2.appendChild(light);

    // Clear block and re-mount as slider shell.
    while (block.firstChild) block.removeChild(block.firstChild);
    block.appendChild(slide1);
    block.appendChild(slide2);

    var state = buildShell(block, { fixedPages: true, label: 'Шрифт' });
    if (state) {
      syncDots(state);
      attachListeners(state);
    }
  }

  // ----------------------------------------------------------------
  // Special builder: typography .weights-block
  // 4 samples grouped into 2 slides of 2; square tab switcher.
  // ----------------------------------------------------------------
  function buildWeightsBlock() {
    var block = document.querySelector('.weights-block');
    if (!block) return;

    if (block.querySelector(':scope > .slider-shell__viewport')) {
      var existingState = buildShell(block, { fixedPages: true, tabs: true, label: 'Начертания' });
      if (existingState) {
        syncDots(existingState);
        attachListeners(existingState);
      }
      return;
    }

    var samples = Array.prototype.slice.call(block.querySelectorAll('.weight-sample'));
    if (samples.length < 2) return;

    while (block.firstChild) block.removeChild(block.firstChild);

    for (var i = 0; i < samples.length; i += 2) {
      var slide = document.createElement('div');
      slide.className = 'weights-block__slide';
      slide.appendChild(samples[i]);
      if (samples[i + 1]) slide.appendChild(samples[i + 1]);
      block.appendChild(slide);
    }

    var state = buildShell(block, { fixedPages: true, tabs: true, label: 'Начертания' });
    if (state) {
      syncDots(state);
      attachListeners(state);
    }
  }

  // ----------------------------------------------------------------
  // Generic builder: one slide per direct child, page = viewport width.
  // ----------------------------------------------------------------
  function buildGeneric(config) {
    var cfg = typeof config === 'string' ? { selector: config } : (config || {});
    var el = document.querySelector(cfg.selector);
    if (!el) return;
    if (!el.querySelector(':scope > .slider-shell__viewport') && (!el.children || el.children.length < 2)) return;

    var state = buildShell(el, { label: 'Слайд', fixedPages: !!cfg.fixedPages });
    if (!state) return;
    syncDots(state);
    attachListeners(state);
  }

  function init() {
    // Build the typography font block into two slides: headings and main text.
    buildFontBlock();
    buildWeightsBlock();
    GENERIC_SLIDERS.forEach(buildGeneric);
    schedulePaletteNormalization();
    window.addEventListener('resize', schedulePaletteNormalization);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
