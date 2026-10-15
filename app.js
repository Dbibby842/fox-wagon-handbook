// App logic for the Wagon Fitters Handbook mobile web reader.

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const state = {
  current: null,         // current section
  pdfs: {},              // PDF.js documents keyed by file
  pageRange: [1, 1],     // currently rendered page range
};

const HANDBOOK_FILE = 'assets/handbook.pdf';
const SSOW = window.SSOW_SECTIONS || [];
const ALL_SECTIONS = HANDBOOK_SECTIONS.concat(SSOW);

function fileOf(s)  { return HANDBOOK_FILE; }
function isSsow(s)  { return s.group === 'ssow'; }
function metaOf(s) {
  if (isSsow(s)) return `Section ${s.n} · Page ${s.page} · Safe System of Work`;
  return `Section ${s.n} · Page ${s.page}`;
}
function findSection(ref) {
  const r = (ref || '').toUpperCase();
  return ALL_SECTIONS.find(x => x.ra.toUpperCase() === r);
}

// ---------- RENDER LISTS ----------

function sectionRow(s, { drawer = false } = {}) {
  const li = document.createElement('li');
  li.innerHTML = `
    <span class="sec-num${isSsow(s) ? ' ssow' : ''}">${s.ra}</span>
    <span class="sec-text">
      <span class="sec-title">${escapeHtml(s.title)}</span>
      <span class="sec-meta">${metaOf(s)}</span>
    </span>
    ${drawer ? '' : `<svg class="sec-chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>`}
  `;
  li.addEventListener('click', () => openSection(s));
  return li;
}

function renderSectionList() {
  const list = $('#sectionList');
  list.innerHTML = '';
  HANDBOOK_SECTIONS.forEach(s => list.appendChild(sectionRow(s)));

  const ssowList = $('#ssowList');
  if (ssowList) {
    ssowList.innerHTML = '';
    SSOW.forEach(s => ssowList.appendChild(sectionRow(s)));
  }

  const drawer = $('#drawerList');
  drawer.innerHTML = '';
  const head = t => { const h = document.createElement('li'); h.className = 'drawer-group'; h.textContent = t; return h; };
  drawer.appendChild(head('Risk assessments'));
  HANDBOOK_SECTIONS.forEach(s => drawer.appendChild(sectionRow(s, { drawer: true })));
  if (SSOW.length) {
    drawer.appendChild(head('Safe Systems of Work'));
    SSOW.forEach(s => drawer.appendChild(sectionRow(s, { drawer: true })));
  }
}

// ---------- SEARCH ----------

function matchScore(s, q) {
  const hay = (s.title + ' ' + s.ra + ' ' + (isSsow(s) ? 'ssow safe system of work ' + (s.related || []).join(' ') + ' ' : '') + s.tags.join(' ')).toLowerCase();
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  let score = 0;
  for (const t of terms) {
    if (!hay.includes(t)) return 0;
    score += 1;
    if (s.title.toLowerCase().includes(t)) score += 2;
    if (s.ra.toLowerCase().includes(t))    score += 3;
  }
  return score;
}

function highlight(text, terms) {
  if (!terms.length) return escapeHtml(text);
  const re = new RegExp('(' + terms.map(escapeRegex).join('|') + ')', 'ig');
  return escapeHtml(text).replace(re, '<mark>$1</mark>');
}

function runSearch(q) {
  const list = $('#sectionList');
  const results = $('#searchResults');
  const none = $('#noResults');
  const browse = $$('.browse-only');
  if (!q.trim()) {
    list.hidden = false; results.hidden = true; none.hidden = true;
    browse.forEach(el => el.hidden = false);
    return;
  }
  browse.forEach(el => el.hidden = true);
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const scored = ALL_SECTIONS
    .map(s => ({ s, score: matchScore(s, q) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);

  list.hidden = true;
  results.innerHTML = '';
  if (!scored.length) { results.hidden = true; none.hidden = false; return; }
  none.hidden = true;
  results.hidden = false;

  scored.forEach(({ s }) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="sec-num${isSsow(s) ? ' ssow' : ''}">${s.ra}</span>
      <span class="sec-text">
        <span class="sec-title">${highlight(s.title, terms)}</span>
        <span class="sec-meta">${metaOf(s)}</span>
      </span>
      <svg class="sec-chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>
    `;
    li.addEventListener('click', () => openSection(s));
    results.appendChild(li);
  });
}

// ---------- DRAWER ----------

function openDrawer() {
  $('#drawer').classList.add('open');
  $('#drawer').setAttribute('aria-hidden', 'false');
  $('#scrim').hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  $('#drawer').classList.remove('open');
  $('#drawer').setAttribute('aria-hidden', 'true');
  $('#scrim').hidden = true;
  document.body.style.overflow = '';
}

// ---------- READER ----------

function openSection(section) {
  state.current = section;
  closeDrawer();
  $('#home').classList.remove('active');
  $('#reader').classList.add('active');
  $('#readerTitle').textContent = `${section.ra} · ${section.title}`;
  const endPage = sectionEndPage(section);
  const total = HANDBOOK_TOTAL_PAGES;
  $('#readerPage').textContent = `p.${section.page}${endPage > section.page ? '–' + endPage : ''}`;
  $('#pageIndicator').textContent = `Page ${section.page}${endPage > section.page ? '–' + endPage : ''} of ${total}`;
  renderRelated(section);
  $$('.reader-download').forEach(a => {
    a.href = section.download || HANDBOOK_FILE;
    a.setAttribute('download', isSsow(section) ? `${section.ra}.pdf` : '');
    a.textContent = isSsow(section) ? `Download ${section.ra}` : 'Download PDF';
  });
  window.scrollTo(0, 0);
  renderReader(section);
  history.replaceState({ section: section.ra }, '', `#${section.ra}`);
}

function renderRelated(section) {
  const box = $('#readerRelated');
  if (!box) return;
  const refs = isSsow(section)
    ? (section.related || [])
    : SSOW.filter(x => (x.related || []).includes(section.ra)).map(x => x.ra);
  const items = refs.map(findSection).filter(Boolean);
  if (!items.length) { box.hidden = true; box.innerHTML = ''; return; }
  box.hidden = false;
  box.innerHTML = `<span class="related-label">${isSsow(section) ? 'Related risk assessments' : 'Related safe systems of work'}</span>`;
  items.forEach(x => {
    const b = document.createElement('button');
    b.className = 'related-chip';
    b.type = 'button';
    b.textContent = `${x.ra} · ${x.title}`;
    b.addEventListener('click', () => openSection(x));
    box.appendChild(b);
  });
}

function sectionEndPage(s) {
  if (isSsow(s)) return s.page + s.pages - 1;
  const i = HANDBOOK_SECTIONS.indexOf(s);
  if (i === -1) return s.page;
  const next = HANDBOOK_SECTIONS[i + 1] || SSOW[0];
  if (!next) return HANDBOOK_TOTAL_PAGES;
  return Math.max(s.page, next.page - 1);
}

function backToHome() {
  $('#reader').classList.remove('active');
  $('#home').classList.add('active');
  $('#pdfViewer').innerHTML = '';
  state.current = null;
  window.scrollTo(0, 0);
  history.replaceState({}, '', '#');
}

// PDF rendering via pdf.js
async function renderReader(section) {
  const viewer = $('#pdfViewer');
  viewer.innerHTML = '<div class="pdf-loading">Loading pages…</div>';

  try {
    const pdf = await loadPdf(fileOf(section));
    viewer.innerHTML = '';

    const start = section.page;
    const end = sectionEndPage(section);
    state.pageRange = [start, end];

    // Render each page in this section
    for (let p = start; p <= end; p++) {
      const canvas = document.createElement('canvas');
      viewer.appendChild(canvas);
      await renderPage(pdf, p, canvas);
    }
  } catch (err) {
    viewer.innerHTML = `
      <div class="pdf-loading">
        Couldn't load the PDF in-app.<br/>
        <a class="btn primary" style="margin-top:12px;display:inline-flex" href="${fileOf(section)}#page=${section.page}" target="_blank">Open page ${section.page}</a>
      </div>`;
    console.error(err);
  }
}

let pdfJsReady = null;
function ensurePdfJs() {
  if (pdfJsReady) return pdfJsReady;
  pdfJsReady = new Promise((resolve, reject) => {
    if (window['pdfjsLib']) { configurePdfJs(); return resolve(); }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = () => { configurePdfJs(); resolve(); };
    s.onerror = () => reject(new Error('Failed to load PDF.js'));
    document.head.appendChild(s);
  });
  return pdfJsReady;
}
function configurePdfJs() {
  if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
}

function loadPdf(file = HANDBOOK_FILE) {
  if (!state.pdfs[file]) {
    state.pdfs[file] = (async () => {
      await ensurePdfJs();
      return window.pdfjsLib.getDocument(file).promise;
    })().catch(err => { delete state.pdfs[file]; throw err; });
  }
  return state.pdfs[file];
}

async function renderPage(pdf, pageNum, canvas) {
  const page = await pdf.getPage(pageNum);
  const ctx = canvas.getContext('2d');
  const viewerWidth = Math.min(window.innerWidth, 720) - 20; // match padding
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = viewerWidth / baseViewport.width;
  const dpr = window.devicePixelRatio || 1;
  const viewport = page.getViewport({ scale: scale * dpr });

  canvas.width = viewport.width;
  canvas.height = viewport.height;
  canvas.style.width = viewerWidth + 'px';
  canvas.style.height = (baseViewport.height * scale) + 'px';

  await page.render({ canvasContext: ctx, viewport }).promise;
}

// ---------- NAV BETWEEN SECTIONS ----------

function prevSection() {
  if (!state.current) return;
  const i = ALL_SECTIONS.indexOf(state.current);
  if (i > 0) openSection(ALL_SECTIONS[i - 1]);
}
function nextSection() {
  if (!state.current) return;
  const i = ALL_SECTIONS.indexOf(state.current);
  if (i >= 0 && i < ALL_SECTIONS.length - 1) openSection(ALL_SECTIONS[i + 1]);
}

// ---------- UTILS ----------
function escapeHtml(s) { return (s ?? '').toString().replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// ---------- INIT ----------

document.addEventListener('DOMContentLoaded', () => {
  renderSectionList();

  $('#menuBtn').addEventListener('click', openDrawer);
  $('#closeDrawer').addEventListener('click', closeDrawer);
  $('#scrim').addEventListener('click', closeDrawer);
  $('[data-open-toc]').addEventListener('click', openDrawer);

  $('#backBtn').addEventListener('click', backToHome);
  $('#prevPage').addEventListener('click', prevSection);
  $('#nextPage').addEventListener('click', nextSection);
  $('#openNative').addEventListener('click', () => {
    if (state.current) window.open(`${fileOf(state.current)}#page=${state.current.page}`, '_blank');
  });

  // Quick cards
  $$('.quick-card').forEach(el => {
    el.addEventListener('click', () => {
      if (el.dataset.scroll) {
        const t = document.getElementById(el.dataset.scroll);
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      const s = findSection(el.dataset.ra);
      if (s) openSection(s);
    });
  });

  // Search
  const input = $('#searchInput');
  const clear = $('#clearSearch');
  input.addEventListener('input', () => {
    clear.hidden = !input.value;
    runSearch(input.value);
  });
  clear.addEventListener('click', () => { input.value=''; clear.hidden=true; runSearch(''); input.focus(); });

  // Deep link via hash, e.g. #WF016
  const hash = decodeURIComponent((location.hash || '').replace('#', ''));
  if (hash) {
    const s = findSection(hash);
    if (s) openSection(s);
  }

  // Back-button behaviour on mobile
  window.addEventListener('popstate', () => {
    if ($('#reader').classList.contains('active')) backToHome();
  });
});
