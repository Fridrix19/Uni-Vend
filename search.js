(function () {
  const SEARCH_ITEMS = [
    {
      page: 'Главная',
      section: 'Руководство по оформлению цифрового контента',
      url: 'index.html',
      keywords: 'главная руководство оформление цифрового контента унивенд поиск стартовая страница'
    },
    {
      page: 'Система контента',
      section: 'Задачи',
      url: 'system.html#block-1',
      keywords: 'система контента задачи цели проект бренд коммуникация'
    },
    {
      page: 'Система контента',
      section: 'Целевая аудитория',
      url: 'system.html#block-2',
      keywords: 'аудитория клиенты пользователи команда партнеры'
    },
    {
      page: 'Система контента',
      section: 'Принципы единства бренда',
      url: 'system.html#block-3',
      keywords: 'бренд единство принципы визуальный тон графика коммуникация'
    },
    {
      page: 'Типы контента',
      section: 'Текстовый контент',
      url: 'types.html#section-text-content',
      keywords: 'текст посты соцсети видео формула заголовки подписи'
    },
    {
      page: 'Типы контента',
      section: 'Графический контент',
      url: 'types.html#section-graphic-content',
      keywords: 'графический контент плашки стикеры фото визуал изображения'
    },
    {
      page: 'Типы контента',
      section: 'Видео-контент',
      url: 'types.html#section-video-content',
      keywords: 'видео контент вертикальный горизонтальный каналы rutube vk telegram'
    },
    {
      page: 'Типы контента',
      section: 'Музыкальный контент',
      url: 'types.html#section-music-content',
      keywords: 'музыка аудио треки звуки аудиоидентика фон'
    },
    {
      page: 'Типы контента',
      section: 'Связь форматов',
      url: 'types.html#section-formats-link',
      keywords: 'форматы связь контент каналы маршрут типы'
    },
    {
      page: 'Графический контент',
      section: 'Логотип',
      url: 'visual.html#section-logo',
      keywords: 'логотип logo знак фирменный знак унивенд графический контент'
    },
    {
      page: 'Графический контент',
      section: 'Цвета',
      url: 'visual.html#section-colors',
      keywords: 'цвета палитра blue orange ink beige white black фирменные цвета'
    },
    {
      page: 'Графический контент',
      section: 'Типографика',
      url: 'visual.html#section-typography',
      keywords: 'типографика шрифт gros ventre иерархия заголовок текст размеры'
    },
    {
      page: 'Графический контент',
      section: 'Графические элементы',
      url: 'visual.html#section-graphics',
      keywords: 'графические элементы стикеры плашки сетка карточки визуал'
    },
    {
      page: 'Графический контент',
      section: 'Фотоконтент',
      url: 'visual.html#section-photo',
      keywords: 'фото фотоконтент фотография галерея съемка изображения'
    },
    {
      page: 'Графический контент',
      section: '3Д-контент',
      url: 'visual.html#section-3d',
      keywords: '3д 3d контент модели визуализация технические требования'
    },
    {
      page: 'Видео-контент',
      section: 'Использование',
      url: 'video.html#block-1',
      keywords: 'видео использование vk telegram rutube shorts ролики'
    },
    {
      page: 'Видео-контент',
      section: 'Форматы видео',
      url: 'video.html#block-2',
      keywords: 'форматы видео 9:16 16:9 вертикальный горизонтальный разрешение длительность'
    },
    {
      page: 'Видео-контент',
      section: 'Структура',
      url: 'video.html#block-3',
      keywords: 'структура видео плашка логотип субтитры водяной знак'
    },
    {
      page: 'Видео-контент',
      section: 'Сценарий ролика',
      url: 'video.html#block-4',
      keywords: 'сценарий ролик тайминг звук аудио визуальный ряд'
    },
    {
      page: 'Видео-контент',
      section: 'Раскадровка',
      url: 'video.html#block-5',
      keywords: 'раскадровка кадры план композиция съемка'
    },
    {
      page: 'Видео-контент',
      section: 'Настройки',
      url: 'video.html#block-6',
      keywords: 'настройки камера монтаж свет звук fps разрешение'
    },
    {
      page: 'Видео-контент',
      section: 'Чек-лист перед публикацией',
      url: 'video.html#block-7',
      keywords: 'чеклист проверка публикация формат логотип плашка субтитры звук'
    },
    {
      page: 'Видео-контент',
      section: 'Ошибки и примеры',
      url: 'video.html#block-8',
      keywords: 'ошибки примеры нарушения слабая читаемость нет логотипа нет субтитров'
    },
    {
      page: 'Видео-контент',
      section: 'Реализованный контент',
      url: 'video.html#block-9',
      keywords: 'реализованный контент vimeo готовые видео примеры ролики'
    },
    {
      page: 'Видео-контент',
      section: 'Часто задаваемые вопросы',
      url: 'video.html#block-10',
      keywords: 'faq вопросы ответы видео плашка логотип субтитры'
    },
    {
      page: 'Музыкальный контент',
      section: 'Использование',
      url: 'music.html#block-1',
      keywords: 'музыка использование горизонтальные вертикальные ролики фон трек'
    },
    {
      page: 'Музыкальный контент',
      section: 'Форматы музыкального контента',
      url: 'music.html#block-2',
      keywords: 'форматы музыка звуки хуки джинглы asmr фоновые треки'
    },
    {
      page: 'Музыкальный контент',
      section: 'Роль музыки в коммуникации бренда',
      url: 'music.html#block-3',
      keywords: 'роль музыки коммуникация бренд эмоция ритм узнаваемость'
    },
    {
      page: 'Музыкальный контент',
      section: 'Аудиоидентика бренда',
      url: 'music.html#block-4',
      keywords: 'аудиоидентика fridrix стиль музыка бренда треки автор'
    },
    {
      page: 'Музыкальный контент',
      section: 'Лицензирование',
      url: 'music.html#block-5',
      keywords: 'лицензирование права авторские права музыка использование'
    },
    {
      page: 'Музыкальный контент',
      section: 'Часто задаваемые вопросы',
      url: 'music.html#block-6',
      keywords: 'faq вопросы ответы музыка лицензия fridrix'
    },
    {
      page: 'Универсальные правила',
      section: 'Брендовая целостность',
      url: 'rules.html#rules-block',
      keywords: 'правила брендовая целостность единый стиль бренд'
    },
    {
      page: 'Универсальные правила',
      section: 'Доступность и читаемость',
      url: 'rules.html#rules-block',
      keywords: 'доступность читаемость текст контраст размер'
    },
    {
      page: 'Универсальные правила',
      section: 'Адаптация под платформы',
      url: 'rules.html#rules-block',
      keywords: 'адаптация платформы формат соцсети мобильная версия'
    },
    {
      page: 'Универсальные правила',
      section: 'Авторские права и лицензии',
      url: 'rules.html#rules-block',
      keywords: 'авторские права лицензии музыка фото видео контент'
    },
    {
      page: 'Универсальные правила',
      section: 'Именование файлов',
      url: 'rules.html#rules-block',
      keywords: 'файлы именование хранение название архив'
    },
    {
      page: 'Универсальные правила',
      section: 'Проверка качества перед публикацией',
      url: 'rules.html#rules-block',
      keywords: 'проверка качество публикация чеклист ошибки'
    }
  ];

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/&nbsp;/g, ' ')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zа-я0-9\s:-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function scoreItem(item, query) {
    const hayTitle = normalize(item.page + ' ' + item.section);
    const hayAll = normalize(item.page + ' ' + item.section + ' ' + item.keywords);
    const words = query.split(' ').filter(Boolean);
    if (!words.length) return 0;

    let score = 0;
    if (hayTitle.includes(query)) score += 80;
    if (hayAll.includes(query)) score += 40;

    words.forEach(function (word) {
      if (hayTitle.includes(word)) score += 20;
      if (hayAll.includes(word)) score += 8;
      if (normalize(item.section).startsWith(word)) score += 12;
    });

    return score;
  }

  function search(query) {
    const normalized = normalize(query);
    if (normalized.length < 2) return [];

    return SEARCH_ITEMS
      .map(function (item) {
        return { item: item, score: scoreItem(item, normalized) };
      })
      .filter(function (entry) { return entry.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 8)
      .map(function (entry) { return entry.item; });
  }

  function buildResult(item) {
    const link = document.createElement('a');
    link.className = 'site-search__result';
    link.href = item.url;
    link.innerHTML = '<span class="site-search__path"></span><span class="site-search__title"></span>';
    link.querySelector('.site-search__path').textContent = item.page + ' /';
    link.querySelector('.site-search__title').textContent = item.section;
    return link;
  }

  function enhanceSearch(label, index) {
    const input = label.querySelector('input[type="search"]');
    if (!input || label.dataset.siteSearchReady === 'true') return;

    label.dataset.siteSearchReady = 'true';
    label.classList.add('site-search');
    label.setAttribute('role', 'combobox');
    label.setAttribute('aria-haspopup', 'listbox');
    label.setAttribute('aria-expanded', 'false');

    const results = document.createElement('div');
    results.className = 'site-search__results';
    results.id = 'site-search-results-' + index;
    results.setAttribute('role', 'listbox');
    results.hidden = true;
    document.body.appendChild(results);
    input.setAttribute('aria-controls', results.id);

    function placeResults() {
      const rect = label.getBoundingClientRect();
      const gap = 8;
      const isHome = Boolean(label.closest('.hero'));
      results.style.setProperty('--site-search-results-left', rect.left + 'px');
      results.style.setProperty('--site-search-results-width', rect.width + 'px');

      if (isHome && window.matchMedia('(min-width: 834px)').matches) {
        results.style.setProperty('--site-search-results-top', 'auto');
        results.style.setProperty('--site-search-results-bottom', Math.max(window.innerHeight - rect.top + gap, gap) + 'px');
      } else {
        results.style.setProperty('--site-search-results-top', Math.min(rect.bottom + gap, window.innerHeight - gap) + 'px');
        results.style.setProperty('--site-search-results-bottom', 'auto');
      }
    }

    function close() {
      results.hidden = true;
      results.innerHTML = '';
      label.setAttribute('aria-expanded', 'false');
    }

    function render() {
      const matches = search(input.value);
      results.innerHTML = '';
      placeResults();

      if (!matches.length) {
        if (normalize(input.value).length >= 2) {
          const empty = document.createElement('div');
          empty.className = 'site-search__empty';
          empty.textContent = 'Ничего не найдено';
          results.appendChild(empty);
          results.hidden = false;
          label.setAttribute('aria-expanded', 'true');
        } else {
          close();
        }
        return;
      }

      matches.forEach(function (item) {
        results.appendChild(buildResult(item));
      });
      results.hidden = false;
      label.setAttribute('aria-expanded', 'true');
    }

    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
      if (event.key === 'Enter') {
        const first = results.querySelector('a');
        if (first && !results.hidden) {
          event.preventDefault();
          window.location.href = first.href;
        }
      }
    });

    window.addEventListener('resize', function () {
      if (!results.hidden) placeResults();
    });

    window.addEventListener('scroll', function () {
      if (!results.hidden) placeResults();
    }, true);

    document.addEventListener('click', function (event) {
      if (!label.contains(event.target) && !results.contains(event.target)) close();
    });
  }

  document.querySelectorAll('.hero__search').forEach(enhanceSearch);
})();
