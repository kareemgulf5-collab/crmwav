/**
 * WAV CRM — Google Apps Script backend (Google Sheets as the database)
 * ---------------------------------------------------------------------
 * SETUP (once):
 *   1. Create a new Google Sheet (e.g. "WAV CRM").
 *   2. Extensions → Apps Script. Delete the sample code and paste this whole file.
 *   3. Change ADMIN_EMAIL and ADMIN_NAME below to your own.
 *   4. Pick the `setup` function in the toolbar and press Run. Approve the permissions.
 *      The execution log prints your temporary admin password and the website key.
 *   5. Deploy → New deployment → type "Web app"
 *        Execute as: Me      Who has access: Anyone
 *      Copy the Web app URL (ends with /exec) and paste it into the CRM login screen.
 *   6. Sign in with ADMIN_EMAIL + the temporary password, then change it from Settings.
 *
 * When you edit this file later: Deploy → Manage deployments → Edit → Version: New version.
 * Forgot the admin password? Run `resetAdminPassword` and read the log.
 *
 * Security: passwords are salted + hashed, never returned to the browser.
 * Every request (except login / ping / websiteLead) needs a signed session token.
 */

const ADMIN_EMAIL = 'kareemgulf5@gmail.com';
const ADMIN_NAME = 'Kareem Saad';

const COLLECTIONS = ['leads', 'clients', 'projects', 'tasks', 'content', 'invoices', 'activity'];
const JSON_FIELDS = ['services', 'items'];
const BASE_COLS = ['id', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy'];
const USER_COLS = ['id', 'name', 'email', 'role', 'dept', 'title', 'color', 'active', 'passwordHash', 'salt', 'tv', 'createdAt', 'updatedAt'];
const TOKEN_DAYS = 14;
const FINANCE_ROLES = ['admin', 'manager'];

/* ============================== HTTP ============================== */

function doGet() {
  return json_({ ok: true, app: 'WAV CRM API', version: 1 });
}

function doPost(e) {
  let req;
  try { req = JSON.parse((e && e.postData && e.postData.contents) || '{}'); }
  catch (err) { return json_({ ok: false, error: 'Bad request', code: 'BAD' }); }
  try {
    const action = String(req.action || '');
    if (action === 'ping') return json_({ ok: true, now: nowIso_() });
    if (action === 'login') return json_(login_(req));
    if (action === 'websiteLead') return json_(websiteLead_(req));

    const user = auth_(req.token);
    switch (action) {
      case 'bootstrap': return json_(Object.assign({ ok: true, user: publicUser_(user) }, snapshot_()));
      case 'changes': return json_(changes_(req.since));
      case 'batch': return json_(batch_(req.ops || [], user));
      case 'saveUser': return json_(saveUser_(req, user));
      case 'saveSettings': return json_(saveSettings_(req.settings, user));
      case 'changePassword': return json_(changePassword_(req, user));
    }
    return json_({ ok: false, error: 'Unknown action', code: 'BAD' });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err), code: (err && err.code) || 'ERR' });
  }
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function fail_(msg, code) { const e = new Error(msg); e.code = code || 'ERR'; throw e; }
function nowIso_() { return new Date().toISOString(); }

/* ============================== Sheets ============================== */

function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }

function sheet_(name, cols) {
  let sh = ss_().getSheetByName(name);
  if (!sh) {
    sh = ss_().insertSheet(name);
    sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).setNumberFormat('@'); // keep dates & ids as text
    sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold').setBackground('#13101d').setFontColor('#f5f2ff');
    sh.setFrozenRows(1);
  }
  return sh;
}
function headers_(sh) {
  const n = sh.getLastColumn();
  return n ? sh.getRange(1, 1, 1, n).getValues()[0].map(String) : [];
}
function ensureCols_(sh, keys) {
  const h = headers_(sh);
  const missing = keys.filter(function (k) { return h.indexOf(k) < 0; });
  if (missing.length) {
    if (sh.getMaxColumns() < h.length + missing.length) sh.insertColumnsAfter(sh.getMaxColumns(), h.length + missing.length - sh.getMaxColumns());
    sh.getRange(1, h.length + 1, sh.getMaxRows(), missing.length).setNumberFormat('@');
    sh.getRange(1, h.length + 1, 1, missing.length).setValues([missing]).setFontWeight('bold').setBackground('#13101d').setFontColor('#f5f2ff');
  }
  return h.concat(missing);
}
function cellOut_(v) {
  if (v instanceof Date) return isNaN(v) ? '' : v.toISOString();
  return v;
}
function readAll_(name, cols) {
  const sh = sheet_(name, cols || BASE_COLS);
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const h = values[0].map(String);
  const out = [];
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    if (!row[0]) continue;
    const o = {};
    for (let c = 0; c < h.length; c++) {
      if (!h[c]) continue;
      let v = cellOut_(row[c]);
      if (JSON_FIELDS.indexOf(h[c]) >= 0 && typeof v === 'string' && v) { try { v = JSON.parse(v); } catch (e) { v = []; } }
      if (v !== '' && v !== null) o[h[c]] = v;
    }
    out.push(o);
  }
  return out;
}
function rowIndexById_(sh, id) {
  const last = sh.getLastRow();
  if (last < 2) return -1;
  const ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(id)) return i + 2;
  return -1;
}
function writeRow_(sh, rec, cols) {
  const h = ensureCols_(sh, Object.keys(rec));
  const row = h.map(function (k) {
    const v = rec[k];
    if (v === undefined || v === null) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return v;
  });
  const idx = rowIndexById_(sh, rec.id);
  if (idx > 0) sh.getRange(idx, 1, 1, row.length).setValues([row]);
  else sh.getRange(sh.getLastRow() + 1, 1, 1, row.length).setValues([row]);
}
function deleteRow_(sh, id) {
  const idx = rowIndexById_(sh, id);
  if (idx > 0) sh.deleteRow(idx);
  return idx > 0;
}

/* ============================== Auth ============================== */

function props_() { return PropertiesService.getScriptProperties(); }
function secret_() {
  let s = props_().getProperty('SECRET');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); props_().setProperty('SECRET', s); }
  return s;
}
function sign_(payload) {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(payload, secret_()));
}
function makeToken_(u) {
  const payload = [u.id, Date.now() + TOKEN_DAYS * 864e5, Number(u.tv) || 0].join('|');
  return Utilities.base64EncodeWebSafe(payload) + '.' + sign_(payload);
}
function auth_(token) {
  if (!token) fail_('Sign in required', 'AUTH');
  const parts = String(token).split('.');
  let payload;
  try { payload = Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString(); }
  catch (e) { fail_('Invalid session', 'AUTH'); }
  if (sign_(payload) !== parts[1]) fail_('Invalid session', 'AUTH');
  const p = payload.split('|');
  if (Date.now() > Number(p[1])) fail_('Session expired', 'AUTH');
  const u = users_().filter(function (x) { return x.id === p[0]; })[0];
  if (!u || !isActive_(u) || (Number(u.tv) || 0) !== Number(p[2])) fail_('Session ended', 'AUTH');
  return u;
}
function hash_(password, salt) {
  let h = salt + '|' + password;
  for (let i = 0; i < 300; i++) {
    h = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h + salt, Utilities.Charset.UTF_8));
  }
  return h;
}
function isActive_(u) { return !(u.active === false || String(u.active).toLowerCase() === 'false'); }
function users_() { return readAll_('users', USER_COLS); }
function publicUser_(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role || 'member', dept: u.dept || '', title: u.title || '', color: u.color || '#8b3dff', active: isActive_(u) };
}
function publicUsers_() { return users_().map(publicUser_); }

function login_(req) {
  const email = String(req.email || '').trim().toLowerCase();
  const cache = CacheService.getScriptCache();
  const key = 'login:' + email;
  const tries = Number(cache.get(key) || 0);
  if (tries >= 8) fail_('Too many attempts', 'LOCKED');
  const u = users_().filter(function (x) { return String(x.email).toLowerCase() === email; })[0];
  if (!u || !isActive_(u) || !u.salt || hash_(String(req.password || ''), u.salt) !== u.passwordHash) {
    cache.put(key, String(tries + 1), 600);
    fail_('Wrong email or password', 'BADPASS');
  }
  cache.remove(key);
  return Object.assign({ ok: true, token: makeToken_(u), user: publicUser_(u) }, snapshot_());
}

/* ============================== Data ============================== */

function settings_() {
  try { return JSON.parse(props_().getProperty('SETTINGS') || '{}'); } catch (e) { return {}; }
}
function snapshot_() {
  const data = {};
  COLLECTIONS.forEach(function (c) { data[c] = readAll_(c); });
  return { users: publicUsers_(), settings: settings_(), data: data, now: nowIso_() };
}
function changes_(since) {
  const now = nowIso_();
  if (!since) return Object.assign({ ok: true }, snapshot_());
  // 10s overlap so a write that lands while we read is never missed (merging is idempotent).
  const from = new Date(new Date(since).getTime() - 10000).toISOString();
  const data = {};
  COLLECTIONS.forEach(function (c) {
    data[c] = readAll_(c).filter(function (r) { return String(r.updatedAt || '') > from; });
  });
  const deleted = readAll_('_deleted', ['id', 'collection', 'updatedAt']).filter(function (d) { return String(d.updatedAt || '') > from; });
  return { ok: true, data: data, deleted: deleted, users: publicUsers_(), settings: settings_(), now: now };
}
function batch_(ops, user) {
  if (!Array.isArray(ops) || ops.length > 50) fail_('Bad batch', 'BAD');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const results = [];
    const sheets = {};
    const sh = function (c) { return sheets[c] || (sheets[c] = sheet_(c, BASE_COLS)); };
    // Each op succeeds or fails on its own, so one rejected op can never block the client's queue.
    ops.forEach(function (op) {
      try {
        const col = op.collection;
        if (COLLECTIONS.indexOf(col) < 0) fail_('Unknown collection', 'BAD');
        if (col === 'invoices' && FINANCE_ROLES.indexOf(user.role) < 0) fail_('No access', 'FORBIDDEN');
        if (op.op === 'upsert') {
          const rec = op.record || {};
          if (!rec.id || String(rec.id).length > 40) fail_('Bad id', 'BAD');
          if (JSON.stringify(rec).length > 45000) fail_('Record too large', 'BAD');
          rec.updatedAt = nowIso_();
          rec.updatedBy = user.id;
          if (!rec.createdAt) rec.createdAt = rec.updatedAt;
          if (!rec.createdBy) rec.createdBy = user.id;
          writeRow_(sh(col), rec);
          results.push({ collection: col, record: { id: rec.id, updatedAt: rec.updatedAt } });
        } else if (op.op === 'remove') {
          if (FINANCE_ROLES.indexOf(user.role) < 0 && col !== 'activity') fail_('No access', 'FORBIDDEN');
          if (deleteRow_(sh(col), op.id)) writeRow_(sheet_('_deleted', ['id', 'collection', 'updatedAt']), { id: op.id, collection: col, updatedAt: nowIso_() });
          results.push({ collection: col, removed: op.id });
        } else fail_('Unknown op', 'BAD');
      } catch (err) {
        results.push({ collection: op && op.collection, error: String(err.message || err), code: err.code || 'ERR' });
      }
    });
    SpreadsheetApp.flush();
    return { ok: true, results: results };
  } finally {
    lock.releaseLock();
  }
}

function saveUser_(req, actor) {
  if (actor.role !== 'admin') fail_('Only admins can manage the team', 'FORBIDDEN');
  const input = req.user || {};
  const email = String(input.email || '').trim().toLowerCase();
  if (!input.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail_('Name and a valid email are required', 'BAD');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const all = users_();
    if (all.some(function (u) { return u.email.toLowerCase() === email && u.id !== input.id; })) fail_('This email is already used', 'BAD');
    const existing = all.filter(function (u) { return u.id === input.id; })[0];
    const rec = existing ? Object.assign({}, existing) : { id: String(input.id || 'U-' + Utilities.getUuid().slice(0, 8)).toUpperCase(), createdAt: nowIso_(), tv: 0 };
    ['name', 'title', 'dept', 'color'].forEach(function (k) { if (input[k] !== undefined) rec[k] = String(input[k]); });
    rec.email = email;
    rec.role = ['admin', 'manager', 'member'].indexOf(input.role) >= 0 ? input.role : 'member';
    rec.active = input.active !== false;
    if (rec.id === actor.id) { rec.role = 'admin'; rec.active = true; } // can't lock yourself out
    const password = String(req.password || '');
    if (!existing && password.length < 8) fail_('Password must be at least 8 characters', 'BAD');
    if (password) {
      if (password.length < 8) fail_('Password must be at least 8 characters', 'BAD');
      rec.salt = Utilities.getUuid();
      rec.passwordHash = hash_(password, rec.salt);
      rec.tv = (Number(rec.tv) || 0) + 1;
    }
    rec.updatedAt = nowIso_();
    writeRow_(sheet_('users', USER_COLS), rec);
    SpreadsheetApp.flush();
    return { ok: true, users: publicUsers_() };
  } finally {
    lock.releaseLock();
  }
}

function saveSettings_(s, actor) {
  if (actor.role !== 'admin') fail_('Only admins can change settings', 'FORBIDDEN');
  const allowed = ['agency', 'currency', 'vat', 'address', 'phone', 'email', 'taxId', 'invPrefix', 'website'];
  const cur = settings_();
  allowed.forEach(function (k) { if (s && s[k] !== undefined) cur[k] = s[k]; });
  props_().setProperty('SETTINGS', JSON.stringify(cur));
  return { ok: true, settings: cur };
}

function changePassword_(req, user) {
  if (hash_(String(req.current || ''), user.salt) !== user.passwordHash) fail_('Wrong password', 'BADPASS');
  const next = String(req.next || '');
  if (next.length < 8) fail_('Password must be at least 8 characters', 'BAD');
  const rec = Object.assign({}, user, { salt: Utilities.getUuid() });
  rec.passwordHash = hash_(next, rec.salt);
  rec.tv = (Number(rec.tv) || 0) + 1; // signs out other devices
  rec.updatedAt = nowIso_();
  writeRow_(sheet_('users', USER_COLS), rec);
  return { ok: true, token: makeToken_(rec) };
}

/* ============================== Website → CRM ============================== */
/*
 * The WAV website can post contact-form / pulse-check leads here:
 *   fetch(WEB_APP_URL, { method: 'POST', body: JSON.stringify({
 *     action: 'websiteLead', key: WEBSITE_KEY,
 *     name, contact, company, service, message, planId, pulseScore, lang }) })
 * Call it from the website's server (src/server/lib/leadStore.ts) so the key stays private.
 */
const SERVICE_KEYS = {
  'strategy & brand': 'strategy', 'content & creative': 'content', 'media & performance': 'media', 'technology & development': 'tech',
  'digital experience': 'digital', 'growth & analytics': 'growth', 'print & production': 'print', 'business experience consulting': 'consulting',
};
function websiteLead_(req) {
  const key = props_().getProperty('WEBSITE_KEY');
  if (!key || req.key !== key) fail_('Forbidden', 'FORBIDDEN');
  if (req.website) return { ok: true }; // honeypot
  const cache = CacheService.getScriptCache();
  const n = Number(cache.get('wl') || 0);
  if (n > 30) fail_('Slow down', 'LOCKED');
  cache.put('wl', String(n + 1), 60);

  const name = String(req.name || '').trim().slice(0, 80);
  const contact = String(req.contact || '').trim().slice(0, 120);
  if (name.length < 2 || contact.length < 5) fail_('Name and contact are required', 'BAD');
  const isEmail = contact.indexOf('@') > 0;
  let service = String(req.service || '').trim();
  service = SERVICE_KEYS[service.toLowerCase()] || (Object.keys(SERVICE_KEYS).map(function (k) { return SERVICE_KEYS[k]; }).indexOf(service) >= 0 ? service : '');
  const now = nowIso_();
  const lead = {
    id: 'L-W' + Utilities.getUuid().slice(0, 8).toUpperCase(),
    name: name, company: String(req.company || '').slice(0, 120),
    phone: isEmail ? '' : contact, email: isEmail ? contact : '',
    source: req.planId ? 'pulse' : 'website', service: service, stage: 'new', value: 0,
    notes: String(req.message || '').slice(0, 2000), planId: String(req.planId || '').slice(0, 20),
    pulseScore: Number(req.pulseScore) || '', followUp: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    createdAt: now, updatedAt: now, createdBy: 'website', updatedBy: 'website',
  };
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    writeRow_(sheet_('leads', BASE_COLS), lead);
    writeRow_(sheet_('activity', BASE_COLS), { id: 'A-W' + Utilities.getUuid().slice(0, 8).toUpperCase(), type: 'create', entity: 'leads', entityId: lead.id, text: 'created', name: name, by: 'website', at: now, createdAt: now, updatedAt: now });
  } finally {
    lock.releaseLock();
  }
  return { ok: true };
}

/* ============================== Setup helpers (run from the editor) ============================== */

function setup() {
  COLLECTIONS.forEach(function (c) { sheet_(c, BASE_COLS); });
  sheet_('users', USER_COLS);
  sheet_('_deleted', ['id', 'collection', 'updatedAt']);
  secret_();
  if (!props_().getProperty('WEBSITE_KEY')) props_().setProperty('WEBSITE_KEY', Utilities.getUuid().replace(/-/g, ''));
  if (!props_().getProperty('SETTINGS')) props_().setProperty('SETTINGS', JSON.stringify({ agency: 'WAV Marketing Agency', currency: 'EGP', vat: 14, address: 'Egypt', invPrefix: 'WAV', website: 'www.wavagency.com' }));
  const def = ss_().getSheetByName('Sheet1') || ss_().getSheetByName('ورقة1');
  if (def && ss_().getSheets().length > 1) ss_().deleteSheet(def);

  const users = users_();
  if (!users.length) {
    const pass = tempPassword_();
    const salt = Utilities.getUuid();
    writeRow_(sheet_('users', USER_COLS), { id: 'U-ADMIN', name: ADMIN_NAME, email: ADMIN_EMAIL.toLowerCase(), role: 'admin', dept: 'management', title: 'Admin', color: '#8b3dff', active: true, salt: salt, passwordHash: hash_(pass, salt), tv: 0, createdAt: nowIso_(), updatedAt: nowIso_() });
    Logger.log('✅ Admin created → email: ' + ADMIN_EMAIL + '   temporary password: ' + pass);
  } else {
    Logger.log('Users already exist — nothing changed. Run resetAdminPassword if you are locked out.');
  }
  Logger.log('🔑 Website key: ' + props_().getProperty('WEBSITE_KEY'));
  Logger.log('Next: Deploy → New deployment → Web app (Execute as: Me, Access: Anyone) and paste the URL into the CRM.');
}

function resetAdminPassword() {
  const u = users_().filter(function (x) { return String(x.email).toLowerCase() === ADMIN_EMAIL.toLowerCase(); })[0];
  if (!u) { Logger.log('No user with ' + ADMIN_EMAIL + '. Run setup first.'); return; }
  const pass = tempPassword_();
  const rec = Object.assign({}, u, { salt: Utilities.getUuid(), role: 'admin', active: true, tv: (Number(u.tv) || 0) + 1, updatedAt: nowIso_() });
  rec.passwordHash = hash_(pass, rec.salt);
  writeRow_(sheet_('users', USER_COLS), rec);
  Logger.log('✅ New temporary password for ' + ADMIN_EMAIL + ': ' + pass);
}

function showWebsiteKey() { Logger.log('Website key: ' + props_().getProperty('WEBSITE_KEY')); }

function tempPassword_() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let s = '';
  for (let i = 0; i < 12; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}
