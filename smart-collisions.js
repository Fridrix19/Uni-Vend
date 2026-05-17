/*
 * Smart Collisions — vertical anti-overlap runtime for Uni-Vend pages and editor.
 *
 * - Enabled by default for all visible page elements inside logical work groups.
 * - Keeps at least one grid cell between vertically intersecting elements.
 * - Works vertically only.
 * - Uses requestAnimationFrame, ResizeObserver and MutationObserver to avoid lag.
 * - Can be disabled by element, class or id through data attributes on <html>, <body> or any group root.
 */
(function (global) {
  'use strict';

  const DEFAULTS = {
    enabled: true,
    groupSelector: '[data-smart-collision-group], .visual-section__work, .hero__work',
    fallbackGroupSelector: 'main, section, [id="allrecords"], body',
    itemSelector: '[data-smart-collision-item], .snap, [data-editor-id], .new-block, .new-text, .new-image, .new-flex-container, .new-grid-container',
    includeAllDirectChildren: true,
    minGapCells: 1,
    maxPasses: 4,
    epsilon: 0.5,
    managedAttr: 'data-smart-collision-managed',
    disabledAttr: 'data-smart-collision-disabled',
    disabledClassesAttr: 'data-smart-collision-disabled-classes',
    disabledIdsAttr: 'data-smart-collision-disabled-ids',
    runtimeScriptAttr: 'data-smart-collisions-runtime',
    collisionModeAttr: 'data-smart-collision-mode',
    bufferCellsAttr: 'data-smart-collision-buffer-cells',
    bufferSideAttr: 'data-smart-collision-buffer-side',
    ignoreSelector: [
      'script',
      'style',
      'link',
      'meta',
      'template',
      'noscript',
      'svg defs',
      '[hidden]',
      '[aria-hidden="true"]',
      '[data-editor-style]',
      '[data-editor-responsive]',
      '[data-smart-collision-ignore]',
      '[data-smart-collisions-runtime]',
      '.palette-section *',
      '#grid-32-underlay',
      '.page-transition'
    ].join(','),
    excludedStructuralSelector: 'nav, .hero__nav, .hero__ticks',
    onMove: null,
    onAfterLayout: null,
    editorMode: false,
    commitEditorCoords: false
  };

  const stateMap = new WeakMap();
  const READY_CLASS = 'smart-collisions-ready';
  const PENDING_CLASS = 'smart-collisions-pending';

  function markReady(doc) {
    if (doc && doc.documentElement && doc.documentElement.classList) {
      doc.documentElement.classList.add(READY_CLASS);
      doc.documentElement.classList.remove(PENDING_CLASS);
    }
  }

  function revealAfterInitialLayout(instance) {
    const doc = getDoc(instance.root);
    const win = getWin(doc);
    let revealed = false;

    const reveal = () => {
      if (revealed || instance.destroyed) return;
      revealed = true;
      layout(instance.root, instance.options);
      const commit = () => markReady(doc);
      if (win.requestAnimationFrame) win.requestAnimationFrame(commit);
      else win.setTimeout(commit, 0);
    };

    if (doc.fonts && doc.fonts.ready && typeof doc.fonts.ready.then === 'function') {
      const fallbackTimer = win.setTimeout(reveal, 450);
      doc.fonts.ready.then(() => {
        win.clearTimeout(fallbackTimer);
        reveal();
      }, reveal);
      return;
    }

    if (win.requestAnimationFrame) win.requestAnimationFrame(reveal);
    else win.setTimeout(reveal, 0);
  }

  function toArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return String(value)
      .split(/[\s,]+/)
      .map(part => part.trim())
      .filter(Boolean);
  }

  function uniq(items) {
    return Array.from(new Set(items.filter(Boolean)));
  }

  function clampNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function getDoc(root) {
    return root && root.nodeType === 9 ? root : (root && root.ownerDocument) || global.document;
  }

  function getWin(doc) {
    return (doc && doc.defaultView) || global;
  }

  function cssEscape(value) {
    if (global.CSS && typeof global.CSS.escape === 'function') return global.CSS.escape(value);
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  function snapUp(value, gridSize) {
    if (!Number.isFinite(value) || !Number.isFinite(gridSize) || gridSize <= 0) return value;
    return Math.ceil((value - 0.001) / gridSize) * gridSize;
  }

  function mergeOptions(options) {
    const merged = Object.assign({}, DEFAULTS, options || {});
    merged.minGapCells = Math.max(0, clampNumber(merged.minGapCells, DEFAULTS.minGapCells));
    merged.maxPasses = Math.max(1, clampNumber(merged.maxPasses, DEFAULTS.maxPasses));
    return merged;
  }

  function readCollisionBuffer(el, gridSize, options) {
    if (!el || !el.getAttribute) return { top: 0, bottom: 0, cells: 0, side: 'bottom' };
    const cells = Math.max(0, clampNumber(el.getAttribute(options.bufferCellsAttr), 0));
    const sideRaw = String(el.getAttribute(options.bufferSideAttr) || 'bottom').trim().toLowerCase();
    const side = sideRaw === 'top' || sideRaw === 'both' ? sideRaw : 'bottom';
    const size = cells * gridSize;
    return {
      top: side === 'top' || side === 'both' ? size : 0,
      bottom: side === 'bottom' || side === 'both' ? size : 0,
      cells,
      side
    };
  }

  function readConfigList(scope, attr) {
    const doc = getDoc(scope);
    const html = doc.documentElement;
    const body = doc.body;
    const values = [];
    [html, body, scope].forEach(node => {
      if (!node || !node.getAttribute) return;
      values.push(...toArray(node.getAttribute(attr)));
    });
    return uniq(values);
  }

  function readConfigBool(scope, attr, fallback) {
    const doc = getDoc(scope);
    const nodes = [doc.documentElement, doc.body, scope];
    for (const node of nodes) {
      if (!node || !node.hasAttribute || !node.hasAttribute(attr)) continue;
      const raw = String(node.getAttribute(attr) || '').trim().toLowerCase();
      if (raw === '' || raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on') return true;
      if (raw === 'false' || raw === '0' || raw === 'no' || raw === 'off') return false;
    }
    return fallback;
  }

  function readConfigString(scope, attr, fallback) {
    const doc = getDoc(scope);
    const nodes = [scope, doc.body, doc.documentElement];
    for (const node of nodes) {
      if (!node || !node.hasAttribute || !node.hasAttribute(attr)) continue;
      const raw = String(node.getAttribute(attr) || '').trim();
      if (raw) return raw;
    }
    return fallback;
  }

  // Optimized detector: checks if parent window is actively performing drag gestures
  function isParentGestureActive(win) {
    try {
      const parentWin = win.parent;
      if (parentWin && parentWin !== win) {
        if (parentWin.isDragging || parentWin.isResizing) {
          return true;
        }
      }
    } catch (e) {}
    return false;
  }

  function getCollisionMode(scope, options) {
    const mode = readConfigString(scope, options.collisionModeAttr, options.collisionMode || 'push').toLowerCase();
    return mode === 'free' || mode === 'swap' ? mode : 'push';
  }

  function getGridSize(scope, options) {
    const doc = getDoc(scope);
    const win = getWin(doc);
    const candidates = [scope, doc.body, doc.documentElement].filter(Boolean);
    for (const node of candidates) {
      if (!node || node.nodeType !== 1) continue;
      const cs = win.getComputedStyle(node);
      const raw = cs.getPropertyValue('--site-grid-size') || cs.getPropertyValue('--grid-size');
      const parsed = parseFloat(raw);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
    return options.editorMode ? 32 : 32;
  }

  function isVisible(el, win) {
    if (!el || el.nodeType !== 1 || !el.isConnected) return false;
    if (el.matches && el.matches(DEFAULTS.ignoreSelector)) return false;
    const cs = win.getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse') return false;

    const isTransparentReveal = el.classList && el.classList.contains('reveal');
    const isExplicitCollisionItem = el.hasAttribute('data-smart-collision-item');
    if (parseFloat(cs.opacity) === 0 && !isExplicitCollisionItem && !isTransparentReveal) return false;

    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function hasDisabledToken(el, options, scope) {
    if (!el || !el.getAttribute) return true;
    if (el.hasAttribute(options.disabledAttr)) {
      const raw = String(el.getAttribute(options.disabledAttr) || '').trim().toLowerCase();
      if (raw === '' || raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on') return true;
    }

    const disabledIds = readConfigList(scope, options.disabledIdsAttr);
    if (el.id && disabledIds.includes(el.id)) return true;

    const disabledClasses = readConfigList(scope, options.disabledClassesAttr);
    if (disabledClasses.length && el.classList) {
      for (const cls of disabledClasses) {
        const normalized = cls.startsWith('.') ? cls.slice(1) : cls;
        if (normalized && el.classList.contains(normalized)) return true;
      }
    }

    return false;
  }

  function shouldIgnoreElement(el, group, options, win) {
    if (!el || el === group) return true;
    if (!isVisible(el, win)) return true;
    if (el.matches && el.matches(options.ignoreSelector)) return true;
    if (el.matches && el.matches(options.excludedStructuralSelector)) return true;
    if (el.closest && el.closest(options.excludedStructuralSelector) && !el.matches(options.itemSelector)) return true;
    if (hasDisabledToken(el, options, group)) return true;
    return false;
  }

  function elementDepth(el, group) {
    let depth = 0;
    let node = el;
    while (node && node !== group) {
      depth += 1;
      node = node.parentElement;
    }
    return depth;
  }

  function horizontallyIntersects(a, b) {
    return a.left < b.right && a.right > b.left;
  }

  function collectGroups(root, options) {
    const doc = getDoc(root);
    const scope = root && root.nodeType === 1 ? root : doc;
    let groups = Array.from(scope.querySelectorAll ? scope.querySelectorAll(options.groupSelector) : []);

    if (!groups.length) {
      groups = Array.from(scope.querySelectorAll ? scope.querySelectorAll(options.fallbackGroupSelector) : []);
    }

    if (scope.nodeType === 1 && scope.matches && (scope.matches(options.groupSelector) || scope.matches(options.fallbackGroupSelector))) {
      groups.unshift(scope);
    }

    groups = uniq(groups).filter(group => group && group.nodeType === 1 && group.isConnected);
    return groups.length ? groups : (doc.body ? [doc.body] : []);
  }

  function collectItems(group, options, win) {
    const directChildren = options.includeAllDirectChildren ? Array.from(group.children || []) : [];
    const explicitItems = Array.from(group.querySelectorAll ? group.querySelectorAll(options.itemSelector) : []);
    const items = uniq([...directChildren, ...explicitItems]);

    // Pre-filter: ignored / disabled / wrong-group items are removed first so the
    // ancestor-walk below doesn't treat them as "outer" collision items.
    const prefiltered = items.filter(el => {
      if (shouldIgnoreElement(el, group, options, win)) return false;
      const nestedManagedParent = el.parentElement && el.parentElement.closest(options.groupSelector);
      if (nestedManagedParent && nestedManagedParent !== group && !el.hasAttribute('data-smart-collision-item')) return false;
      return true;
    });

    // Drop items nested inside another collision item — they should move with
    // their outer container, not be solved independently. This is important
    // for elements that only got `data-editor-id` (and thus matched the item
    // selector) but logically belong to a parent .snap / explicit item.
    const itemSet = new Set(prefiltered);
    return prefiltered.filter(el => {
      if (el.hasAttribute('data-smart-collision-item')) return true;
      let parent = el.parentElement;
      while (parent && parent !== group) {
        if (itemSet.has(parent)) return false;
        parent = parent.parentElement;
      }
      return true;
    });
  }

  function getBaseTransform(el, record) {
    if (record && record.baseTransform !== undefined) return record.baseTransform;
    const inline = el.style.transform || '';
    const base = inline.includes('translate3d(0px, var(--smart-collision-y') ? '' : inline;
    return base === 'none' ? '' : base;
  }

  function getRecord(instance, el) {
    let record = instance.records.get(el);
    if (!record) {
      record = {
        baseTransform: el.style.transform && el.style.transform !== 'none' ? el.style.transform : '',
        baseTranslate: el.style.translate && el.style.translate !== 'none' ? el.style.translate : '',
        baseMarginTop: el.style.marginTop || '',
        baseMinHeight: el.style.minHeight || '',
        lastShift: 0,
        mode: ''
      };
      instance.records.set(el, record);
    }
    return record;
  }

  function resetManagedElement(instance, el) {
    const record = instance.records.get(el);
    if (!record) return;
    if (record.mode === 'margin') {
      if (record.baseMarginTop) el.style.marginTop = record.baseMarginTop;
      else el.style.removeProperty('margin-top');
    } else {
      if (record.baseTranslate) el.style.translate = record.baseTranslate;
      else el.style.removeProperty('translate');
      if (record.baseTransform) el.style.transform = record.baseTransform;
      else if (record.mode === 'transform') el.style.removeProperty('transform');
    }
    if (record.baseMinHeight) el.style.minHeight = record.baseMinHeight;
    else if (record.baseMinHeight === '') el.style.removeProperty('min-height');
    el.style.removeProperty('--smart-collision-y');
    el.removeAttribute(instance.options.managedAttr);
    record.lastShift = 0;
    record.mode = '';
  }

  function resetManaged(root, options) {
    const instance = getInstance(root || global.document, options);
    instance.records.forEach((record, el) => resetManagedElement(instance, el));
    return instance;
  }

  function resetStaleManaged(instance, currentItems, group) {
    const current = new Set(currentItems);
    instance.records.forEach((record, el) => {
      if (record.group !== group) return;
      if (!current.has(el) || !el.isConnected || hasDisabledToken(el, instance.options, group)) {
        resetManagedElement(instance, el);
      }
    });
  }

  function getLayoutMode(el, cs) {
    const position = cs.position;
    if (position === 'absolute' || position === 'fixed' || el.classList.contains('snap')) return 'transform';
    return 'margin';
  }

  function readSnapGridCoord(el, axis, win) {
    if (!el || !el.style) return null;
    const baseName = axis === 'x' ? '--x' : '--y';
    const computed = win && win.getComputedStyle ? win.getComputedStyle(el).getPropertyValue(baseName).trim() : '';
    if (computed) {
      const value = parseFloat(computed);
      if (Number.isFinite(value)) return value;
    }

    const responsive = [
      `--editor---${axis}-desktop`,
      `--editor---${axis}-laptop`,
      `--editor---${axis}-tablet-l`,
      `--editor---${axis}-tablet-p`,
      `--editor---${axis}-mobile`
    ];
    const names = [baseName, ...responsive];
    for (const name of names) {
      const raw = el.style.getPropertyValue(name).trim();
      if (!raw) continue;
      const value = parseFloat(raw);
      if (Number.isFinite(value)) return value;
    }
    return null;
  }

  // Optimized layout-thrashing prevention: Batch resets first, then batch read client rects and styles
  function readItemRects(instance, group, items, gridSize) {
    const win = getWin(getDoc(group));
    
    // Batch Phase 1: Write (Reset all managed elements in a single batch to avoid layout thrashing)
    items.forEach(el => {
      const record = getRecord(instance, el);
      record.group = group;
      const lastShift = record.lastShift || 0;
      if (lastShift) resetManagedElement(instance, el);
    });

    // Batch Phase 2: Read (Forces a single layout update and sequentially reads sizes)
    const groupRect = group.getBoundingClientRect();

    return items.map((el, order) => {
      const record = getRecord(instance, el);
      const rect = el.getBoundingClientRect();
      const cs = win.getComputedStyle(el);
      const isSnap = el.classList && el.classList.contains('snap');
      const snapY = isSnap ? readSnapGridCoord(el, 'y', win) : null;
      const snapX = isSnap ? readSnapGridCoord(el, 'x', win) : null;
      const top = snapY === null ? rect.top - groupRect.top : snapY * gridSize;
      const left = snapX === null ? rect.left - groupRect.left : snapX * gridSize;
      const width = rect.width;
      const height = rect.height;
      const buffer = readCollisionBuffer(el, gridSize, instance.options);
      return {
        el,
        record,
        order,
        depth: elementDepth(el, group),
        mode: getLayoutMode(el, cs),
        top,
        left,
        right: left + width,
        bottom: top + height,
        width,
        height,
        isSnap,
        bufferTop: buffer.top,
        bufferBottom: buffer.bottom,
        bufferCells: buffer.cells,
        bufferSide: buffer.side,
        shift: 0,
        gridY: Math.round(top / gridSize)
      };
    }).filter(item => item.width > 0 && item.height > 0);
  }

  function solveVertical(items, gridSize, options) {
    const gap = Math.max(0, gridSize * options.minGapCells);
    const epsilon = options.epsilon;
    const sorted = items.slice().sort((a, b) => {
      if (Math.abs(a.top - b.top) > epsilon) return a.top - b.top;
      if (Math.abs(a.left - b.left) > epsilon) return a.left - b.left;
      if (a.depth !== b.depth) return a.depth - b.depth;
      return a.order - b.order;
    });

    for (let pass = 0; pass < options.maxPasses; pass += 1) {
      let changed = false;
      for (let i = 0; i < sorted.length; i += 1) {
        const current = sorted[i];
        let requiredTop = current.top + current.shift;

        for (let j = 0; j < i; j += 1) {
          const previous = sorted[j];
          if (!horizontallyIntersects(current, previous)) continue;
          const previousBottom = previous.top + previous.shift + previous.height;
          const requiredByPrevious = previousBottom + gap + (previous.bufferBottom || 0) + (current.bufferTop || 0);
          requiredTop = Math.max(requiredTop, current.isSnap ? snapUp(requiredByPrevious, gridSize) : requiredByPrevious);
        }

        const rawShift = Math.max(0, requiredTop - current.top);
        const nextShift = current.isSnap ? snapUp(rawShift, gridSize) : rawShift;
        if (Math.abs(nextShift - current.shift) > epsilon) {
          current.shift = nextShift;
          changed = true;
        }
      }
      if (!changed) break;
    }

    return sorted;
  }

  function applyShift(instance, item, gridSize, options) {
    const el = item.el;
    const record = item.record;
    const shift = Math.round(item.shift);
    const previousShift = record.lastShift || 0;
    const changed = Math.abs(previousShift - shift) > options.epsilon;

    if (!shift) {
      resetManagedElement(instance, el);
      return changed;
    }

    const gridShift = Math.round(shift / gridSize);
    record.mode = item.mode;
    record.lastShift = shift;
    el.setAttribute(options.managedAttr, 'true');
    el.style.setProperty('--smart-collision-y', shift + 'px');

    if (item.mode === 'margin') {
      const base = parseFloat(record.baseMarginTop) || 0;
      el.style.marginTop = (base + shift) + 'px';
    } else {
      el.style.translate = `0 ${shift}px`;
      if (record.baseTransform && !el.style.transform) el.style.transform = record.baseTransform;
    }

    if (typeof options.onMove === 'function') {
      options.onMove({ element: el, shift, gridShift, item, mode: item.mode });
    }

    return changed;
  }

  function extendGroupHeight(instance, group, solved, gridSize) {
    const maxBottom = solved.reduce((max, item) => Math.max(max, item.top + item.height + item.shift + (item.bufferBottom || 0)), 0);
    const groupRect = group.getBoundingClientRect();
    const required = Math.ceil((maxBottom + gridSize) / gridSize) * gridSize;
    const record = getRecord(instance, group);
    if (!record.baseMinHeight && group.style.minHeight) record.baseMinHeight = group.style.minHeight;
    const currentMin = parseFloat(record.baseMinHeight) || 0;
    if (required > groupRect.height && required > currentMin) {
      group.style.minHeight = required + 'px';
    }
  }

  function layoutGroup(instance, group) {
    const options = instance.options;
    const doc = getDoc(group);
    const win = getWin(doc);
    if (!readConfigBool(group, 'data-smart-collisions-enabled', options.enabled)) return [];
    if (!isVisible(group, win)) return [];

    const collisionMode = getCollisionMode(group, options);
    if (collisionMode === 'free' || collisionMode === 'swap') {
      const items = collectItems(group, options, win);
      resetStaleManaged(instance, items, group);
      items.forEach(el => resetManagedElement(instance, el));
      if (typeof options.onAfterLayout === 'function') {
        options.onAfterLayout({ group, items: [], gridSize: getGridSize(group, options), changed: false, mode: collisionMode });
      }
      return [];
    }

    const gridSize = getGridSize(group, options);
    const items = collectItems(group, options, win);
    if (typeof instance.observeNode === 'function') {
      items.forEach(instance.observeNode);
    }
    const rectItems = readItemRects(instance, group, items, gridSize);
    resetStaleManaged(instance, items, group);
    if (rectItems.length < 2) return rectItems;

    const solved = solveVertical(rectItems, gridSize, options);
    let changed = false;
    solved.forEach(item => {
      if (applyShift(instance, item, gridSize, options)) changed = true;
    });
    extendGroupHeight(instance, group, solved, gridSize);

    if (typeof options.onAfterLayout === 'function') {
      options.onAfterLayout({ group, items: solved, gridSize, changed });
    }

    return solved;
  }

  function layout(root, options) {
    const instance = getInstance(root, options);
    if (instance.layouting) return instance.lastLayout || [];
    instance.layouting = true;
    try {
      const groups = collectGroups(instance.root, instance.options);
      const all = [];
      groups.forEach(group => all.push(...layoutGroup(instance, group)));
      instance.lastLayout = all;
      return all;
    } finally {
      instance.layouting = false;
    }
  }

  function schedule(instance) {
    if (!instance || instance.destroyed || instance.raf) return;
    instance.raf = getWin(getDoc(instance.root)).requestAnimationFrame(() => {
      instance.raf = 0;
      layout(instance.root, instance.options);
    });
  }

  function getInstance(root, options) {
    const doc = getDoc(root || global.document);
    const key = root && (root.nodeType === 1 || root.nodeType === 9) ? root : doc;
    let instance = stateMap.get(key);
    if (!instance) {
      instance = {
        root: key,
        options: mergeOptions(options),
        records: new Map(),
        observers: [],
        raf: 0,
        destroyed: false,
        layouting: false,
        lastLayout: []
      };
      stateMap.set(key, instance);
    } else if (options) {
      instance.options = mergeOptions(Object.assign({}, instance.options, options));
    }
    return instance;
  }

  function observe(root, options) {
    const instance = getInstance(root || global.document, options);
    const doc = getDoc(instance.root);
    const win = getWin(doc);
    const scheduleThis = () => {
      if (instance.layouting) return;
      if (isParentGestureActive(win)) return; // Skip background schedules during active parent window drags
      schedule(instance);
    };

    if (instance.destroyed) instance.destroyed = false;

    if (!instance.observers.length) {
      if ('ResizeObserver' in win) {
        const resizeObserver = new win.ResizeObserver(entries => {
          // Break layout feedback loop on scrollHeight in mobile browsers:
          // Filter out body and documentElement resizes, only observe real groups.
          // We must still run in editorMode so expanding blocks (sliders, tab panels)
          // push neighbors visually inside the editor preview.
          let shouldTrigger = false;
          for (const entry of entries) {
            if (entry.target !== doc.documentElement && entry.target !== doc.body) {
              shouldTrigger = true;
              break;
            }
          }
          if (shouldTrigger) {
            scheduleThis();
          }
        });
        
        // Exclude root document and body elements from ResizeObserver observations 
        // to fully break infinite scrollHeight loops. Resizing is handled by window resize listener anyway.
        const observed = new WeakSet();
        const observeNode = node => {
          if (!node || observed.has(node)) return;
          observed.add(node);
          try { resizeObserver.observe(node); } catch (e) {}
        };
        collectGroups(instance.root, instance.options).forEach(group => {
          observeNode(group);
          // Also observe each collision item so expanding blocks (sliders, tab panels,
          // accordions) trigger re-layout even if the group itself has a fixed height.
          collectItems(group, instance.options, win).forEach(observeNode);
        });
        instance.resizeObserver = resizeObserver;
        instance.observeNode = observeNode;
        instance.observers.push({ disconnect: () => resizeObserver.disconnect() });
      }

      if ('MutationObserver' in win) {
        const mutationObserver = new win.MutationObserver(scheduleThis);
        mutationObserver.observe(doc.body || doc.documentElement, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: ['class', 'id', 'hidden', 'style', instance.options.disabledAttr, instance.options.disabledClassesAttr, instance.options.disabledIdsAttr, instance.options.collisionModeAttr, instance.options.bufferCellsAttr, instance.options.bufferSideAttr, 'data-smart-collisions-enabled']
        });
        instance.observers.push({ disconnect: () => mutationObserver.disconnect() });
      }

      win.addEventListener('resize', scheduleThis, { passive: true });
      win.addEventListener('load', scheduleThis, { passive: true });
      instance.observers.push({ disconnect: () => {
        win.removeEventListener('resize', scheduleThis);
        win.removeEventListener('load', scheduleThis);
      }});
    }

    schedule(instance);
    return instance;
  }

  function destroy(root) {
    const instance = getInstance(root || global.document);
    const win = getWin(getDoc(instance.root));
    if (instance.raf) win.cancelAnimationFrame(instance.raf);
    instance.raf = 0;
    instance.destroyed = true;
    instance.observers.forEach(observer => observer.disconnect && observer.disconnect());
    instance.observers = [];
    instance.records.forEach((record, el) => resetManagedElement(instance, el));
    instance.records.clear();
  }

  function disableElement(el) {
    if (el && el.setAttribute) el.setAttribute(DEFAULTS.disabledAttr, 'true');
  }

  function enableElement(el) {
    if (el && el.removeAttribute) el.removeAttribute(DEFAULTS.disabledAttr);
  }

  function setDisabledClasses(scope, classes) {
    const doc = getDoc(scope || global.document);
    const target = doc.body || doc.documentElement;
    target.setAttribute(DEFAULTS.disabledClassesAttr, toArray(classes).join(' '));
  }

  function setDisabledIds(scope, ids) {
    const doc = getDoc(scope || global.document);
    const target = doc.body || doc.documentElement;
    target.setAttribute(DEFAULTS.disabledIdsAttr, toArray(ids).join(' '));
  }

  function autoStart() {
    const doc = global.document;
    if (!doc || !doc.documentElement) return;
    const enabled = readConfigBool(doc, 'data-smart-collisions-enabled', true);
    if (!enabled) {
      markReady(doc);
      return;
    }

    const instance = observe(doc, {});
    layout(doc, instance.options);
    revealAfterInitialLayout(instance);
  }

  const api = {
    defaults: DEFAULTS,
    init: observe,
    observe,
    layout,
    layoutGroup,
    solveVertical,
    collectGroups,
    collectItems,
    resetManaged,
    schedule: root => schedule(getInstance(root || global.document)),
    destroy,
    disableElement,
    enableElement,
    setDisabledClasses,
    setDisabledIds,
    getGridSize
  };

  global.SmartCollisions = api;

  if (global.document) {
    if (global.document.readyState === 'loading') {
      global.document.addEventListener('DOMContentLoaded', autoStart, { once: true });
    } else {
      autoStart();
    }
  }
})(window);
