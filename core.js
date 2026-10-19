/* ==========================================================================
   Core — helpers, enums, data store, Google Sheets sync, session, demo seed
   ========================================================================== */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sum = (arr, f) => arr.reduce((s, x) => s + (Number(f ? f(x) : x) || 0), 0);
const uniq = (arr) => Array.from(new Set(arr));
const icon = (id, cls = '') => `<svg class="i ${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const LS = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} },
};

function uid(prefix) {
  const r = (crypto.getRandomValues ? Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => b.toString(36).padStart(2, '0')).join('') : Math.random().toString(36).slice(2, 10));
  return `${prefix}-${Date.now().toString(36).slice(-4)}${r.slice(0, 5)}`.toUpperCase();
}

/* ---------- Dates (stored as local YYYY-MM-DD; timestamps as ISO) ---------- */
const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => toISODate(new Date());
const parseDate = (s) => { if (!s) return null; const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const addDays = (iso, n) => { const d = parseDate(iso); d.setDate(d.getDate() + n); return toISODate(d); };
const daysBetween = (a, b) => Math.round((parseDate(b) - parseDate(a)) / 86400000);
const monthKey = (iso) => String(iso || '').slice(0, 7);
const thisMonth = () => monthKey(today());
const shiftMonth = (key, n) => { const [y, m] = key.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
const dayOf = (ts) => (ts ? toISODate(new Date(ts)) : '');
const locale = () => (LANG === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB');

function fmtDate(iso, opts = { day: 'numeric', month: 'short' }) {
  if (!iso) return '—';
  const d = parseDate(iso);
  if (d.getFullYear() !== new Date().getFullYear() && !opts.year) opts = { ...opts, year: 'numeric' };
  return new Intl.DateTimeFormat(locale(), opts).format(d);
}
const fmtMonth = (key, long = false) => new Intl.DateTimeFormat(locale(), { month: long ? 'long' : 'short', year: long ? 'numeric' : undefined }).format(parseDate(key + '-01'));
function relDay(iso) {
  if (!iso) return '';
  const n = daysBetween(today(), iso);
  if (n === 0) return t('time.today');
  if (n === 1) return t('time.tomorrow');
  if (n === -1) return t('time.yesterday');
  if (n < 0) return t('time.overdue', { n: -n });
  if (n < 7) return t('time.inDays', { n });
  return fmtDate(iso);
}
function ago(ts) {
  if (!ts) return '';
  const s = (Date.now() - new Date(ts).getTime()) / 1000;
  if (s < 60) return t('time.justNow');
  if (s < 3600) return t('time.minAgo', { n: Math.floor(s / 60) });
  if (s < 86400) return t('time.hoursAgo', { n: Math.floor(s / 3600) });
  const d = Math.floor(s / 86400);
  return d === 1 ? t('time.yesterday') : d < 30 ? t('time.daysAgo', { n: d }) : fmtDate(dayOf(ts));
}
function dueTag(iso, done) {
  if (!iso) return '';
  const n = daysBetween(today(), iso);
  const cls = !done && n < 0 ? 'is-late' : !done && n === 0 ? 'is-today' : '';
  return `<span class="tag ${cls}">${icon('clock')}${esc(relDay(iso))}</span>`;
}

/* ---------- Money ---------- */
const CURRENCY = { EGP: { en: 'EGP', ar: 'ج.م' }, USD: { en: '$', ar: '$' }, SAR: { en: 'SAR', ar: 'ر.س' }, AED: { en: 'AED', ar: 'د.إ' } };
function curSym() { const c = CURRENCY[DB.settings.currency] || CURRENCY.EGP; return c[LANG]; }
function money(v, compact = false) {
  const n = Number(v) || 0;
  let s;
  if (compact && Math.abs(n) >= 1e6) s = (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1) + 'M';
  else if (compact && Math.abs(n) >= 1e4) s = Math.round(n / 1e3) + 'K';
  else s = n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return DB.settings.currency === 'USD' ? `$${s}` : `${s} ${curSym()}`;
}
const pct = (v) => `${Math.round(v * 100)}%`;

/* ---------- Enums & colours ---------- */
const ENUM = {
  stage: ['new', 'contacted', 'discovery', 'proposal', 'negotiation', 'won', 'lost'],
  source: ['website', 'pulse', 'meta', 'instagram', 'tiktok', 'google', 'referral', 'whatsapp', 'event', 'cold'],
  service: ['strategy', 'content', 'media', 'tech', 'digital', 'growth', 'print', 'consulting'],
  industry: ['fnb', 'fmcg', 'auto', 'corporate', 'org', 'education', 'health', 'retail', 'realestate', 'other'],
  clientStatus: ['active', 'onboarding', 'paused', 'ended'],
  projectStatus: ['brief', 'progress', 'review', 'delivered', 'hold'],
  taskStatus: ['todo', 'doing', 'review', 'done'],
  priority: ['low', 'medium', 'high', 'urgent'],
  platform: ['instagram', 'facebook', 'tiktok', 'linkedin', 'snapchat', 'youtube', 'x'],
  format: ['post', 'reel', 'story', 'carousel', 'video', 'ad'],
  contentStatus: ['idea', 'writing', 'design', 'approval', 'scheduled', 'published'],
  invoiceStatus: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
  role: ['admin', 'manager', 'member'],
  dept: ['management', 'accounts', 'creative', 'media', 'content', 'dev', 'sales'],
  lostReason: ['budget', 'timing', 'competitor', 'noResponse', 'fit', 'other'],
};
const OPEN_STAGES = ['new', 'contacted', 'discovery', 'proposal', 'negotiation'];
const COLORS = {
  stage: { new: '#8b3dff', contacted: '#5b8cff', discovery: '#2bd4ff', proposal: '#ffb547', negotiation: '#e07bff', won: '#c8ff3d', lost: '#ff5c7a' },
  source: { website: '#8b3dff', pulse: '#c8ff3d', meta: '#5b8cff', instagram: '#e1306c', tiktok: '#25f4ee', google: '#ffb547', referral: '#3ee6a8', whatsapp: '#4ade80', event: '#e07bff', cold: '#a69fbd' },
  service: { strategy: '#8b3dff', content: '#e07bff', media: '#5b8cff', tech: '#2bd4ff', digital: '#b06bff', growth: '#c8ff3d', print: '#ffb547', consulting: '#3ee6a8' },
  clientStatus: { active: '#c8ff3d', onboarding: '#2bd4ff', paused: '#ffb547', ended: '#6d6683' },
  projectStatus: { brief: '#a69fbd', progress: '#8b3dff', review: '#ffb547', delivered: '#c8ff3d', hold: '#ff5c7a' },
  taskStatus: { todo: '#a69fbd', doing: '#5b8cff', review: '#ffb547', done: '#c8ff3d' },
  priority: { low: '#6d6683', medium: '#5b8cff', high: '#ffb547', urgent: '#ff5c7a' },
  platform: { instagram: '#e1306c', facebook: '#4c8dff', tiktok: '#25f4ee', linkedin: '#2d8cff', snapchat: '#fffc00', youtube: '#ff3b3b', x: '#e8e8e8' },
  contentStatus: { idea: '#6d6683', writing: '#5b8cff', design: '#b06bff', approval: '#ffb547', scheduled: '#2bd4ff', published: '#c8ff3d' },
  invoiceStatus: { draft: '#a69fbd', sent: '#5b8cff', paid: '#c8ff3d', overdue: '#ff5c7a', cancelled: '#6d6683' },
  lostReason: { budget: '#ff5c7a', timing: '#ffb547', competitor: '#e07bff', noResponse: '#5b8cff', fit: '#2bd4ff', other: '#a69fbd' },
};
const PLAT_ABBR = { instagram: 'IG', facebook: 'FB', tiktok: 'TT', linkedin: 'in', snapchat: 'SC', youtube: 'YT', x: 'X' };
const BRAND_COLORS = ['#8b3dff', '#e07bff', '#5b8cff', '#2bd4ff', '#3ee6a8', '#c8ff3d', '#ffb547', '#ff7a45', '#ff5c7a', '#b06bff'];
const label = (en, v) => (v ? t(`${en}.${v}`) : '—');
const pill = (en, v, extra = '') => (v ? `<span class="pill ${extra}" style="--c:${(COLORS[en] || {})[v] || 'var(--muted)'}"><i></i>${esc(label(en, v))}</span>` : '');

/* ---------- Data ---------- */
const COLS = ['leads', 'clients', 'projects', 'tasks', 'content', 'invoices', 'activity'];
const PREFIX = { leads: 'L', clients: 'C', projects: 'P', tasks: 'T', content: 'CT', invoices: 'INV', activity: 'A', users: 'U' };
const DEFAULT_SETTINGS = { agency: 'WAV Marketing Agency', currency: 'EGP', vat: 0, address: 'Egypt', phone: '', email: '', taxId: '', invPrefix: 'WAV', website: 'www.wavagency.com' };
const DB = { users: [], settings: { ...DEFAULT_SETTINGS } };
COLS.forEach((c) => (DB[c] = []));

let SESSION = LS.get('wav_session', null); // { mode: 'demo'|'cloud', userId, token }
const me = () => DB.users.find((u) => u.id === SESSION?.userId) || DB.users[0] || { id: '', name: '', role: 'member' };
const userById = (id) => DB.users.find((u) => u.id === id);
const clientById = (id) => DB.clients.find((c) => c.id === id);
const projectById = (id) => DB.projects.find((p) => p.id === id);
const isCloud = () => SESSION?.mode === 'cloud';
const can = {
  finance: () => ['admin', 'manager'].includes(me().role),
  remove: () => ['admin', 'manager'].includes(me().role),
  team: () => me().role === 'admin',
  settings: () => me().role === 'admin',
};
const initials = (name) => String(name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
function avatar(u, size = '') {
  if (!u) return `<span class="avatar ${size}" style="--c:#3a3350">?</span>`;
  return `<span class="avatar ${size}" style="--c:${esc(u.color || '#8b3dff')}" title="${esc(u.name)}">${esc(initials(u.name))}</span>`;
}
function clientLogo(c, size = '') {
  if (!c) return '';
  return `<span class="avatar avatar--sq ${size}" style="--c:${esc(c.color || '#8b3dff')}">${esc(initials(c.name))}</span>`;
}

/* Normalise records coming back from Sheets (numbers may arrive as strings, arrays as JSON). */
const NUM_FIELDS = ['value', 'retainer', 'budget', 'progress', 'discount', 'vat', 'pulseScore', 'total', 'qty', 'price'];
const ARR_FIELDS = ['services', 'items'];
function normalize(rec) {
  if (!rec) return rec;
  NUM_FIELDS.forEach((k) => { if (rec[k] !== undefined && rec[k] !== '') rec[k] = Number(rec[k]) || 0; });
  ARR_FIELDS.forEach((k) => {
    if (typeof rec[k] === 'string') { try { rec[k] = rec[k] ? JSON.parse(rec[k]) : []; } catch (e) { rec[k] = rec[k].split(',').map((s) => s.trim()).filter(Boolean); } }
  });
  if (rec.active !== undefined) rec.active = rec.active === true || rec.active === 'true' || rec.active === 'TRUE';
  return rec;
}

/* ---------- Change bus ---------- */
const listeners = new Set();
let changeQueued = false;
function emitChange() {
  if (changeQueued) return;
  changeQueued = true;
  requestAnimationFrame(() => { changeQueued = false; listeners.forEach((fn) => fn()); });
}

/* ---------- Store ---------- */
const Store = {
  key() { return isCloud() ? 'wav_cloud_cache' : 'wav_demo_db'; },
  load() {
    const raw = LS.get(this.key());
    if (raw && raw.users) {
      DB.users = raw.users;
      DB.settings = { ...DEFAULT_SETTINGS, ...(raw.settings || {}) };
      COLS.forEach((c) => (DB[c] = (raw[c] || []).map(normalize)));
      Sync.lastSync = raw.lastSync || null;
      return true;
    }
    return false;
  },
  _t: 0,
  persist() {
    clearTimeout(this._t);
    this._t = setTimeout(() => {
      const snap = { users: DB.users, settings: DB.settings, lastSync: Sync.lastSync };
      COLS.forEach((c) => (snap[c] = DB[c]));
      LS.set(this.key(), snap);
    }, 120);
  },
  replaceAll(payload) {
    if (payload.users) DB.users = payload.users.map(normalize);
    if (payload.settings) DB.settings = { ...DEFAULT_SETTINGS, ...payload.settings };
    COLS.forEach((c) => { if (payload.data && payload.data[c]) DB[c] = payload.data[c].map(normalize); });
    this.persist();
    emitChange();
  },
  get(col, id) { return DB[col].find((r) => r.id === id); },
  save(col, rec, { log } = {}) {
    const now = new Date().toISOString();
    const existing = rec.id ? this.get(col, rec.id) : null;
    if (!rec.id) rec.id = uid(PREFIX[col]);
    if (!existing) { rec.createdAt = rec.createdAt || now; rec.createdBy = rec.createdBy || me().id; }
    rec.updatedAt = now;
    rec.updatedBy = me().id;
    const clean = JSON.parse(JSON.stringify(rec));
    if (existing) Object.assign(existing, clean); else DB[col].unshift(clean);
    this.persist();
    if (isCloud()) Sync.push({ op: 'upsert', collection: col, record: clean });
    if (log) logActivity(log.type, col, clean.id, log.text, log.extra);
    emitChange();
    return existing || clean;
  },
  remove(col, id) {
    const i = DB[col].findIndex((r) => r.id === id);
    if (i < 0) return null;
    const [removed] = DB[col].splice(i, 1);
    this.persist();
    if (isCloud()) Sync.push({ op: 'remove', collection: col, id });
    emitChange();
    return removed;
  },
  restore(col, rec) { // undo a delete
    DB[col].unshift(rec);
    this.persist();
    if (isCloud()) Sync.push({ op: 'upsert', collection: col, record: rec });
    emitChange();
  },
};

function logActivity(type, entity, entityId, text, extra = {}) {
  const a = { id: uid('A'), type, entity, entityId, text, by: me().id, at: new Date().toISOString(), ...extra };
  a.createdAt = a.updatedAt = a.at;
  a.createdBy = a.updatedBy = me().id;
  DB.activity.unshift(a);
  if (DB.activity.length > 1500) DB.activity.length = 1500;
  Store.persist();
  if (isCloud()) Sync.push({ op: 'upsert', collection: 'activity', record: a });
}

/* ---------- Google Sheets sync (Apps Script Web App) ---------- */
const Sync = {
  state: 'demo',
  outbox: LS.get('wav_outbox', []),
  lastSync: null,
  flushing: false,
  timer: 0,
  url() { return LS.get('wav_api', ''); },
  setState(s) { this.state = s; renderSyncPill(); },
  saveOutbox() { LS.set('wav_outbox', this.outbox); },
  async call(action, data = {}, { auth = true, url } = {}) {
    const body = { action, ...data };
    if (auth) body.token = SESSION?.token;
    // text/plain keeps this a "simple" request — no CORS preflight, which Apps Script can't answer.
    const res = await fetch(url || this.url(), { method: 'POST', body: JSON.stringify(body), redirect: 'follow' });
    if (!res.ok) throw Object.assign(new Error('HTTP ' + res.status), { code: 'NET' });
    const j = await res.json();
    if (!j.ok) {
      const e = Object.assign(new Error(j.error || 'Error'), { code: j.code || 'ERR' });
      if (e.code === 'AUTH' && auth) onAuthExpired();
      throw e;
    }
    return j;
  },
  push(op) {
    // Collapse repeated upserts of the same record into the latest one.
    if (op.op === 'upsert') this.outbox = this.outbox.filter((o) => !(o.op === 'upsert' && o.collection === op.collection && o.record.id === op.record.id));
    this.outbox.push(op);
    this.saveOutbox();
    clearTimeout(this._ft);
    this._ft = setTimeout(() => this.flush(), 350);
  },
  pendingIds() { return new Set(this.outbox.map((o) => (o.record ? o.record.id : o.id))); },
  async flush() {
    if (!isCloud() || this.flushing || !this.outbox.length) return;
    this.flushing = true;
    this.setState('syncing');
    try {
      while (this.outbox.length) {
        const batch = this.outbox.slice(0, 25);
        const j = await this.call('batch', { ops: batch });
        (j.results || []).forEach((r) => {
          if (r && r.record) { const loc = Store.get(r.collection, r.record.id); if (loc) loc.updatedAt = r.record.updatedAt; }
          if (r && r.error) toast(r.code === 'FORBIDDEN' ? t('msg.noAccess') : r.error, { err: true });
        });
        this.outbox.splice(0, batch.length);
        this.saveOutbox();
      }
      this.setState('ok');
      Store.persist();
    } catch (e) {
      this.setState(e.code === 'AUTH' ? 'error' : 'offline');
    } finally {
      this.flushing = false;
    }
  },
  async pull() {
    if (!isCloud() || this.flushing) return;
    try {
      const j = await this.call('changes', { since: this.lastSync });
      const pending = this.pendingIds();
      let changed = false;
      COLS.forEach((c) => {
        (j.data?.[c] || []).forEach((raw) => {
          const rec = normalize(raw);
          if (pending.has(rec.id)) return;
          const loc = Store.get(c, rec.id);
          if (!loc) { DB[c].unshift(rec); changed = true; }
          else if (!loc.updatedAt || rec.updatedAt >= loc.updatedAt) { Object.assign(loc, rec); changed = true; }
        });
      });
      (j.deleted || []).forEach((d) => {
        if (pending.has(d.id) || !DB[d.collection]) return;
        const i = DB[d.collection].findIndex((r) => r.id === d.id);
        if (i >= 0) { DB[d.collection].splice(i, 1); changed = true; }
      });
      if (j.users) { DB.users = j.users.map(normalize); changed = true; }
      if (j.settings) DB.settings = { ...DEFAULT_SETTINGS, ...j.settings };
      this.lastSync = j.now;
      Store.persist();
      if (changed) emitChange();
      if (!this.outbox.length) this.setState('ok');
    } catch (e) {
      if (e.code !== 'AUTH') this.setState('offline');
    }
  },
  start() {
    clearInterval(this.timer);
    if (!isCloud()) { this.setState('demo'); return; }
    this.setState(this.outbox.length ? 'offline' : 'ok');
    this.flush().then(() => this.pull());
    this.timer = setInterval(() => { if (!document.hidden) { this.flush(); this.pull(); } }, 20000);
  },
  stop() { clearInterval(this.timer); },
};
window.addEventListener('online', () => { Sync.flush(); Sync.pull(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden && isCloud()) { Sync.flush(); Sync.pull(); } });

/* ---------- Seeded demo data ---------- */
function seedDemo() {
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const T = today();
  const ts = (dOff, h = 11) => { const d = parseDate(addDays(T, dOff)); d.setHours(h, Math.floor(rnd() * 59)); return d.toISOString(); };

  const users = [
    { id: 'U-ADMIN', name: 'Hady Ramzy', email: 'admin@wav.agency', role: 'admin', dept: 'management', title: 'Founder & CEO', color: '#8b3dff', active: true },
    { id: 'U-MARIAM', name: 'Mariam Adel', email: 'mariam@wav.agency', role: 'manager', dept: 'accounts', title: 'Head of Accounts', color: '#e07bff', active: true },
    { id: 'U-OMAR', name: 'Omar Khaled', email: 'omar@wav.agency', role: 'member', dept: 'media', title: 'Performance Lead', color: '#5b8cff', active: true },
    { id: 'U-NOUR', name: 'Nour Hassan', email: 'nour@wav.agency', role: 'member', dept: 'content', title: 'Content Lead', color: '#2bd4ff', active: true },
    { id: 'U-YOUSSEF', name: 'Youssef Samir', email: 'youssef@wav.agency', role: 'member', dept: 'creative', title: 'Art Director', color: '#ffb547', active: true },
    { id: 'U-SALMA', name: 'Salma Tarek', email: 'salma@wav.agency', role: 'member', dept: 'sales', title: 'Growth Consultant', color: '#3ee6a8', active: true },
  ];
  const U = Object.fromEntries(users.map((u) => [u.id.slice(2).toLowerCase(), u.id]));

  const clientDefs = [
    ['Nile Bites', 'fnb', 'Hany Fouad', 45000, ['content', 'media'], '#ff7a45', 'active', -320],
    ['Crema Lab Coffee', 'fnb', 'Dina Samy', 32000, ['content', 'digital'], '#c8a27a', 'active', -210],
    ['Sahel Motors', 'auto', 'Tamer Wahba', 68000, ['media', 'content', 'growth'], '#5b8cff', 'active', -400],
    ['Lumi Skincare', 'health', 'Rana Magdy', 38000, ['strategy', 'content', 'media'], '#e07bff', 'active', -150],
    ['Delta Builders', 'corporate', 'Eng. Ashraf Nabil', 26000, ['strategy', 'print'], '#3ee6a8', 'active', -95],
    ['Youth Vision', 'org', 'Malak Sherif', 12000, ['content'], '#2bd4ff', 'paused', -260],
    ['Koshary Station', 'fnb', 'Mostafa Gaber', 0, ['tech', 'digital'], '#ffb547', 'onboarding', -12],
    ['Pharos Dental', 'health', 'Dr. Heba Lotfy', 22000, ['media', 'growth'], '#b06bff', 'active', -60],
  ];
  const clients = clientDefs.map(([name, industry, contact, retainer, services, color, status, since], i) => ({
    id: `C-${pad(i + 1)}`, name, industry, contact, retainer, services, color, status, since: addDays(T, since),
    phone: `+20 10${Math.floor(10000000 + rnd() * 89999999)}`, email: `hello@${name.toLowerCase().replace(/[^a-z]/g, '')}.com`,
    manager: pick([U.mariam, U.mariam, U.salma]), notes: '', createdAt: ts(since), updatedAt: ts(-2),
  }));

  const leadNames = [
    ['Ahmed Mansour', 'Mansour Pharma'], ['Yara El Sayed', 'Glow Studio'], ['Karim Fathy', 'Fathy Furniture'], ['Mona Raafat', 'Raafat Academy'],
    ['Hossam Zaki', 'Zaki Real Estate'], ['Laila Nasser', 'Petit Café'], ['Sherif Amin', 'Amin Logistics'], ['Farida Kamal', 'Bloom Florist'],
    ['Islam Reda', 'Reda Gym'], ['Nada Wael', 'Nada Couture'], ['Mahmoud Saber', 'Saber Ceramics'], ['Habiba Osama', 'Fresh Market EG'],
    ['Tarek Lotfy', 'Lotfy Auto Parts'], ['Rania Fawzy', 'Little Steps Nursery'], ['Ziad Hamdy', 'ZH Tech'], ['Aya Mostafa', 'Aya Sweets'],
    ['Bassem Youssef', 'Cairo Grill House'], ['Salwa Ezzat', 'Ezzat Clinics'], ['Hassan Badr', 'Badr Steel'], ['Menna Ali', 'Menna Handmade'],
    ['Adham Nour', 'Nour Travel'], ['Dalia Hosny', 'Hosny Optics'],
  ];
  const stagesPlan = ['new', 'new', 'new', 'contacted', 'contacted', 'contacted', 'discovery', 'discovery', 'proposal', 'proposal', 'proposal', 'negotiation', 'negotiation', 'won', 'won', 'won', 'won', 'lost', 'lost', 'lost', 'new', 'discovery'];
  const leads = leadNames.map(([name, company], i) => {
    const stage = stagesPlan[i];
    const created = -Math.floor(rnd() * 150) - 1;
    const source = i % 5 === 0 ? 'pulse' : pick(ENUM.source);
    const l = {
      id: `L-${pad(i + 1)}`, name, company, phone: `+20 1${pick(['0', '1', '2', '5'])}${Math.floor(10000000 + rnd() * 89999999)}`,
      email: `${name.split(' ')[0].toLowerCase()}@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      source, service: pick(ENUM.service), industry: pick(ENUM.industry), value: Math.round((15 + rnd() * 160)) * 1000,
      stage, owner: pick([U.salma, U.salma, U.mariam, U.admin]),
      followUp: OPEN_STAGES.includes(stage) ? addDays(T, Math.floor(rnd() * 12) - 4) : '',
      notes: '', createdAt: ts(created), updatedAt: ts(Math.min(-1, created + 5)),
    };
    if (source === 'pulse') { l.pulseScore = 38 + Math.floor(rnd() * 45); l.planId = 'WAV-' + Math.floor(rnd() * 0xffffff).toString(16).toUpperCase().padStart(6, '0'); }
    if (stage === 'won') l.wonAt = addDays(T, i === 13 ? -3 : i === 14 ? -9 : -Math.floor(20 + rnd() * 90));
    if (stage === 'lost') { l.lostAt = addDays(T, -Math.floor(rnd() * 60)); l.lostReason = pick(ENUM.lostReason); }
    return l;
  });

  const projectDefs = [
    ['Ramadan campaign 2027', 'C-01', 'content', 'progress', -20, 25, 120000],
    ['Always-on performance ads', 'C-03', 'media', 'progress', -60, 40, 0],
    ['Brand refresh & guidelines', 'C-04', 'strategy', 'review', -35, 4, 85000],
    ['Corporate profile & brochure', 'C-05', 'print', 'progress', -18, 12, 42000],
    ['Ordering website + menu', 'C-07', 'tech', 'brief', -5, 45, 95000],
    ['Summer drinks launch', 'C-02', 'content', 'delivered', -80, -20, 60000],
    ['Patient acquisition funnel', 'C-08', 'growth', 'progress', -25, 20, 0],
    ['Volunteer season content', 'C-06', 'content', 'hold', -90, -10, 18000],
  ];
  const projects = projectDefs.map(([name, clientId, service, status, start, due, budget], i) => ({
    id: `P-${pad(i + 1)}`, name, clientId, service, status, start: addDays(T, start), due: addDays(T, due), budget,
    owner: pick([U.mariam, U.nour, U.omar, U.youssef]), progress: status === 'delivered' ? 100 : Math.floor(rnd() * 70) + 10,
    notes: '', createdAt: ts(start), updatedAt: ts(-1),
  }));

  const taskTitles = [
    ['Write 12 captions for next week', 'P-01', U.nour], ['Storyboard hero Ramadan video', 'P-01', U.youssef], ['Book studio + talent for shoot', 'P-01', U.mariam],
    ['Launch retargeting campaign', 'P-02', U.omar], ['Weekly ads report for Sahel', 'P-02', U.omar], ['A/B test new creatives', 'P-02', U.omar],
    ['Logo variations round 2', 'P-03', U.youssef], ['Present brand book to client', 'P-03', U.mariam], ['Brochure copy — Arabic & English', 'P-04', U.nour],
    ['Print quotes from 3 suppliers', 'P-04', U.mariam], ['Sitemap & wireframes', 'P-05', U.youssef], ['Collect menu photos', 'P-05', U.nour],
    ['Set up conversion tracking', 'P-07', U.omar], ['Landing page for implants offer', 'P-07', U.youssef], ['Monthly report — Nile Bites', 'P-01', U.mariam],
    ['Proposal for Mansour Pharma', '', U.salma], ['Follow up on Glow Studio quote', '', U.salma], ['Team weekly sync notes', '', U.admin],
  ];
  const tStatus = ['todo', 'todo', 'doing', 'doing', 'review', 'done'];
  const tasks = taskTitles.map(([title, projectId, assignee], i) => {
    const status = i < 3 ? ['doing', 'todo', 'review'][i] : pick(tStatus);
    return {
      id: `T-${pad(i + 1)}`, title, projectId, clientId: projectId ? projectById2(projectId, projects)?.clientId : '', assignee,
      status, priority: pick(ENUM.priority), due: addDays(T, Math.floor(rnd() * 14) - 4),
      doneAt: status === 'done' ? addDays(T, -Math.floor(rnd() * 15)) : '', createdAt: ts(-20), updatedAt: ts(-1),
    };
  });

  const contentIdeas = ['Behind the scenes', 'Product close-up', 'Customer review', 'Offer of the week', 'Team spotlight', 'Myth vs fact', 'Tips carousel',
    'New menu item', 'Giveaway', 'Before & after', 'How it’s made', 'FAQ reel', 'Brand story', 'Weekend vibes', 'Testimonial video'];
  const content = [];
  const contentClients = ['C-01', 'C-02', 'C-03', 'C-04', 'C-08', 'C-05'];
  for (let d = -16; d <= 24; d++) {
    const per = rnd() < 0.55 ? 1 : rnd() < 0.5 ? 2 : 0;
    for (let k = 0; k < per; k++) {
      const date = addDays(T, d);
      const status = d < 0 ? (rnd() < 0.9 ? 'published' : 'approval') : d < 3 ? pick(['scheduled', 'approval', 'design']) : pick(['idea', 'writing', 'design', 'approval', 'scheduled']);
      const clientId = pick(contentClients);
      content.push({
        id: `CT-${content.length + 1}`, title: pick(contentIdeas), clientId, platform: pick(['instagram', 'instagram', 'facebook', 'tiktok', 'linkedin', 'snapchat']),
        format: pick(ENUM.format), date, time: pick(['12:00', '15:00', '19:00', '21:00']), status, assignee: pick([U.nour, U.youssef, U.nour]),
        caption: '', link: '', createdAt: ts(d - 7), updatedAt: ts(Math.min(d, -1)),
      });
    }
  }

  const invoices = [];
  let invN = 1;
  const mk = (clientId, issueOff, status, items, extra = {}) => {
    const issue = addDays(T, issueOff);
    invoices.push({
      id: `INV-${pad(invN)}`, number: `WAV-${issue.slice(0, 4)}-${String(invN).padStart(3, '0')}`, clientId, issue, due: addDays(issue, 14), status,
      items, discount: 0, vat: 14, notes: '', paidAt: status === 'paid' ? addDays(issue, Math.floor(4 + rnd() * 10)) : '',
      createdAt: ts(issueOff), updatedAt: ts(Math.min(-1, issueOff + 5)), ...extra,
    });
    invN++;
  };
  for (let m = 11; m >= 1; m--) {
    ['C-01', 'C-03', 'C-04', 'C-08'].forEach((cid) => {
      const c = clients.find((x) => x.id === cid);
      if (parseDate(c.since) > parseDate(addDays(T, -30 * m))) return;
      const mKey = shiftMonth(thisMonth(), -m);
      mk(cid, -30 * m + 2, 'paid', [{ desc: t('inv.retainerFor', { month: fmtMonth(mKey, true) }), qty: 1, price: c.retainer }], { retainerMonth: mKey });
    });
  }
  mk('C-02', -38, 'paid', [{ desc: 'Summer drinks launch — production', qty: 1, price: 60000 }]);
  mk('C-05', -26, 'sent', [{ desc: 'Corporate profile — design & copy', qty: 1, price: 28000 }, { desc: 'Brochure print run (1000 pcs)', qty: 1000, price: 14 }]);
  mk('C-04', -6, 'sent', [{ desc: 'Brand refresh — milestone 2', qty: 1, price: 42500 }]);
  mk('C-03', -3, 'draft', [{ desc: 'Ad spend management fee — extra markets', qty: 1, price: 18000 }]);
  mk('C-06', -45, 'sent', [{ desc: 'Volunteer season content package', qty: 1, price: 18000 }]);

  const activity = [];
  const act = (type, entity, entityId, text, by, at) => activity.push({ id: `A-${activity.length + 1}`, type, entity, entityId, text, by, at, createdAt: at, updatedAt: at });
  act('stage', 'leads', 'L-14', 'won', U.salma, ts(-3, 16));
  act('note', 'leads', 'L-10', 'Asked for Ramadan package pricing — send proposal by Thursday.', U.salma, ts(-1, 14));
  act('create', 'leads', 'L-21', 'created', U.salma, ts(-1, 10));
  act('done', 'tasks', 'T-06', 'done', U.omar, ts(-1, 12));
  act('publish', 'content', content.find((c) => c.status === 'published')?.id || '', 'published', U.nour, ts(-1, 19));
  act('paid', 'invoices', 'INV-01', 'paid', U.mariam, ts(-2, 13));
  act('stage', 'leads', 'L-12', 'negotiation', U.mariam, ts(-2, 11));
  act('note', 'leads', 'L-01', 'Came through the pulse check — biggest gap is paid ads. Wants a call on Sunday.', U.salma, ts(-4, 15));
  act('create', 'clients', 'C-07', 'created', U.admin, ts(-12, 12));
  act('create', 'projects', 'P-05', 'created', U.mariam, ts(-5, 9));
  activity.sort((a, b) => (a.at < b.at ? 1 : -1));

  DB.users = users;
  DB.settings = { ...DEFAULT_SETTINGS, vat: 14 };
  Object.assign(DB, { leads, clients, projects, tasks, content, invoices, activity });
  Store.persist();
}
function projectById2(id, list) { return list.find((p) => p.id === id); }
