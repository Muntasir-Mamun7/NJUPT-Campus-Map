/**
 * NJUPT Campus Map — Main Application
 * Interactive campus map powered by Leaflet.js
 */

// ─── State ───────────────────────────────────────────────────────────────────
let map         = null;
let tileLayer   = null;
let imgOverlay  = null;
const markerMap = {};       // id → L.Marker
let selectedId  = null;
let isDark      = false;

const filter = {
  categories: new Set(Object.keys(CATEGORIES)),
  view:   'all',   // 'all' | 'new-student' | 'daily'
  search: '',
};

// ─── Tile-layer URLs ──────────────────────────────────────────────────────────
const TILES = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark:  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors ' +
  '&copy; <a href="https://carto.com">CARTO</a>';

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loading-text').textContent = t('loading');
  initMap();
  initUI();
  renderCategoryFilters();
  applyFilter();          // renders list + markers
  hideLoading();
});

// ─── Map ─────────────────────────────────────────────────────────────────────
function initMap() {
  map = L.map('map', {
    center: CAMPUS_CENTER,
    zoom: 16,
    minZoom: 14,
    maxZoom: 19,
    zoomControl: false,
  });

  L.control.zoom({ position: 'topleft' }).addTo(map);

  tileLayer = L.tileLayer(TILES.light, {
    attribution: TILE_ATTR,
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(map);

  // Semi-transparent campus map image overlay
  imgOverlay = L.imageOverlay(
    'https://github.com/user-attachments/assets/b20244dd-a1c8-471e-850b-84f66e5db6a9',
    CAMPUS_IMAGE_BOUNDS,
    { opacity: 0.82, interactive: false }
  ).addTo(map);

  // Soft pan boundary
  map.setMaxBounds(L.latLngBounds(
    [CAMPUS_BOUNDS[0][0] - 0.015, CAMPUS_BOUNDS[0][1] - 0.015],
    [CAMPUS_BOUNDS[1][0] + 0.015, CAMPUS_BOUNDS[1][1] + 0.015]
  ));

  // Build all markers (hidden by default; applyFilter shows the right ones)
  POIS.forEach(poi => createMarker(poi));
}

// ─── Markers ─────────────────────────────────────────────────────────────────
function createMarker(poi) {
  const color = CATEGORIES[poi.category]?.color || '#555';
  const icon  = CATEGORIES[poi.category]?.icon  || '📍';

  const divIcon = L.divIcon({
    html: `<div class="cm-pin" style="background:${color}" title="${escHtml(poi.name_en)}">
             <span class="cm-icon">${icon}</span>
           </div>`,
    className: '',
    iconSize:   [34, 42],
    iconAnchor: [17, 42],
    popupAnchor:[0, -46],
  });

  const marker = L.marker(poi.coords, { icon: divIcon })
    .on('click', () => selectPOI(poi.id));

  markerMap[poi.id] = { marker, visible: false };
}

function showMarker(id) {
  const entry = markerMap[id];
  if (entry && !entry.visible) {
    entry.marker.addTo(map);
    entry.visible = true;
  }
}

function hideMarker(id) {
  const entry = markerMap[id];
  if (entry && entry.visible) {
    map.removeLayer(entry.marker);
    entry.visible = false;
  }
}

// ─── Filter & Render ─────────────────────────────────────────────────────────
function applyFilter() {
  const lang   = getLang();
  const needle = filter.search.toLowerCase();

  const visible = POIS.filter(poi => {
    // Category gate
    if (!filter.categories.has(poi.category)) return false;

    // Preset view gate
    if (filter.view === 'new-student' && !NEW_STUDENT_IDS.includes(poi.id)) return false;
    if (filter.view === 'daily'       && !DAILY_LIFE_IDS.includes(poi.id))  return false;

    // Search gate
    if (needle) {
      const haystack = [
        poi.name_zh, poi.name_en,
        poi.desc_zh  || '', poi.desc_en  || '',
        ...(poi.tags_zh  || []),
        ...(poi.tags_en  || []),
      ].join(' ').toLowerCase();
      if (!haystack.includes(needle)) return false;
    }

    return true;
  });

  const visibleIds = new Set(visible.map(p => p.id));

  // Update markers
  POIS.forEach(poi => {
    visibleIds.has(poi.id) ? showMarker(poi.id) : hideMarker(poi.id);
  });

  // Update sidebar list
  renderPOIList(visible, lang);

  // Update count label
  const n = visible.length;
  document.getElementById('results-count').textContent =
    n === 1 ? t('results_single') : t('results_plural', { n });
}

// ─── POI List ─────────────────────────────────────────────────────────────────
function renderPOIList(pois, lang) {
  const list = document.getElementById('poi-list');
  list.innerHTML = '';

  if (!pois || pois.length === 0) {
    list.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <p class="no-results-text">${t('no_results')}</p>
        <p class="no-results-hint">${t('no_results_hint')}</p>
      </div>`;
    return;
  }

  pois.forEach(poi => {
    const cat   = CATEGORIES[poi.category] || {};
    const name  = lang === 'zh' ? poi.name_zh : poi.name_en;
    const sub   = lang === 'zh' ? poi.name_en : poi.name_zh;
    const label = lang === 'zh' ? cat.label_zh : cat.label_en;

    const card = document.createElement('div');
    card.className = 'poi-card' + (poi.id === selectedId ? ' selected' : '');
    card.dataset.id = poi.id;
    card.innerHTML = `
      <div class="poi-card-icon" style="background:${cat.color}22;color:${cat.color}">
        ${cat.icon || '📍'}
      </div>
      <div class="poi-card-info">
        <div class="poi-card-name">${escHtml(name)}</div>
        <div class="poi-card-name-sub">${escHtml(sub)}</div>
        <span class="poi-card-cat" style="background:${cat.color}">${escHtml(label)}</span>
      </div>`;
    card.addEventListener('click', () => selectPOI(poi.id));
    list.appendChild(card);
  });
}

// ─── Category Filters ────────────────────────────────────────────────────────
function renderCategoryFilters() {
  const lang = getLang();
  const grid = document.getElementById('category-filters');
  grid.innerHTML = '';

  Object.entries(CATEGORIES).forEach(([key, cat]) => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (filter.categories.has(key) ? ' active' : '');
    btn.dataset.cat = key;
    btn.style.setProperty('--cat-color', cat.color);
    if (filter.categories.has(key)) btn.style.background = cat.color;
    btn.innerHTML = `<span>${cat.icon}</span><span>${lang === 'zh' ? cat.label_zh : cat.label_en}</span>`;
    btn.addEventListener('click', () => toggleCategory(key, btn));
    grid.appendChild(btn);
  });
}

function toggleCategory(key, btn) {
  if (filter.categories.has(key)) {
    filter.categories.delete(key);
    btn.classList.remove('active');
    btn.style.background = '';
  } else {
    filter.categories.add(key);
    btn.classList.add('active');
    btn.style.background = CATEGORIES[key].color;
  }
  applyFilter();
}

// ─── POI Selection ────────────────────────────────────────────────────────────
function selectPOI(id) {
  const poi = POIS.find(p => p.id === id);
  if (!poi) return;

  // Deselect previous card
  if (selectedId) {
    const prev = document.querySelector(`.poi-card[data-id="${selectedId}"]`);
    if (prev) prev.classList.remove('selected');
  }
  selectedId = id;

  const card = document.querySelector(`.poi-card[data-id="${id}"]`);
  if (card) {
    card.classList.add('selected');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  map.flyTo(poi.coords, 18, { duration: 0.7 });
  showDetail(poi);

  // On mobile, close sidebar so the map is visible
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
  }
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function showDetail(poi) {
  const lang = getLang();
  const cat  = CATEGORIES[poi.category] || {};

  document.getElementById('detail-icon').textContent = cat.icon || '📍';
  document.getElementById('detail-name').textContent =
    lang === 'zh' ? poi.name_zh : poi.name_en;
  document.getElementById('detail-name-sub').textContent =
    lang === 'zh' ? poi.name_en : poi.name_zh;
  document.getElementById('detail-cat').textContent =
    lang === 'zh' ? cat.label_zh : cat.label_en;
  document.getElementById('detail-desc').textContent =
    lang === 'zh' ? poi.desc_zh : poi.desc_en;

  const tagsEl = document.getElementById('detail-tags');
  tagsEl.innerHTML = '';
  const tags = (lang === 'zh' ? poi.tags_zh : poi.tags_en) || [];
  tags.forEach(tag => {
    const span = document.createElement('span');
    span.className = 'poi-tag';
    span.textContent = tag;
    tagsEl.appendChild(span);
  });

  document.getElementById('poi-detail').classList.remove('hidden');
}

function closeDetail() {
  document.getElementById('poi-detail').classList.add('hidden');
  if (selectedId) {
    const card = document.querySelector(`.poi-card[data-id="${selectedId}"]`);
    if (card) card.classList.remove('selected');
    selectedId = null;
  }
}

// ─── UI Wiring ────────────────────────────────────────────────────────────────
function initUI() {
  // Language toggle
  document.getElementById('lang-toggle').addEventListener('click', () => {
    const next = getLang() === 'en' ? 'zh' : 'en';
    setLang(next);
    document.getElementById('lang-label').textContent = t('lang_switch');
    updateStaticText();
    renderCategoryFilters();
    applyFilter();
    if (selectedId) showDetail(POIS.find(p => p.id === selectedId));
  });

  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', () => {
    isDark = !isDark;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.getElementById('theme-icon').textContent = isDark ? '☀️' : '🌙';
    tileLayer.setUrl(isDark ? TILES.dark : TILES.light);
    imgOverlay.setOpacity(isDark ? 0.65 : 0.82);
  });

  // Mobile sidebar open/close
  document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
  document.getElementById('sidebar-close').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
  });

  // Detail panel close
  document.getElementById('detail-close').addEventListener('click', closeDetail);

  // Reset view
  document.getElementById('btn-reset').addEventListener('click', () => {
    map.flyTo(CAMPUS_CENTER, 16, { duration: 0.6 });
  });

  // Locate me
  document.getElementById('btn-locate').addEventListener('click', () => {
    map.locate({ setView: true, maxZoom: 17 });
  });
  map.on('locationerror', () => {
    map.flyTo(CAMPUS_CENTER, 16, { duration: 0.6 });
  });

  // Map overlay toggle (show/hide campus image)
  document.getElementById('btn-overlay').addEventListener('click', () => {
    const btn = document.getElementById('btn-overlay');
    if (map.hasLayer(imgOverlay)) {
      map.removeLayer(imgOverlay);
      btn.classList.add('active');
      btn.title = 'Show campus map overlay';
    } else {
      imgOverlay.addTo(map);
      btn.classList.remove('active');
      btn.title = 'Hide campus map overlay';
    }
  });

  // Quick views
  document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.quick-view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filter.view = btn.dataset.view;
      applyFilter();
    });
  });

  // Search
  const searchInput = document.getElementById('search-input');
  const clearBtn    = document.getElementById('search-clear');

  searchInput.placeholder = t('search_placeholder');
  searchInput.addEventListener('input', () => {
    filter.search = searchInput.value.trim();
    clearBtn.style.display = filter.search ? 'block' : 'none';
    applyFilter();
  });
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    filter.search = '';
    clearBtn.style.display = 'none';
    searchInput.focus();
    applyFilter();
  });
}

// Update elements that hold translated static text
function updateStaticText() {
  const lang = getLang();
  document.getElementById('app-title').textContent       = t('app_title');
  document.getElementById('app-subtitle').textContent    = t('app_subtitle');
  document.getElementById('search-input').placeholder    = t('search_placeholder');
  document.getElementById('label-quick-views').textContent = t('label_quick_views');
  document.getElementById('label-categories').textContent  = t('label_categories');
  document.getElementById('label-locations').textContent   = t('label_locations');
  document.getElementById('view-all').querySelector('span:last-child').textContent         = t('view_all');
  document.getElementById('view-new-student').querySelector('span:last-child').textContent = t('view_new_student');
  document.getElementById('view-daily').querySelector('span:last-child').textContent       = t('view_daily');
}

// ─── Loading Screen ───────────────────────────────────────────────────────────
function hideLoading() {
  const screen = document.getElementById('loading-screen');
  screen.classList.add('fade-out');
  screen.addEventListener('transitionend', () => screen.remove(), { once: true });
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
