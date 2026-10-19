/* ==========================================================================
   UI kit — shell, router, forms, modal, drawer, palette, menus, toasts, waves
   ========================================================================== */

const UI = LS.get('wav_ui', {}) || {};
function uiState(view, defaults) { UI[view] = { ...defaults, ...(UI[view] || {}) }; return UI[view]; }
const saveUI = () => LS.set('wav_ui', UI);
const ACT = {};      // data-act handlers
const VIEWS = {};    // route → { title, render(), mount?() }
let ROUTE = { view: 'dashboard', id: '' };

/* ---------- Navigation ---------- */
const NAV = [
  { g: 'nav.overview', items: [{ r: 'dashboard', i: 'dash' }] },
  { g: 'nav.sales', items: [{ r: 'leads', i: 'leads', count: () => { const n = DB.leads.filter((l) => OPEN_STAGES.includes(l.stage) && l.followUp && l.followUp <= today()).length; return n ? { n, hot: true } : { n: openLeads().length }; } }, { r: 'clients', i: 'clients' }] },
  { g: 'nav.delivery', items: [{ r: 'projects', i: 'projects' }, { r: 'tasks', i: 'tasks', count: () => { const mine = DB.tasks.filter((tk) => tk.assignee === me().id && tk.status !== 'done'); return mine.length ? { n: mine.length, hot: mine.some(isLateTask) } : null; } }, { r: 'calendar', i: 'cal' }] },
  { g: 'nav.money', perm: () => can.finance(), items: [{ r: 'invoices', i: 'invoice', count: () => { const n = DB.invoices.filter((i) => invStatus(i) === 'overdue').length; return n ? { n, hot: true } : null; } }] },
  { g: 'nav.agency', items: [{ r: 'team', i: 'team' }, { r: 'reports', i: 'report', perm: () => can.finance() }, { r: 'settings', i: 'settings' }] },
];
const navAllowed = (item, group) => (!group?.perm || group.perm()) && (!item.perm || item.perm());
const navLabel = (r) => t('nav.' + r);

const MARK = `<svg class="brand__mark" viewBox="0 0 124 124" aria-hidden="true"><path d="M10 36 C 20 36 25 88 39 88 C 51 88 53 56 62 56 C 71 56 73 88 85 88 C 100 88 106 46 116 32" fill="none" stroke="url(#gWave)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const brandHTML = () => `<a class="brand" href="#/dashboard">${MARK}<span><span class="brand__word">W<i>Λ</i>V</span><span class="brand__tag">${t('app.tag')}</span></span></a>`;

function renderSide() {
  const u = me();
  $('#side').innerHTML = `
    ${brandHTML()}
    ${NAV.map((g) => {
      const items = g.items.filter((it) => navAllowed(it, g));
      if (!items.length) return '';
      return `<div class="nav-group">${t(g.g)}</div>` + items.map((it) => {
        const c = it.count ? it.count() : null;
        return `<a class="nav-item ${ROUTE.view === it.r ? 'is-active' : ''}" href="#/${it.r}">${icon(it.i)}<span>${navLabel(it.r)}</span>${c && c.n ? `<span class="count ${c.hot ? 'is-hot' : ''}">${c.n}</span>` : ''}</a>`;
      }).join('');
    }).join('')}
    <div class="side__foot">
      <div class="sync-pill" id="syncPill"></div>
      <div class="me">${avatar(u)}<div><b>${esc(u.name)}</b><small>${esc(u.title || label('role', u.role))}</small></div>
        <button class="icon-btn icon-btn--sm" data-act="logout" title="${t('act.logout')}">${icon('logout', 'flip')}</button></div>
    </div>`;
  renderSyncPill();
}
function renderSyncPill() {
  const el = $('#syncPill');
  if (!el) return;
  const s = Sync.state;
  const txt = s === 'demo' ? t('sync.demo') : s === 'syncing' ? t('sync.syncing') : s === 'offline' ? t('sync.offline', { n: Sync.outbox.length }) : s === 'error' ? t('sync.error') : t('sync.ok');
  el.dataset.state = s;
  el.innerHTML = `<i></i><span>${txt}</span>`;
}
function renderTop() {
  const v = VIEWS[ROUTE.view];
  const notes = focusItems();
  $('#top').innerHTML = `
    <div class="top__title"><h1>${esc(v.title())}</h1><small>${t('sub.' + ROUTE.view)}</small></div>
    <div class="top__actions">
      <button class="kbd-search" data-act="palette">${icon('search')}<span>${t('top.search')}</span><kbd>Ctrl K</kbd></button>
      <button class="icon-btn" data-act="notifications" title="${t('top.notifications')}">${icon('bell')}${notes.length ? `<span class="dot">${notes.length > 99 ? '99+' : notes.length}</span>` : ''}</button>
      <button class="lang-btn" data-act="lang" title="Language">${LANG === 'ar' ? 'EN' : 'ع'}</button>
      <button class="btn btn--sm" data-act="quickNew">${icon('plus')}<span>${t('top.new')}</span></button>
    </div>`;
}
function renderMnav() {
  const items = ['dashboard', 'leads', 'tasks', 'calendar'];
  $('#mnav').innerHTML = items.map((r) => `<a href="#/${r}" class="${ROUTE.view === r ? 'is-active' : ''}">${icon(NAV.flatMap((g) => g.items).find((i) => i.r === r).i)}<span>${r === 'calendar' ? t('nav.calendarShort') : r === 'leads' ? t('nav.leadsShort') : navLabel(r)}</span></a>`).join('')
    + `<button data-act="sheet">${icon('more')}<span>${t('nav.more')}</span></button>`;
}
ACT.sheet = () => {
  const all = NAV.flatMap((g) => g.items.filter((it) => navAllowed(it, g)));
  $('#sheet').innerHTML = `<div class="sheet__grab"></div><div class="sheet__grid">${all.map((it) => `<a href="#/${it.r}" class="${ROUTE.view === it.r ? 'is-active' : ''}">${icon(it.i)}<span>${it.r === 'calendar' ? t('nav.calendarShort') : navLabel(it.r)}</span></a>`).join('')}
    <button data-act="lang">${icon('globe')}<span>${LANG === 'ar' ? 'English' : 'العربية'}</span></button>
    <button data-act="logout">${icon('logout', 'flip')}<span>${t('act.logout')}</span></button></div>`;
  $('#sheet').classList.add('is-open');
  showOverlay();
};

/* ---------- Router ---------- */
function parseRoute() {
  const [view, id] = location.hash.replace(/^#\/?/, '').split('/');
  return { view: VIEWS[view] ? view : 'dashboard', id: id ? decodeURIComponent(id) : '' };
}
function go(view, id) { location.hash = `#/${view}${id ? '/' + encodeURIComponent(id) : ''}`; }
function onRoute() {
  const r = parseRoute();
  const v = VIEWS[r.view];
  if (v.perm && !v.perm()) { toast(t('msg.noAccess'), { err: true }); go('dashboard'); return; }
  const changedView = r.view !== ROUTE.view;
  ROUTE = r;
  closeSheet();
  renderShell();
  renderView(changedView);
  if (r.id && v.openId) v.openId(r.id);
  if (changedView) window.scrollTo(0, 0);
}
function renderShell() { renderSide(); renderTop(); renderMnav(); }
function renderView(animate = false) {
  const view = $('#view');
  const active = document.activeElement;
  const keep = active && active.dataset && active.dataset.filter ? { f: active.dataset.filter, s: active.selectionStart } : null;
  const scrolls = $$('[data-keep-scroll]', view).map((el) => [el.dataset.keepScroll, el.scrollLeft, el.scrollTop]);
  if (!animate) view.style.animation = 'none';
  view.innerHTML = VIEWS[ROUTE.view].render();
  if (!animate) requestAnimationFrame(() => (view.style.animation = ''));
  VIEWS[ROUTE.view].mount?.(view);
  scrolls.forEach(([k, l, tp]) => { const el = $(`[data-keep-scroll="${k}"]`, view); if (el) { el.scrollLeft = l; el.scrollTop = tp; } });
  if (keep) { const el = $(`[data-filter="${keep.f}"]`, view); if (el) { el.focus(); try { el.setSelectionRange(keep.s, keep.s); } catch (e) {} } }
}
function refreshAll() {
  if ($('#app').hidden) return;
  renderShell();
  renderView();
  if (DRAWER.render) DRAWER.refresh();
}
listeners.add(refreshAll);

/* ---------- Filters (data-filter="view.key") ---------- */
let filterT = 0;
function onFilter(el) {
  const [view, key] = el.dataset.filter.split('.');
  const st = UI[view] || (UI[view] = {});
  st[key] = el.type === 'checkbox' ? el.checked : el.value;
  saveUI();
  clearTimeout(filterT);
  filterT = setTimeout(() => renderView(), el.tagName === 'INPUT' && el.type === 'search' ? 140 : 0);
}
ACT.set = (el) => { // data-act="set" data-set="view.key" data-val="x"
  const [view, key] = el.dataset.set.split('.');
  (UI[view] || (UI[view] = {}))[key] = el.dataset.val;
  saveUI();
  renderView();
};

/* ---------- Toasts ---------- */
function toast(msg, { err = false, undo = null, ms = 3800 } = {}) {
  const el = document.createElement('div');
  el.className = 'toast' + (err ? ' is-err' : '');
  el.innerHTML = `<i></i><span>${esc(msg)}</span>${undo ? `<button>${t('act.undo')}</button>` : ''}`;
  if (undo) el.querySelector('button').onclick = () => { undo(); el.remove(); };
  $('#toasts').appendChild(el);
  setTimeout(() => { el.classList.add('is-out'); setTimeout(() => el.remove(), 320); }, ms);
}

/* ---------- Overlay / modal / drawer ---------- */
function showOverlay() { $('#overlay').classList.add('is-open'); }
function hideOverlayIfIdle() {
  if (!$('#modal').classList.contains('is-open') && !$('#drawer').classList.contains('is-open') && !$('#sheet').classList.contains('is-open')) $('#overlay').classList.remove('is-open');
}
function closeSheet() { $('#sheet').classList.remove('is-open'); hideOverlayIfIdle(); }
$('#overlay').addEventListener('click', () => {
  if ($('#modal').classList.contains('is-open')) closeModal();
  else if ($('#sheet').classList.contains('is-open')) closeSheet();
  else closeDrawer();
});

let MODAL_RESOLVE = null;
function openModal({ title, body, foot = '', width = 640, onMount }) {
  const m = $('#modal');
  m.innerHTML = `<div class="modal__box" role="dialog" aria-modal="true" style="--w:${width}px">
    <div class="modal__head"><h2>${title}</h2><button class="icon-btn icon-btn--sm" data-act="closeModal" aria-label="${t('act.close')}">${icon('close')}</button></div>
    <div class="modal__body">${body}</div>${foot ? `<div class="modal__foot">${foot}</div>` : ''}</div>`;
  m.classList.add('is-open');
  m.setAttribute('aria-hidden', 'false');
  showOverlay();
  onMount?.(m);
  setTimeout(() => { const f = $('input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea, select', m); f?.focus(); }, 60);
  return m;
}
function closeModal(val) {
  const m = $('#modal');
  m.classList.remove('is-open');
  m.setAttribute('aria-hidden', 'true');
  hideOverlayIfIdle();
  if (MODAL_RESOLVE) { const r = MODAL_RESOLVE; MODAL_RESOLVE = null; r(val); }
}
ACT.closeModal = () => closeModal(false);
function confirmBox(text, { danger = true, ok = t('act.confirm') } = {}) {
  return new Promise((resolve) => {
    openModal({ title: text, width: 440, body: '', foot: `<button class="btn btn--ghost" data-act="closeModal">${t('act.cancel')}</button><button class="btn ${danger ? 'btn--danger' : ''}" data-act="confirmYes">${ok}</button>` });
    MODAL_RESOLVE = resolve;
  });
}
ACT.confirmYes = () => closeModal(true);

const DRAWER = { render: null, refresh() { if (!this.render) return; const html = this.render(); if (html === null) { closeDrawer(); return; } const body = $('.drawer__body', $('#drawer')); const st = body ? body.scrollTop : 0; $('#drawer').innerHTML = html; const nb = $('.drawer__body', $('#drawer')); if (nb) nb.scrollTop = st; this.mount?.($('#drawer')); } };
function openDrawer(render, mount) {
  DRAWER.render = render;
  DRAWER.mount = mount;
  const d = $('#drawer');
  d.innerHTML = render();
  mount?.(d);
  d.classList.add('is-open');
  d.setAttribute('aria-hidden', 'false');
  showOverlay();
}
function closeDrawer() {
  DRAWER.render = null;
  const d = $('#drawer');
  d.classList.remove('is-open');
  d.setAttribute('aria-hidden', 'true');
  hideOverlayIfIdle();
  if (ROUTE.id) history.replaceState(null, '', `#/${ROUTE.view}`), (ROUTE.id = '');
}
ACT.closeDrawer = () => closeDrawer();
const drawerHead = (eyebrow, title, extra = '') => `<div class="drawer__head"><div class="drawer__eyebrow">${eyebrow}</div><h2>${title}</h2>${extra}<button class="icon-btn icon-btn--sm close" data-act="closeDrawer" aria-label="${t('act.close')}">${icon('close')}</button></div>`;
const kv = (pairs) => `<div class="kv">${pairs.filter(Boolean).map(([k, v]) => `<div><small>${k}</small><b>${v || '—'}</b></div>`).join('')}</div>`;

/* ---------- Menus ---------- */
function openMenu(anchor, html) {
  closeMenu();
  const m = document.createElement('div');
  m.className = 'menu';
  m.id = 'menu';
  m.innerHTML = html;
  document.body.appendChild(m);
  const r = anchor.getBoundingClientRect();
  const w = m.offsetWidth, h = m.offsetHeight;
  let left = document.documentElement.dir === 'rtl' ? r.left : r.right - w;
  left = clamp(left, 8, innerWidth - w - 8);
  let top = r.bottom + 8;
  if (top + h > innerHeight - 8) top = Math.max(8, r.top - h - 8);
  m.style.left = left + 'px';
  m.style.top = top + 'px';
  setTimeout(() => document.addEventListener('click', closeMenuOutside, { once: true }), 0);
}
function closeMenuOutside(e) { if (!e.target.closest('#menu')) closeMenu(); else document.addEventListener('click', closeMenuOutside, { once: true }); }
function closeMenu() { $('#menu')?.remove(); }

ACT.quickNew = (el) => {
  const items = [['leads', 'leads', 'new.lead'], ['clients', 'clients', 'new.client'], ['projects', 'projects', 'new.project'], ['tasks', 'tasks', 'new.task'], ['content', 'cal', 'new.content']];
  if (can.finance()) items.push(['invoices', 'invoice', 'new.invoice']);
  openMenu(el, `<div class="menu__title">${t('top.new')}</div>` + items.map(([col, i, k]) => `<button data-act="newRecord" data-col="${col}">${icon(i)}${t(k)}</button>`).join(''));
};
ACT.notifications = (el) => {
  const items = focusItems().slice(0, 12);
  openMenu(el, `<div class="menu__title">${t('top.notifications')}</div>` + (items.length ? items.map((it) => `<button data-act="openFocus" data-kind="${it.kind}" data-id="${it.id}">${icon(it.icon)}<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(it.text)}</span>${dueTag(it.date)}</button>`).join('') : `<div class="empty" style="padding:18px">${t('top.nothing')}</div>`));
  $('#menu').style.width = 'min(380px, calc(100vw - 16px))';
};
ACT.openFocus = (el) => { closeMenu(); openEntity(el.dataset.kind, el.dataset.id); };
ACT.lang = () => { setLang(LANG === 'ar' ? 'en' : 'ar'); closeSheet(); closeMenu(); if (!$('#app').hidden) { refreshAll(); } else renderLogin(); };

/* ---------- Forms ---------- */
const optList = (values, labeler, cur, empty) => (empty !== undefined ? `<option value="">${empty}</option>` : '') + values.map((v) => `<option value="${esc(v)}" ${String(cur ?? '') === String(v) ? 'selected' : ''}>${esc(labeler(v))}</option>`).join('');
const userOptions = (cur, empty = '—') => optList(DB.users.filter((u) => u.active !== false || u.id === cur).map((u) => u.id), (id) => userById(id)?.name || id, cur, empty);
const clientOptions = (cur, empty = '—') => optList([...DB.clients].sort((a, b) => a.name.localeCompare(b.name)).map((c) => c.id), (id) => clientById(id)?.name || id, cur, empty);
const projectOptions = (cur, empty = '—') => optList(DB.projects.filter((p) => p.status !== 'delivered' || p.id === cur).map((p) => p.id), (id) => { const p = projectById(id); return `${p.name} · ${clientById(p.clientId)?.name || ''}`; }, cur, empty);

function fieldHTML(f, rec) {
  const v = rec[f.k];
  const lab = `<span>${t(f.label || 'f.' + f.k)}${f.req ? ' <b>*</b>' : ''}</span>`;
  const name = `name="${f.k}" ${f.req ? 'required' : ''}`;
  let ctrl;
  switch (f.type) {
    case 'enum': ctrl = `<select ${name}>${optList(ENUM[f.e], (x) => label(f.e, x), v, f.req ? undefined : '—')}</select>`; break;
    case 'user': ctrl = `<select ${name}>${userOptions(v)}</select>`; break;
    case 'client': ctrl = `<select ${name}>${clientOptions(v, f.req ? '' : '—')}</select>`; break;
    case 'project': ctrl = `<select ${name}>${projectOptions(v)}</select>`; break;
    case 'textarea': ctrl = `<textarea ${name} rows="3">${esc(v)}</textarea>`; break;
    case 'multi': ctrl = `<div class="checks">${ENUM[f.e].map((x) => `<label class="check" style="--c:${COLORS[f.e]?.[x] || 'var(--violet-2)'}"><input type="checkbox" name="${f.k}" value="${x}" ${(v || []).includes(x) ? 'checked' : ''}/><span>${esc(label(f.e, x))}</span></label>`).join('')}</div>`; break;
    case 'color': ctrl = `<div class="swatches">${BRAND_COLORS.map((c) => `<label style="--c:${c}"><input type="radio" name="${f.k}" value="${c}" ${(v || BRAND_COLORS[0]) === c ? 'checked' : ''}/><i></i></label>`).join('')}</div>`; break;
    case 'bool': ctrl = `<label class="switch"><input type="checkbox" name="${f.k}" ${v !== false ? 'checked' : ''}/><i></i></label>`; break;
    case 'password': ctrl = `<input type="password" ${name} autocomplete="new-password" placeholder="${f.hint ? esc(t(f.hint)) : ''}" />`; break;
    default: ctrl = `<input type="${f.type || 'text'}" ${name} value="${esc(v)}" ${f.type === 'number' ? 'step="any" min="0" inputmode="decimal"' : ''} ${f.type === 'tel' ? 'dir="ltr"' : ''} />`;
  }
  return `<label class="field ${f.full || f.type === 'multi' || f.type === 'textarea' ? 'field--full' : ''}" data-k="${f.k}">${lab}${ctrl}</label>`;
}
const formHTML = (schema, rec) => `<div class="form-grid">${schema.map((f) => fieldHTML(f, rec)).join('')}</div>`;
function readForm(root, schema) {
  const out = {};
  let ok = true;
  schema.forEach((f) => {
    const field = $(`.field[data-k="${f.k}"]`, root);
    field?.classList.remove('is-invalid');
    if (f.type === 'multi') out[f.k] = $$(`input[name="${f.k}"]:checked`, root).map((i) => i.value);
    else if (f.type === 'bool') out[f.k] = !!$(`input[name="${f.k}"]`, root)?.checked;
    else if (f.type === 'color') out[f.k] = $(`input[name="${f.k}"]:checked`, root)?.value || BRAND_COLORS[0];
    else {
      const el = $(`[name="${f.k}"]`, root);
      let v = el ? el.value.trim() : '';
      if (f.type === 'number') v = v === '' ? 0 : Math.max(0, Number(v) || 0);
      out[f.k] = v;
    }
    if (f.req && (out[f.k] === '' || out[f.k] === undefined)) { ok = false; field?.classList.add('is-invalid'); }
  });
  return ok ? out : null;
}

/* ---------- Command palette ---------- */
const PAL = { items: [], i: 0 };
ACT.palette = () => openPalette();
function openPalette() {
  const p = $('#palette');
  p.innerHTML = `<div class="palette__box" role="dialog" aria-modal="true"><div class="palette__in">${icon('search')}<input id="palQ" placeholder="${t('top.search')}" autocomplete="off" /><kbd class="dim" style="font-size:.7rem">Esc</kbd></div><ul class="palette__list" id="palList"></ul>
    <div class="palette__hint"><span><kbd>↑↓</kbd>${t('pal.hint.move')}</span><span><kbd>Enter</kbd>${t('pal.hint.open')}</span><span><kbd>Esc</kbd>${t('pal.hint.close')}</span></div></div>`;
  p.classList.add('is-open');
  p.setAttribute('aria-hidden', 'false');
  const q = $('#palQ');
  q.addEventListener('input', () => { PAL.i = 0; renderPalette(q.value); });
  q.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { PAL.i = Math.min(PAL.items.length - 1, PAL.i + 1); paintPal(); e.preventDefault(); }
    if (e.key === 'ArrowUp') { PAL.i = Math.max(0, PAL.i - 1); paintPal(); e.preventDefault(); }
    if (e.key === 'Enter') { PAL.items[PAL.i]?.run(); e.preventDefault(); }
  });
  renderPalette('');
  setTimeout(() => q.focus(), 30);
}
function closePalette() { const p = $('#palette'); p.classList.remove('is-open'); p.setAttribute('aria-hidden', 'true'); }
$('#palette').addEventListener('mousedown', (e) => { if (e.target.id === 'palette') closePalette(); });
function renderPalette(q) {
  const s = q.trim().toLowerCase();
  const match = (...f) => !s || f.some((x) => String(x || '').toLowerCase().includes(s));
  const groups = [];
  const jumps = NAV.flatMap((g) => g.items.filter((it) => navAllowed(it, g))).filter((it) => match(navLabel(it.r), it.r)).map((it) => ({ i: it.i, label: navLabel(it.r), run: () => { closePalette(); go(it.r); } }));
  const creates = [['leads', 'leads', 'new.lead'], ['clients', 'clients', 'new.client'], ['projects', 'projects', 'new.project'], ['tasks', 'tasks', 'new.task'], ['content', 'cal', 'new.content']].concat(can.finance() ? [['invoices', 'invoice', 'new.invoice']] : [])
    .filter(([, , k]) => match(t(k))).map(([col, i, k]) => ({ i: 'plus', label: t(k), run: () => { closePalette(); editRecord(col); } }));
  if (s) {
    const res = [];
    DB.leads.filter((l) => match(l.name, l.company, l.phone, l.email)).slice(0, 6).forEach((l) => res.push({ i: 'leads', label: l.name, sub: `${l.company || ''} · ${label('stage', l.stage)}`, run: () => { closePalette(); openEntity('lead', l.id); } }));
    DB.clients.filter((c) => match(c.name, c.contact, c.phone)).slice(0, 5).forEach((c) => res.push({ i: 'clients', label: c.name, sub: label('industry', c.industry), run: () => { closePalette(); openEntity('client', c.id); } }));
    DB.projects.filter((p) => match(p.name)).slice(0, 4).forEach((p) => res.push({ i: 'projects', label: p.name, sub: clientById(p.clientId)?.name, run: () => { closePalette(); openEntity('project', p.id); } }));
    DB.tasks.filter((tk) => match(tk.title)).slice(0, 4).forEach((tk) => res.push({ i: 'tasks', label: tk.title, sub: label('taskStatus', tk.status), run: () => { closePalette(); openEntity('task', tk.id); } }));
    if (can.finance()) DB.invoices.filter((i) => match(i.number, clientById(i.clientId)?.name)).slice(0, 4).forEach((i) => res.push({ i: 'invoice', label: i.number, sub: money(invTotal(i)), run: () => { closePalette(); openEntity('invoice', i.id); } }));
    if (res.length) groups.push([t('pal.results'), res]);
  }
  if (creates.length) groups.push([t('pal.create'), creates]);
  if (jumps.length) groups.push([t('pal.jump'), jumps]);
  PAL.items = groups.flatMap(([, x]) => x);
  let n = 0;
  $('#palList').innerHTML = groups.length ? groups.map(([g, items]) => `<li class="grp">${g}</li>` + items.map((it) => `<li class="it" data-pi="${n++}">${icon(it.i)}<b>${esc(it.label)}</b>${it.sub ? `<small>${esc(it.sub)}</small>` : ''}</li>`).join('')).join('') : `<li class="empty">${t('msg.noResults')}</li>`;
  $$('#palList .it').forEach((li) => { li.onmouseenter = () => { PAL.i = +li.dataset.pi; paintPal(); }; li.onclick = () => PAL.items[+li.dataset.pi]?.run(); });
  paintPal();
}
function paintPal() { $$('#palList .it').forEach((li) => li.classList.toggle('is-on', +li.dataset.pi === PAL.i)); $(`#palList .it[data-pi="${PAL.i}"]`)?.scrollIntoView({ block: 'nearest' }); }

/* ---------- Global events ---------- */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const fn = ACT[el.dataset.act];
  if (fn) { if (el.tagName === 'A' && !el.getAttribute('href')?.startsWith('#/')) e.preventDefault(); fn(el, e); }
});
document.addEventListener('input', (e) => { if (e.target.dataset?.filter) onFilter(e.target); });
document.addEventListener('change', (e) => { if (e.target.dataset?.filter && e.target.tagName === 'SELECT') onFilter(e.target); });
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && !$('#app').hidden) { e.preventDefault(); $('#palette').classList.contains('is-open') ? closePalette() : openPalette(); return; }
  if (e.key === 'Escape') {
    if ($('#palette').classList.contains('is-open')) return closePalette();
    if ($('#menu')) return closeMenu();
    if ($('#modal').classList.contains('is-open')) return closeModal(false);
    if ($('#sheet').classList.contains('is-open')) return closeSheet();
    if ($('#drawer').classList.contains('is-open')) return closeDrawer();
  }
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && $('#modal').classList.contains('is-open')) { $('#modal [data-primary]')?.click(); }
});
window.addEventListener('hashchange', onRoute);

/* ---------- Canvas waves (login hero + dashboard pulse) ---------- */
function startWaves(canvas, { lines = 6, clean = 1, amp = 1, interactive = false, alpha = 0.55 } = {}) {
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1, raf = 0, tt = Math.random() * 100;
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  const state = { clean, amp };
  const resize = () => { dpr = Math.min(2, devicePixelRatio || 1); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  if (interactive) window.addEventListener('pointermove', (e) => { mouse.tx = e.clientX / innerWidth; mouse.ty = e.clientY / innerHeight; });
  const cols = ['91,43,255', '139,61,255', '176,107,255', '224,123,255', '200,255,61'];
  const noise = (x, s) => Math.sin(x * 12.9898 + s * 78.233) * 0.5 + Math.sin(x * 4.1 + s * 1.7) * 0.5;
  const frame = () => {
    if (!canvas.isConnected) { cancelAnimationFrame(raf); ro.disconnect(); return; }
    tt += reducedMotion ? 0 : 0.012;
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    ctx.clearRect(0, 0, w, h);
    for (let l = 0; l < lines; l++) {
      const k = l / Math.max(1, lines - 1);
      const base = h * (0.38 + k * 0.32) + (interactive ? (mouse.y - 0.5) * 60 * (1 - k) : 0);
      const A = h * 0.12 * state.amp * (0.6 + k * 0.6);
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      const c = cols[l % (cols.length - 1)];
      grad.addColorStop(0, `rgba(${c},0)`);
      grad.addColorStop(0.3, `rgba(${c},${alpha * (0.5 + k * 0.5)})`);
      grad.addColorStop(0.75, `rgba(${cols[(l + 2) % cols.length]},${alpha * 0.8})`);
      grad.addColorStop(1, `rgba(${c},0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = l === lines - 1 ? 2.2 : 1.2;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const nx = x / w;
        const pull = interactive ? Math.exp(-Math.pow((nx - mouse.x) * 3, 2)) * 40 : 0;
        const wave = Math.sin(nx * (4 + k * 2) + tt * (1 + k * 0.6) + l) * A + Math.sin(nx * 9 - tt * 1.3 + l * 2) * A * 0.25;
        const jag = noise(nx * 40 + l, Math.floor(tt * 20) * 0.1) * A * 0.9 * (1 - state.clean);
        const y = base + wave * (0.35 + state.clean * 0.65) + jag - pull * (1 - k);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    raf = requestAnimationFrame(frame);
  };
  frame();
  return state;
}
