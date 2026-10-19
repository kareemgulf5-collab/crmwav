/* ==========================================================================
   Views — dashboard, leads, clients, projects, tasks, calendar,
   invoices, team, reports, settings + entity drawers and editors
   ========================================================================== */

/* ---------- Schemas ---------- */
const SCHEMA = {
  leads: [
    { k: 'name', req: true }, { k: 'company' }, { k: 'phone', type: 'tel' }, { k: 'email', type: 'email' },
    { k: 'source', type: 'enum', e: 'source' }, { k: 'service', type: 'enum', e: 'service' },
    { k: 'value', type: 'number' }, { k: 'stage', type: 'enum', e: 'stage', req: true },
    { k: 'owner', type: 'user' }, { k: 'followUp', type: 'date' },
    { k: 'industry', type: 'enum', e: 'industry' }, { k: 'city' },
    { k: 'notes', type: 'textarea' },
  ],
  clients: [
    { k: 'name', req: true }, { k: 'industry', type: 'enum', e: 'industry' }, { k: 'contact' }, { k: 'phone', type: 'tel' },
    { k: 'email', type: 'email' }, { k: 'website' }, { k: 'status', type: 'enum', e: 'clientStatus', req: true }, { k: 'manager', type: 'user' },
    { k: 'retainer', type: 'number' }, { k: 'since', type: 'date' }, { k: 'services', type: 'multi', e: 'service' },
    { k: 'color', type: 'color', full: true }, { k: 'notes', type: 'textarea' },
  ],
  projects: [
    { k: 'name', req: true, full: true }, { k: 'clientId', type: 'client', label: 'f.client', req: true }, { k: 'service', type: 'enum', e: 'service' },
    { k: 'status', type: 'enum', e: 'projectStatus', req: true }, { k: 'owner', type: 'user' }, { k: 'start', type: 'date' }, { k: 'due', type: 'date' },
    { k: 'budget', type: 'number' }, { k: 'progress', type: 'number' }, { k: 'notes', type: 'textarea' },
  ],
  tasks: [
    { k: 'title', req: true, full: true }, { k: 'projectId', type: 'project', label: 'f.project' }, { k: 'clientId', type: 'client', label: 'f.client' },
    { k: 'assignee', type: 'user' }, { k: 'status', type: 'enum', e: 'taskStatus', req: true }, { k: 'priority', type: 'enum', e: 'priority', req: true },
    { k: 'due', type: 'date' }, { k: 'notes', type: 'textarea' },
  ],
  content: [
    { k: 'title', req: true, full: true }, { k: 'clientId', type: 'client', label: 'f.client', req: true }, { k: 'platform', type: 'enum', e: 'platform', req: true },
    { k: 'format', type: 'enum', e: 'format', req: true }, { k: 'date', type: 'date', req: true }, { k: 'time', type: 'time' },
    { k: 'status', type: 'enum', e: 'contentStatus', req: true }, { k: 'assignee', type: 'user' },
    { k: 'caption', type: 'textarea' }, { k: 'link', type: 'url', full: true },
  ],
  users: [
    { k: 'name', req: true }, { k: 'email', type: 'email', req: true }, { k: 'title', label: 'f.jobTitle' }, { k: 'dept', type: 'enum', e: 'dept' },
    { k: 'role', type: 'enum', e: 'role', req: true }, { k: 'active', type: 'bool' }, { k: 'color', type: 'color', full: true },
  ],
};
const ENT_KEY = { leads: 'lead', clients: 'client', projects: 'project', tasks: 'task', content: 'content', invoices: 'invoice', users: 'member' };

function newDefaults(col) {
  const T = today();
  switch (col) {
    case 'leads': return { stage: 'new', source: '', owner: me().id, followUp: addDays(T, 1), value: 0 };
    case 'clients': return { status: 'onboarding', manager: me().id, since: T, color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)], services: [], retainer: 0 };
    case 'projects': return { status: 'brief', owner: me().id, start: T, due: addDays(T, 21), progress: 0 };
    case 'tasks': return { status: 'todo', priority: 'medium', assignee: me().id, due: addDays(T, 2) };
    case 'content': return { status: 'idea', platform: 'instagram', format: 'post', date: T, time: '19:00', assignee: me().id };
    default: return {};
  }
}

/* ---------- Generic editor ---------- */
ACT.newRecord = (el) => { closeMenu(); editRecord(el.dataset.col, null, el.dataset.defaults ? JSON.parse(el.dataset.defaults) : {}); };
ACT.editRecord = (el) => editRecord(el.dataset.col, el.dataset.id);
function editRecord(col, id, defaults = {}) {
  if (col === 'invoices') return editInvoice(id, defaults);
  if (col === 'users') return editMember(id);
  const existing = id ? Store.get(col, id) : null;
  const rec = existing ? { ...existing } : { ...newDefaults(col), ...defaults };
  const key = ENT_KEY[col];
  openModal({
    title: t((existing ? 'edit.' : 'new.') + key),
    body: `<form id="recForm" novalidate>${formHTML(SCHEMA[col], rec)}</form>`,
    foot: `${existing && can.remove() ? `<button class="btn btn--danger btn--sm" data-act="deleteRecord" data-col="${col}" data-id="${esc(id)}">${icon('trash')}${t('act.delete')}</button><span class="spacer"></span>` : ''}
      <button class="btn btn--ghost" data-act="closeModal">${t('act.cancel')}</button>
      <button class="btn" data-primary data-act="saveRecord" data-col="${col}" data-id="${esc(id || '')}">${icon('check')}${t('act.save')}</button>`,
    onMount(m) {
      $('#recForm', m).addEventListener('submit', (e) => { e.preventDefault(); $('[data-primary]', m).click(); });
      const proj = $('[name="projectId"]', m);
      if (proj) proj.addEventListener('change', () => { const p = projectById(proj.value); if (p) $('[name="clientId"]', m).value = p.clientId; });
    },
  });
}
ACT.saveRecord = async (el) => {
  const col = el.dataset.col, id = el.dataset.id;
  const data = readForm($('#recForm'), SCHEMA[col]);
  if (!data) return toast(t('msg.required'), { err: true });
  const existing = id ? Store.get(col, id) : null;
  const prev = existing ? { ...existing } : {};
  closeModal();
  if (col === 'tasks' && data.projectId && !data.clientId) data.clientId = projectById(data.projectId)?.clientId || '';
  if (col === 'leads' && existing && prev.stage !== data.stage) {
    Store.save(col, { ...existing, ...data, stage: prev.stage });
    await setLeadStage(Store.get('leads', id), data.stage);
    return;
  }
  const rec = { ...(existing || {}), ...data };
  let log = null;
  if (!existing) log = { type: 'create', text: 'created', extra: { name: data.name || data.title } };
  if (col === 'leads' && !existing) { if (data.stage === 'won') rec.wonAt = today(); if (data.stage === 'lost') rec.lostAt = today(); }
  if (col === 'tasks' && prev.status !== 'done' && data.status === 'done') { rec.doneAt = today(); if (existing) log = { type: 'done', text: 'done', extra: { name: data.title } }; }
  if (col === 'tasks' && data.status !== 'done') rec.doneAt = '';
  if (col === 'content' && prev.status !== 'published' && data.status === 'published') log = { type: 'publish', text: 'published', extra: { name: clientById(data.clientId)?.name } };
  if (col === 'projects' && prev.status !== 'delivered' && data.status === 'delivered' && existing) log = { type: 'delivered', text: 'delivered', extra: { name: data.name } };
  const saved = Store.save(col, rec, { log: log ? { ...log, extra: log.extra } : null });
  toast(t('msg.saved'));
  if (!existing && col === 'leads') openLead(saved.id);
  if (!existing && col === 'clients') openClient(saved.id);
  if (!existing && col === 'projects') openProject(saved.id);
};
ACT.deleteRecord = async (el) => {
  const col = el.dataset.col, id = el.dataset.id;
  const rec = Store.get(col, id);
  if (!rec) return;
  closeModal();
  const ok = await confirmBox(t('msg.deleteQ', { name: rec.name || rec.title || rec.number || id }));
  if (!ok) return;
  const removed = Store.remove(col, id);
  closeDrawer();
  toast(t('msg.deleted'), { undo: () => Store.restore(col, removed) });
};

function openEntity(kind, id) {
  const map = { lead: openLead, client: openClient, project: openProject, invoice: openInvoice, task: (x) => editRecord('tasks', x), content: (x) => editRecord('content', x) };
  map[kind]?.(id);
}
ACT.open = (el) => openEntity(el.dataset.kind, el.dataset.id);

/* ---------- Shared bits ---------- */
const emptyHTML = (msg = t('msg.empty')) => `<div class="empty"><svg class="wave-empty" viewBox="0 0 120 36"><path d="M2 18 C 14 18 18 4 30 4 S 46 32 60 32 74 4 90 4 106 18 118 18" fill="none" stroke="url(#gWave)" stroke-width="3" stroke-linecap="round"/></svg><span>${msg}</span></div>`;
const searchBox = (filter, ph) => `<label class="search">${icon('search')}<input class="input" type="search" data-filter="${filter}" value="${esc(UI[filter.split('.')[0]]?.[filter.split('.')[1]] || '')}" placeholder="${ph}" /></label>`;
const selectFilter = (filter, values, labeler, empty) => `<select class="input" data-filter="${filter}">${optList(values, labeler, UI[filter.split('.')[0]]?.[filter.split('.')[1]] || '', empty)}</select>`;
const seg = (setKey, cur, opts) => `<div class="seg">${opts.map(([v, lab, ic]) => `<button class="${cur === v ? 'is-on' : ''}" data-act="set" data-set="${setKey}" data-val="${v}">${ic ? icon(ic) : ''}${lab}</button>`).join('')}</div>`;
const match = (q, ...fields) => !q || fields.some((f) => String(f || '').toLowerCase().includes(q.toLowerCase()));
const waLink = (phone) => { let d = String(phone || '').replace(/\D/g, ''); if (d.startsWith('0') && d.length === 11) d = '2' + d; return d ? `https://wa.me/${d}` : ''; };
const quickContact = (r) => `<div class="quick">
  ${r.phone ? `<a class="wa" href="${waLink(r.phone)}" target="_blank" rel="noopener">${icon('wa')}${t('act.whatsapp')}</a><a href="tel:${esc(r.phone)}">${icon('phone')}${t('act.call')}</a>` : ''}
  ${r.email ? `<a href="mailto:${esc(r.email)}">${icon('mail')}${t('act.email')}</a>` : ''}</div>`;
function sparkline(values, color = 'url(#gArea)') {
  const max = Math.max(1, ...values), n = values.length;
  const pts = values.map((v, i) => [(i / Math.max(1, n - 1)) * 80, 28 - (v / max) * 24]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  return `<svg class="kpi__spark" viewBox="0 0 80 30" aria-hidden="true"><path d="${d} L80 30 L0 30Z" fill="url(#gFill)"/><path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/></svg>`;
}
const waveSVG = (c) => `<svg class="col__wave" viewBox="0 0 120 6" preserveAspectRatio="none" aria-hidden="true"><path d="M0 3 Q 7.5 0 15 3 T 30 3 T 45 3 T 60 3 T 75 3 T 90 3 T 105 3 T 120 3" fill="none" stroke="${c}" stroke-width="1.5" opacity=".7"/></svg>`;

/* Drag & drop for boards and calendar */
function enableDnD(root, { item, zone, onDrop }) {
  let dragId = null;
  $$(item, root).forEach((el) => {
    el.draggable = true;
    el.addEventListener('dragstart', (e) => { dragId = el.dataset.id; el.classList.add('is-dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', dragId); } catch (x) {} });
    el.addEventListener('dragend', () => { el.classList.remove('is-dragging'); $$('.is-over', root).forEach((z) => z.classList.remove('is-over')); });
  });
  $$(zone, root).forEach((z) => {
    z.addEventListener('dragover', (e) => { if (!dragId) return; e.preventDefault(); z.classList.add('is-over'); });
    z.addEventListener('dragleave', (e) => { if (!z.contains(e.relatedTarget)) z.classList.remove('is-over'); });
    z.addEventListener('drop', (e) => { e.preventDefault(); z.classList.remove('is-over'); if (dragId) onDrop(dragId, z.dataset.zone); dragId = null; });
  });
}

/* ---------- Activity feed ---------- */
function entityName(a) {
  switch (a.entity) {
    case 'leads': return Store.get('leads', a.entityId)?.name || a.name;
    case 'clients': return clientById(a.entityId)?.name || a.name;
    case 'projects': return projectById(a.entityId)?.name || a.name;
    case 'tasks': return Store.get('tasks', a.entityId)?.title || a.name;
    case 'content': { const c = Store.get('content', a.entityId); return clientById(c?.clientId)?.name || a.name; }
    case 'invoices': return Store.get('invoices', a.entityId)?.number || a.name;
    default: return a.name;
  }
}
function activityText(a) {
  const name = `<b>${esc(entityName(a) || '—')}</b>`;
  switch (a.type) {
    case 'create': return t({ clients: 'clients.created', projects: 'projects.created' }[a.entity] || 'leads.created', { name });
    case 'stage': return t('leads.stageMoved', { name, stage: `<b>${esc(label('stage', a.text))}</b>` });
    case 'note': return t('leads.noted', { name });
    case 'done': return t('tasks.done', { name });
    case 'publish': return t('cal.published', { name });
    case 'paid': return t('inv.paidLog', { name });
    case 'convert': return t('leads.converted', { name });
    case 'delivered': return t('projects.delivered', { name });
    default: return name;
  }
}
const KIND_OF = { leads: 'lead', clients: 'client', projects: 'project', tasks: 'task', content: 'content', invoices: 'invoice' };
function feedHTML(list, { notes = true } = {}) {
  if (!list.length) return emptyHTML();
  return `<ul class="feed">${list.map((a) => `<li>${avatar(userById(a.by), 'avatar--sm')}<div style="min-width:0;flex:1">
    <p ${a.entity && a.entity !== 'invoices' || can.finance() ? `data-act="open" data-kind="${KIND_OF[a.entity] || ''}" data-id="${esc(a.entityId)}" style="cursor:pointer"` : ''}><b>${esc(userById(a.by)?.name || '—')}</b> ${activityText(a)}</p>
    <small>${ago(a.at)}</small>${notes && a.type === 'note' ? `<div class="note">${esc(a.text)}</div>` : ''}</div></li>`).join('')}</ul>`;
}

/* ==========================================================================
   DASHBOARD
   ========================================================================== */
VIEWS.dashboard = {
  title: () => t('nav.dashboard'),
  render() {
    const p = agencyPulse();
    const u = me();
    const h = new Date().getHours();
    const hello = t(h < 12 ? 'dash.hello.morning' : h < 17 ? 'dash.hello.afternoon' : 'dash.hello.evening');
    const T = today(), mStart = `${thisMonth()}-01`;
    const open = openLeads();
    const won = wonIn(mStart, T);
    const months = Array.from({ length: 6 }, (_, i) => shiftMonth(thisMonth(), i - 5));
    const wonByMonth = months.map((m) => sum(DB.leads.filter((l) => l.stage === 'won' && monthKey(l.wonAt) === m), (l) => l.value));
    const outstanding = DB.invoices.filter((i) => ['sent', 'overdue'].includes(invStatus(i)));
    const overdue = outstanding.filter((i) => invStatus(i) === 'overdue');
    const revByMonth = months.map((m) => sum(DB.invoices.filter((i) => i.status === 'paid' && monthKey(i.paidAt) === m), invTotal));

    const kpis = [
      { i: 'leads', l: t('kpi.pipeline'), v: money(sum(open, (l) => l.value), true), m: t('kpi.deals', { n: open.length }), spark: months.map((m) => DB.leads.filter((l) => monthKey(dayOf(l.createdAt)) === m).length) },
      { i: 'target', l: t('kpi.won'), v: money(sum(won, (l) => l.value), true), m: t('kpi.wonDeals', { n: won.length }), spark: wonByMonth },
      can.finance()
        ? { i: 'repeat', l: t('kpi.mrr'), v: money(mrr(), true), m: t('kpi.clients', { n: DB.clients.filter((c) => c.status === 'active').length }), spark: revByMonth }
        : { i: 'clients', l: t('nav.clients'), v: String(activeClients().length), m: t('kpi.clients', { n: activeClients().length }) },
      can.finance()
        ? { i: 'money', l: t('kpi.outstanding'), v: money(sum(outstanding, invTotal), true), m: overdue.length ? `<b class="down">${t('kpi.overdue', { n: overdue.length })}</b>` : `<b>${t('kpi.allPaid')}</b>` }
        : { i: 'tasks', l: t('tasks.mine'), v: String(DB.tasks.filter((tk) => tk.assignee === u.id && tk.status !== 'done').length), m: '' },
    ];

    const focus = focusItems();
    const stageRows = OPEN_STAGES.map((s) => { const ls = DB.leads.filter((l) => l.stage === s); return { s, n: ls.length, v: sum(ls, (l) => l.value) }; });
    const maxStage = Math.max(1, ...stageRows.map((r) => r.v));
    const newByMonth = months.map((m) => DB.leads.filter((l) => monthKey(dayOf(l.createdAt)) === m).length);
    const wonCountByMonth = months.map((m) => DB.leads.filter((l) => l.stage === 'won' && monthKey(l.wonAt) === m).length);
    const maxBar = Math.max(1, ...newByMonth, ...wonCountByMonth);
    const srcCounts = ENUM.source.map((s) => [s, DB.leads.filter((l) => l.source === s).length]).filter(([, n]) => n).sort((a, b) => b[1] - a[1]);
    const srcTotal = Math.max(1, sum(srcCounts, (x) => x[1]));
    let acc = 0;
    const stops = srcCounts.map(([s, n]) => { const a = acc; acc += (n / srcTotal) * 100; return `${COLORS.source[s]} ${a}% ${acc}%`; }).join(',') || '#2a2340 0 100%';
    const upcoming = DB.content.filter((c) => c.date >= T && c.date <= addDays(T, 6)).sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1));
    const clientsHealth = activeClients().map((c) => ({ c, h: clientHealth(c) })).sort((a, b) => ({ bad: 0, warn: 1, good: 2 }[a.h.key] - { bad: 0, warn: 1, good: 2 }[b.h.key])).slice(0, 6);

    return `
      ${isCloud() ? '' : `<div class="banner">${icon('spark')}<span>${t('msg.demoBanner')}</span><a class="btn btn--sm btn--ghost" href="#/settings">${t('msg.connect')}</a></div>`}
      <section class="card pulse">
        <canvas id="pulseCanvas" aria-hidden="true"></canvas>
        <div class="pulse__body">
          <div>
            <div class="pulse__hello">${hello}${LANG === 'ar' ? '،' : ','} ${esc(u.name.split(' ')[0])} — ${fmtDate(T, { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            <h2 class="pulse__title">${t('dash.headline.' + p.level)}</h2>
            <p class="pulse__sub">${t('dash.sub.' + p.level)}</p>
            <div class="pulse__factors">
              <span><b>${p.lateFollow}</b> ${t('dash.f.followups')}</span><span><b>${p.lateTasks}</b> ${t('dash.f.tasks')}</span>
              ${can.finance() ? `<span><b>${p.lateInv}</b> ${t('dash.f.invoices')}</span>` : ''}<span><b>${p.lateContent}</b> ${t('dash.f.content')}</span>
              <span><b>${pct(p.winRate)}</b> ${t('dash.f.win')}</span>
            </div>
          </div>
          <div class="pulse__score"><span>${t('dash.pulse')}</span><b class="num" data-count="${p.score}">${p.score}</b><div class="pulse__level">${icon('pulse')}${t('dash.level.' + p.level)}</div></div>
        </div>
      </section>

      <div class="grid g-4 keep mt">
        ${kpis.map((k) => `<article class="card kpi"><span class="kpi__label">${icon(k.i)}${k.l}</span><b class="kpi__value num">${k.v}</b><div class="kpi__meta">${k.m}</div>${k.spark ? sparkline(k.spark) : ''}</article>`).join('')}
      </div>

      <div class="grid g-main mt">
        <section class="card">
          <div class="card__head"><h3>${icon('flag')}${t('dash.today')}</h3><span class="pill pill--plain">${focus.length}</span></div>
          ${focus.length ? `<ul class="list">${focus.slice(0, 7).map((it) => `<li class="is-click" data-act="open" data-kind="${it.kind}" data-id="${it.id}"><span class="list__icon" style="--c:${it.c}">${icon(it.icon)}</span><div class="list__main"><b>${esc(it.text)}</b><small>${esc(it.sub || '')}</small></div>${dueTag(it.date)}</li>`).join('')}</ul>` : emptyHTML(t('dash.empty.today'))}
        </section>
        <section class="card">
          <div class="card__head"><h3>${icon('leads')}${t('dash.pipeline')}</h3><a class="link" href="#/leads">${t('act.viewAll')}</a></div>
          <ul class="hbars">${stageRows.map((r) => `<li style="--v:${(r.v / maxStage).toFixed(3)};--c:${COLORS.stage[r.s]}"><span>${label('stage', r.s)} · ${r.n}</span><i></i><b class="num">${money(r.v, true)}</b></li>`).join('')}</ul>
        </section>
      </div>

      <div class="grid g-3 mt">
        <section class="card">
          <div class="card__head"><h3>${icon('trend')}${t('dash.trend')}</h3><span style="display:flex;gap:6px"><span class="pill" style="--c:#b06bff"><i></i>${t('dash.newLeads')}</span><span class="pill" style="--c:#c8ff3d"><i></i>${t('dash.wonLeads')}</span></span></div>
          <div class="bars">${months.map((m, i) => `<div class="bars__col"><b class="num">${newByMonth[i]}</b><div class="bars__stack" style="flex-direction:row;align-items:flex-end;gap:4px"><span class="bars__bar" style="--v:${newByMonth[i] / maxBar}"></span><span class="bars__bar bars__bar--alt" style="--v:${wonCountByMonth[i] / maxBar}"></span></div><small>${fmtMonth(m)}</small></div>`).join('')}</div>
        </section>
        <section class="card">
          <div class="card__head"><h3>${icon('target')}${t('dash.sources')}</h3></div>
          <div class="donut-wrap"><div class="donut-center"><div class="donut" style="--stops:${stops}"></div><div><span><b class="num">${DB.leads.length}</b><small>${t('nav.leads')}</small></span></div></div>
          <ul class="legend">${srcCounts.slice(0, 6).map(([s, n]) => `<li style="--c:${COLORS.source[s]}"><i></i>${label('source', s)}<b class="num">${n}</b></li>`).join('')}</ul></div>
        </section>
        <section class="card">
          <div class="card__head"><h3>${icon('cal')}${t('dash.upcoming')}</h3><a class="link" href="#/calendar">${t('act.viewAll')}</a></div>
          ${upcoming.length ? `<ul class="list">${upcoming.slice(0, 6).map((c) => `<li class="is-click" data-act="open" data-kind="content" data-id="${c.id}"><span class="plat" style="--c:${COLORS.platform[c.platform]}">${PLAT_ABBR[c.platform]}</span><div class="list__main"><b>${esc(c.title)}</b><small>${esc(clientById(c.clientId)?.name || '')} · ${relDay(c.date)} <span dir="ltr">${esc(c.time || '')}</span></small></div>${pill('contentStatus', c.status)}</li>`).join('')}</ul>` : emptyHTML(t('dash.empty.content'))}
        </section>
      </div>

      <div class="grid g-main mt">
        <section class="card"><div class="card__head"><h3>${icon('pulse')}${t('dash.activity')}</h3></div>${feedHTML(DB.activity.slice(0, 9))}</section>
        <section class="card">
          <div class="card__head"><h3>${icon('clients')}${t('nav.clients')}</h3><a class="link" href="#/clients">${t('act.viewAll')}</a></div>
          ${clientsHealth.length ? `<ul class="list">${clientsHealth.map(({ c, h }) => `<li class="is-click" data-act="open" data-kind="client" data-id="${c.id}">${clientLogo(c)}<div class="list__main"><b>${esc(c.name)}</b><small>${label('industry', c.industry)}${c.retainer && can.finance() ? ' · ' + money(c.retainer, true) + t('clients.mo') : ''}</small></div><span class="health" style="--c:${h.c}"><i></i>${t('clients.health.' + h.key)}</span></li>`).join('')}</ul>` : emptyHTML()}
        </section>
      </div>`;
  },
  mount(root) {
    const p = agencyPulse();
    const cv = $('#pulseCanvas', root);
    if (cv) startWaves(cv, { lines: 5, clean: clamp((p.score - 20) / 75, 0, 1), amp: 0.55 + (p.score / 100) * 0.5, alpha: 0.6 });
  },
};

/* ==========================================================================
   LEADS
   ========================================================================== */
function filteredLeads() {
  const st = uiState('leads', { mode: 'board', q: '', owner: '', source: '', service: '', sort: 'createdAt', dir: 'desc' });
  return DB.leads.filter((l) => match(st.q, l.name, l.company, l.phone, l.email, l.city) && (!st.owner || l.owner === st.owner) && (!st.source || l.source === st.source) && (!st.service || l.service === st.service));
}
VIEWS.leads = {
  title: () => t('nav.leads'),
  render() {
    const st = uiState('leads', { mode: 'board', q: '', owner: '', source: '', service: '', sort: 'createdAt', dir: 'desc' });
    const leads = filteredLeads();
    const toolbar = `<div class="toolbar">
      ${searchBox('leads.q', t('leads.search'))}
      ${selectFilter('leads.owner', DB.users.map((u) => u.id), (id) => userById(id)?.name, t('leads.allOwners'))}
      ${selectFilter('leads.source', ENUM.source, (s) => label('source', s), t('leads.allSources'))}
      ${selectFilter('leads.service', ENUM.service, (s) => label('service', s), t('leads.allServices'))}
      <span class="grow"></span>
      ${seg('leads.mode', st.mode, [['board', t('leads.board'), 'board'], ['table', t('leads.table'), 'list']])}
      <button class="btn btn--ghost btn--sm" data-act="exportLeads">${icon('download')}${t('act.export')}</button>
      <button class="btn btn--sm" data-act="newRecord" data-col="leads">${icon('plus')}${t('new.lead')}</button></div>`;
    if (st.mode === 'table') return toolbar + leadsTable(leads, st);
    return toolbar + `<div class="board" data-keep-scroll="leads">${ENUM.stage.map((s) => {
      const ls = leads.filter((l) => l.stage === s).sort((a, b) => (a.followUp || '9') < (b.followUp || '9') ? -1 : 1);
      return `<section class="col" style="--c:${COLORS.stage[s]}" data-zone="${s}">
        <div class="col__head"><div class="col__title"><i></i>${label('stage', s)}<span class="n">${ls.length}</span></div><div class="col__sum num">${money(sum(ls, (l) => l.value))}</div>${waveSVG(COLORS.stage[s])}</div>
        <div class="col__body">${ls.map(leadCard).join('')}</div>
        ${OPEN_STAGES.includes(s) ? `<button class="col__add" data-act="newRecord" data-col="leads" data-defaults='${JSON.stringify({ stage: s })}'>${icon('plus')}${t('act.add')}</button>` : ''}
      </section>`;
    }).join('')}</div>`;
  },
  mount(root) {
    enableDnD(root, { item: '.kcard[data-id]', zone: '.col[data-zone]', onDrop: (id, stage) => setLeadStage(Store.get('leads', id), stage) });
  },
  openId: (id) => openLead(id),
};
function leadCard(l) {
  const owner = userById(l.owner);
  return `<article class="kcard" data-id="${l.id}" data-act="open" data-kind="lead">
    <div class="kcard__top"><div><div class="kcard__name">${esc(l.name)}</div><div class="kcard__sub">${esc(l.company || '')}</div></div>${l.value ? `<span class="kcard__value">${money(l.value, true)}</span>` : ''}</div>
    <div class="kcard__meta">${l.service ? `<span class="tag" style="color:${COLORS.service[l.service]}">${esc(label('service', l.service))}</span>` : ''}${l.source ? `<span class="tag">${esc(label('source', l.source))}</span>` : ''}${l.pulseScore ? `<span class="score-badge">${icon('pulse')}${l.pulseScore}</span>` : ''}</div>
    <div class="kcard__foot">${avatar(owner, 'avatar--sm')}${OPEN_STAGES.includes(l.stage) ? dueTag(l.followUp) : l.stage === 'lost' && l.lostReason ? `<span class="tag">${esc(label('lostReason', l.lostReason))}</span>` : l.wonAt ? `<span class="tag">${fmtDate(l.wonAt)}</span>` : ''}</div>
  </article>`;
}
function sortable(view, key, labelTxt, st) {
  const on = st.sort === key;
  return `<th data-act="sortBy" data-view="${view}" data-sort="${key}" class="${on ? 'is-sorted' : ''}">${labelTxt}${on ? (st.dir === 'asc' ? ' ↑' : ' ↓') : ''}</th>`;
}
ACT.sortBy = (el) => {
  const st = UI[el.dataset.view];
  if (st.sort === el.dataset.sort) st.dir = st.dir === 'asc' ? 'desc' : 'asc';
  else { st.sort = el.dataset.sort; st.dir = 'desc'; }
  saveUI();
  renderView();
};
function sortRows(rows, st, getters = {}) {
  const g = getters[st.sort] || ((r) => r[st.sort]);
  return [...rows].sort((a, b) => { const x = g(a) ?? '', y = g(b) ?? ''; const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y)); return st.dir === 'asc' ? c : -c; });
}
function leadsTable(leads, st) {
  if (!leads.length) return `<div class="card">${emptyHTML()}</div>`;
  const rows = sortRows(leads, st, { stage: (l) => ENUM.stage.indexOf(l.stage), owner: (l) => userById(l.owner)?.name || '' });
  return `<div class="table-wrap table-cards"><table class="table"><thead><tr>
    ${sortable('leads', 'name', t('f.name'), st)}${sortable('leads', 'stage', t('f.stage'), st)}${sortable('leads', 'value', t('f.value'), st)}
    ${sortable('leads', 'source', t('f.source'), st)}<th>${t('f.service')}</th>${sortable('leads', 'owner', t('f.owner'), st)}${sortable('leads', 'followUp', t('f.followUp'), st)}${sortable('leads', 'createdAt', t('f.created'), st)}
  </tr></thead><tbody>${rows.map((l) => `<tr data-act="open" data-kind="lead" data-id="${l.id}">
    <td><div class="who"><div><b>${esc(l.name)}</b><small>${esc(l.company || '')}</small></div></div></td>
    <td data-label="${t('f.stage')}">${pill('stage', l.stage)}</td><td data-label="${t('f.value')}" class="num">${money(l.value)}</td>
    <td data-label="${t('f.source')}">${esc(label('source', l.source))}</td><td data-label="${t('f.service')}">${esc(label('service', l.service))}</td>
    <td data-label="${t('f.owner')}">${esc(userById(l.owner)?.name || '—')}</td><td data-label="${t('f.followUp')}">${OPEN_STAGES.includes(l.stage) ? dueTag(l.followUp) : '—'}</td>
    <td data-label="${t('f.created')}">${fmtDate(dayOf(l.createdAt))}</td></tr>`).join('')}</tbody></table></div>`;
}
ACT.exportLeads = () => download(`wav-leads-${today()}.csv`, toCSV(filteredLeads(), [
  { h: 'ID', v: (l) => l.id }, { h: 'Name', v: (l) => l.name }, { h: 'Company', v: (l) => l.company }, { h: 'Phone', v: (l) => l.phone }, { h: 'Email', v: (l) => l.email },
  { h: 'Stage', v: (l) => label('stage', l.stage) }, { h: 'Value', v: (l) => l.value }, { h: 'Source', v: (l) => label('source', l.source) }, { h: 'Service', v: (l) => label('service', l.service) },
  { h: 'Owner', v: (l) => userById(l.owner)?.name }, { h: 'Follow-up', v: (l) => l.followUp }, { h: 'Pulse score', v: (l) => l.pulseScore }, { h: 'Created', v: (l) => dayOf(l.createdAt) },
]));

async function setLeadStage(lead, stage) {
  if (!lead || lead.stage === stage) return;
  const extra = {};
  if (stage === 'lost') {
    const reason = await askLostReason();
    if (!reason) return;
    Object.assign(extra, { lostReason: reason, lostAt: today(), lostFrom: lead.stage });
  } else extra.lostAt = '';
  extra.wonAt = stage === 'won' ? (lead.wonAt || today()) : '';
  Store.save('leads', { ...lead, stage, ...extra }, { log: { type: 'stage', text: stage, extra: { name: lead.name } } });
  if (stage === 'won') burst();
}
function askLostReason() {
  return new Promise((resolve) => {
    openModal({
      title: t('leads.lostTitle'), width: 460,
      body: `<p class="muted" style="margin:0 0 14px">${t('f.lostReason')}</p><div class="reasons">${ENUM.lostReason.map((r) => `<button data-act="pickReason" data-val="${r}" style="--c:${COLORS.lostReason[r]}"><i></i>${label('lostReason', r)}</button>`).join('')}</div>`,
    });
    MODAL_RESOLVE = resolve;
  });
}
ACT.pickReason = (el) => closeModal(el.dataset.val);
function burst() {
  if (reducedMotion) return;
  const b = document.createElement('div');
  b.className = 'burst';
  b.innerHTML = '<i></i><i></i><i></i>';
  document.body.appendChild(b);
  setTimeout(() => b.remove(), 1400);
}

function openLead(id) {
  if (ROUTE.view === 'leads' && ROUTE.id !== id) history.replaceState(null, '', `#/leads/${encodeURIComponent(id)}`), (ROUTE.id = id);
  openDrawer(() => {
    const l = Store.get('leads', id);
    if (!l) return null;
    const idx = ENUM.stage.indexOf(l.stage);
    const notes = DB.activity.filter((a) => a.entity === 'leads' && a.entityId === id);
    const client = l.clientId ? clientById(l.clientId) : null;
    return `${drawerHead(`${t('ent.lead')} · ${esc(l.id)}`, esc(l.name), `<div class="muted" style="margin-top:4px">${esc(l.company || '')}${l.value ? ` · <b class="lime num">${money(l.value)}</b>` : ''}</div>`)}
    <div class="drawer__body">
      <div class="stepper">${ENUM.stage.map((s, i) => `<button style="--c:${COLORS.stage[s]}" class="${s === l.stage ? 'is-on' : i < idx && l.stage !== 'lost' ? 'is-past' : ''}" data-act="leadStage" data-id="${l.id}" data-stage="${s}">${label('stage', s)}</button>`).join('')}</div>
      <div class="quick">${quickContact(l).replace(/^<div class="quick">|<\/div>$/g, '')}
        ${client ? `<button data-act="open" data-kind="client" data-id="${client.id}">${icon('clients')}${t('leads.openClient')}</button>` : `<button data-act="convertLead" data-id="${l.id}">${icon('convert')}${t('act.convert')}</button>`}</div>
      ${l.pulseScore ? `<div class="banner" style="margin:0">${icon('pulse')}<span>${t('leads.fromPulse')} — <b>${t('f.pulse')}: ${l.pulseScore}</b>${l.planId ? ` · ${esc(l.planId)}` : ''}</span></div>` : ''}
      <div class="sect"><h4>${icon('user')}${t('ent.lead')}</h4>${kv([
        [t('f.phone'), l.phone ? `<span dir="ltr">${esc(l.phone)}</span>` : ''], [t('f.email'), esc(l.email)],
        [t('f.source'), esc(label('source', l.source))], [t('f.service'), esc(label('service', l.service))],
        [t('f.owner'), esc(userById(l.owner)?.name || '')], [t('f.followUp'), OPEN_STAGES.includes(l.stage) && l.followUp ? `${fmtDate(l.followUp)} · ${relDay(l.followUp)}` : ''],
        [t('f.industry'), esc(label('industry', l.industry))], [t('f.city'), esc(l.city)],
        l.stage === 'lost' ? [t('f.lostReason'), esc(label('lostReason', l.lostReason))] : null,
        [t('f.created'), `${fmtDate(dayOf(l.createdAt))} · ${esc(userById(l.createdBy)?.name || '')}`],
      ])}</div>
      ${l.notes ? `<div class="sect"><h4>${t('f.notes')}</h4><div class="card" style="padding:14px;white-space:pre-wrap">${esc(l.notes)}</div></div>` : ''}
      <div class="sect"><h4>${icon('clock')}${t('leads.timeline')}</h4>
        <div class="note-box"><textarea class="input" id="noteText" placeholder="${t('leads.notePh')}"></textarea><div class="row"><button class="btn btn--sm" data-act="addNote" data-entity="leads" data-id="${l.id}">${icon('plus')}${t('act.addNote')}</button></div></div>
        <div style="margin-top:14px">${feedHTML(notes)}</div></div>
    </div>
    <div class="drawer__foot">${can.remove() ? `<button class="btn btn--danger btn--sm" data-act="deleteRecord" data-col="leads" data-id="${l.id}">${icon('trash')}</button><span class="spacer"></span>` : ''}
      <button class="btn btn--ghost btn--sm" data-act="editRecord" data-col="leads" data-id="${l.id}">${icon('edit')}${t('act.edit')}</button></div>`;
  });
}
ACT.leadStage = (el) => setLeadStage(Store.get('leads', el.dataset.id), el.dataset.stage);
ACT.addNote = (el) => {
  const ta = $('#noteText');
  const text = ta?.value.trim();
  if (!text) return ta?.focus();
  const rec = Store.get(el.dataset.entity, el.dataset.id);
  logActivity('note', el.dataset.entity, el.dataset.id, text, { name: rec?.name });
  emitChange();
};
ACT.convertLead = (el) => {
  const l = Store.get('leads', el.dataset.id);
  if (!l) return;
  const c = Store.save('clients', {
    name: l.company || l.name, contact: l.name, phone: l.phone, email: l.email, industry: l.industry || 'other',
    services: l.service ? [l.service] : [], status: 'onboarding', manager: l.owner || me().id, since: today(),
    color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)], retainer: 0, notes: l.notes || '', leadId: l.id,
  }, { log: { type: 'create', text: 'created', extra: { name: l.company || l.name } } });
  Store.save('leads', { ...l, clientId: c.id, stage: 'won', wonAt: l.wonAt || today(), lostAt: '' }, { log: { type: 'convert', text: 'convert', extra: { name: l.name } } });
  burst();
  toast(t('leads.convertDone', { name: c.name }));
  openClient(c.id);
};

/* ==========================================================================
   CLIENTS
   ========================================================================== */
VIEWS.clients = {
  title: () => t('nav.clients'),
  render() {
    const st = uiState('clients', { q: '', industry: '', status: '' });
    const list = DB.clients.filter((c) => match(st.q, c.name, c.contact, c.phone, c.email) && (!st.industry || c.industry === st.industry) && (!st.status || c.status === st.status))
      .sort((a, b) => ENUM.clientStatus.indexOf(a.status) - ENUM.clientStatus.indexOf(b.status) || (b.retainer || 0) - (a.retainer || 0));
    const m = thisMonth();
    return `<div class="toolbar">${searchBox('clients.q', t('clients.search'))}
      ${selectFilter('clients.industry', ENUM.industry, (x) => label('industry', x), t('clients.allIndustries'))}
      ${selectFilter('clients.status', ENUM.clientStatus, (x) => label('clientStatus', x), t('clients.allStatus'))}
      <span class="grow"></span><button class="btn btn--ghost btn--sm" data-act="exportClients">${icon('download')}${t('act.export')}</button>
      <button class="btn btn--sm" data-act="newRecord" data-col="clients">${icon('plus')}${t('new.client')}</button></div>
      ${list.length ? `<div class="cards">${list.map((c) => {
        const h = clientHealth(c);
        const active = DB.projects.filter((p) => p.clientId === c.id && !['delivered', 'hold'].includes(p.status)).length;
        const posts = DB.content.filter((x) => x.clientId === c.id && monthKey(x.date) === m).length;
        return `<article class="ccard" style="--c:${esc(c.color || '#8b3dff')}" data-act="open" data-kind="client" data-id="${c.id}">
          <div class="ccard__top">${clientLogo(c, 'avatar--lg')}<div style="min-width:0;flex:1"><b>${esc(c.name)}</b><small>${esc(label('industry', c.industry))}${c.contact ? ' · ' + esc(c.contact) : ''}</small></div></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">${pill('clientStatus', c.status)}<span class="health" style="--c:${h.c}"><i></i>${t('clients.health.' + h.key)}</span></div>
          <div class="kcard__meta">${(c.services || []).map((s) => `<span class="tag" style="color:${COLORS.service[s]}">${esc(label('service', s))}</span>`).join('')}</div>
          <div class="ccard__stats"><div><b class="num">${can.finance() ? money(c.retainer || 0, true) : '—'}</b><small>${t('clients.retainer')}${t('clients.mo')}</small></div><div><b class="num">${active}</b><small>${t('clients.activeProjects')}</small></div><div><b class="num">${posts}</b><small>${t('clients.postsMonth')}</small></div></div>
        </article>`;
      }).join('')}</div>` : `<div class="card">${emptyHTML()}</div>`}`;
  },
  openId: (id) => openClient(id),
};
ACT.exportClients = () => download(`wav-clients-${today()}.csv`, toCSV(DB.clients, [
  { h: 'ID', v: (c) => c.id }, { h: 'Name', v: (c) => c.name }, { h: 'Industry', v: (c) => label('industry', c.industry) }, { h: 'Contact', v: (c) => c.contact }, { h: 'Phone', v: (c) => c.phone },
  { h: 'Email', v: (c) => c.email }, { h: 'Status', v: (c) => label('clientStatus', c.status) }, { h: 'Retainer', v: (c) => c.retainer }, { h: 'Services', v: (c) => (c.services || []).map((s) => label('service', s)) },
  { h: 'Account manager', v: (c) => userById(c.manager)?.name }, { h: 'Since', v: (c) => c.since },
]));

function openClient(id) {
  if (ROUTE.view === 'clients' && ROUTE.id !== id) history.replaceState(null, '', `#/clients/${encodeURIComponent(id)}`), (ROUTE.id = id);
  const tabState = { tab: 'projects' };
  ACT.clientTab = (el) => { tabState.tab = el.dataset.tab; DRAWER.refresh(); };
  openDrawer(() => {
    const c = clientById(id);
    if (!c) return null;
    const projects = DB.projects.filter((p) => p.clientId === id);
    const content = DB.content.filter((x) => x.clientId === id).sort((a, b) => (a.date < b.date ? 1 : -1));
    const invoices = DB.invoices.filter((i) => i.clientId === id).sort((a, b) => (a.issue < b.issue ? 1 : -1));
    const ids = new Set([id, ...projects.map((p) => p.id), ...content.map((x) => x.id), ...invoices.map((i) => i.id)]);
    if (c.leadId) ids.add(c.leadId);
    const acts = DB.activity.filter((a) => ids.has(a.entityId));
    const billed = sum(invoices.filter((i) => i.status !== 'cancelled' && i.status !== 'draft'), invTotal);
    const paid = sum(invoices.filter((i) => i.status === 'paid'), invTotal);
    const tabs = [['projects', t('clients.tab.projects'), projects.length], ['content', t('clients.tab.content'), content.length]];
    if (can.finance()) tabs.push(['invoices', t('clients.tab.invoices'), invoices.length]);
    tabs.push(['activity', t('clients.tab.activity'), acts.length]);
    const tab = tabState.tab;
    let tabBody = '';
    if (tab === 'projects') tabBody = `<div class="quick" style="margin:12px 0"><button data-act="newRecord" data-col="projects" data-defaults='${JSON.stringify({ clientId: id })}'>${icon('plus')}${t('new.project')}</button></div>` + (projects.length ? `<ul class="list">${projects.map((p) => `<li class="is-click" data-act="open" data-kind="project" data-id="${p.id}"><span class="list__icon" style="--c:${COLORS.projectStatus[p.status]}">${icon('projects')}</span><div class="list__main"><b>${esc(p.name)}</b><small>${label('service', p.service)} · ${pct(projectProgress(p))}</small></div>${pill('projectStatus', p.status)}</li>`).join('')}</ul>` : emptyHTML());
    if (tab === 'content') tabBody = `<div class="quick" style="margin:12px 0"><button data-act="newRecord" data-col="content" data-defaults='${JSON.stringify({ clientId: id })}'>${icon('plus')}${t('new.content')}</button></div>` + (content.length ? `<ul class="list">${content.slice(0, 30).map((x) => `<li class="is-click" data-act="open" data-kind="content" data-id="${x.id}"><span class="plat" style="--c:${COLORS.platform[x.platform]}">${PLAT_ABBR[x.platform]}</span><div class="list__main"><b>${esc(x.title)}</b><small>${fmtDate(x.date)} · ${label('format', x.format)}</small></div>${pill('contentStatus', x.status)}</li>`).join('')}</ul>` : emptyHTML());
    if (tab === 'invoices') tabBody = `<div class="quick" style="margin:12px 0"><button data-act="newRecord" data-col="invoices" data-defaults='${JSON.stringify({ clientId: id })}'>${icon('plus')}${t('new.invoice')}</button></div>` + (invoices.length ? `<ul class="list">${invoices.map((i) => `<li class="is-click" data-act="open" data-kind="invoice" data-id="${i.id}"><span class="list__icon" style="--c:${COLORS.invoiceStatus[invStatus(i)]}">${icon('invoice')}</span><div class="list__main"><b>${esc(i.number)}</b><small>${fmtDate(i.issue)}</small></div><b class="num">${money(invTotal(i))}</b>${pill('invoiceStatus', invStatus(i))}</li>`).join('')}</ul>` : emptyHTML());
    if (tab === 'activity') tabBody = `<div style="margin-top:12px">${feedHTML(acts.slice(0, 30))}</div>`;
    return `${drawerHead(`${t('ent.client')} · ${label('industry', c.industry)}`, `<span style="display:flex;align-items:center;gap:12px">${clientLogo(c, 'avatar--lg')}${esc(c.name)}</span>`, `<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">${pill('clientStatus', c.status)}${(c.services || []).map((s) => `<span class="tag" style="color:${COLORS.service[s]}">${esc(label('service', s))}</span>`).join('')}</div>`)}
      <div class="drawer__body">
        ${quickContact(c)}
        ${can.finance() ? `<div class="grid g-3 keep" style="grid-template-columns:repeat(3,minmax(0,1fr));gap:10px">${[[t('clients.retainer') + t('clients.mo'), money(c.retainer || 0, true)], [t('clients.billed'), money(billed, true)], [t('clients.paid'), money(paid, true)]].map(([k, v]) => `<div class="card kpi" style="padding:14px"><span class="kpi__label">${k}</span><b class="kpi__value num" style="font-size:1.4rem">${v}</b></div>`).join('')}</div>` : ''}
        <div class="sect">${kv([[t('f.contact'), esc(c.contact)], [t('f.phone'), c.phone ? `<span dir="ltr">${esc(c.phone)}</span>` : ''], [t('f.email'), esc(c.email)], [t('f.website'), esc(c.website)], [t('f.manager'), esc(userById(c.manager)?.name || '')], [t('f.since'), fmtDate(c.since)]])}</div>
        ${c.notes ? `<div class="sect"><h4>${t('f.notes')}</h4><div class="card" style="padding:14px;white-space:pre-wrap">${esc(c.notes)}</div></div>` : ''}
        <div class="sect"><div class="tabs">${tabs.map(([k, l, n]) => `<button class="${tab === k ? 'is-on' : ''}" data-act="clientTab" data-tab="${k}">${l}<span class="n">${n}</span></button>`).join('')}</div>${tabBody}</div>
      </div>
      <div class="drawer__foot">${can.remove() ? `<button class="btn btn--danger btn--sm" data-act="deleteRecord" data-col="clients" data-id="${c.id}">${icon('trash')}</button><span class="spacer"></span>` : ''}
        <button class="btn btn--ghost btn--sm" data-act="editRecord" data-col="clients" data-id="${c.id}">${icon('edit')}${t('act.edit')}</button></div>`;
  });
}

/* ==========================================================================
   PROJECTS
   ========================================================================== */
VIEWS.projects = {
  title: () => t('nav.projects'),
  render() {
    const st = uiState('projects', { mode: 'board', q: '', client: '', sort: 'due', dir: 'asc' });
    const list = DB.projects.filter((p) => match(st.q, p.name, clientById(p.clientId)?.name) && (!st.client || p.clientId === st.client));
    const toolbar = `<div class="toolbar">${searchBox('projects.q', t('projects.search'))}
      ${selectFilter('projects.client', DB.clients.map((c) => c.id), (id) => clientById(id)?.name, t('projects.allClients'))}<span class="grow"></span>
      ${seg('projects.mode', st.mode, [['board', t('leads.board'), 'board'], ['table', t('leads.table'), 'list']])}
      <button class="btn btn--sm" data-act="newRecord" data-col="projects">${icon('plus')}${t('new.project')}</button></div>`;
    if (st.mode === 'table') {
      if (!list.length) return toolbar + `<div class="card">${emptyHTML()}</div>`;
      const rows = sortRows(list, st, { progress: projectProgress, client: (p) => clientById(p.clientId)?.name || '' });
      return toolbar + `<div class="table-wrap table-cards"><table class="table"><thead><tr>${sortable('projects', 'name', t('f.name'), st)}${sortable('projects', 'client', t('f.client'), st)}<th>${t('f.service')}</th>${sortable('projects', 'status', t('f.status'), st)}${sortable('projects', 'progress', t('f.progress'), st)}<th>${t('f.owner')}</th>${sortable('projects', 'due', t('f.due'), st)}</tr></thead>
        <tbody>${rows.map((p) => `<tr data-act="open" data-kind="project" data-id="${p.id}"><td><b>${esc(p.name)}</b></td><td data-label="${t('f.client')}">${esc(clientById(p.clientId)?.name || '—')}</td><td data-label="${t('f.service')}">${esc(label('service', p.service))}</td><td data-label="${t('f.status')}">${pill('projectStatus', p.status)}</td><td data-label="${t('f.progress')}" class="num">${pct(projectProgress(p))}</td><td data-label="${t('f.owner')}">${esc(userById(p.owner)?.name || '—')}</td><td data-label="${t('f.due')}">${dueTag(p.due, p.status === 'delivered')}</td></tr>`).join('')}</tbody></table></div>`;
    }
    return toolbar + `<div class="board" data-keep-scroll="projects">${ENUM.projectStatus.map((s) => {
      const ps = list.filter((p) => p.status === s).sort((a, b) => ((a.due || '9') < (b.due || '9') ? -1 : 1));
      return `<section class="col" style="--c:${COLORS.projectStatus[s]}" data-zone="${s}"><div class="col__head"><div class="col__title"><i></i>${label('projectStatus', s)}<span class="n">${ps.length}</span></div>${waveSVG(COLORS.projectStatus[s])}</div>
        <div class="col__body">${ps.map((p) => {
          const c = clientById(p.clientId);
          const tasks = DB.tasks.filter((tk) => tk.projectId === p.id);
          return `<article class="kcard" data-id="${p.id}" data-act="open" data-kind="project">
            <div class="kcard__top"><div style="min-width:0"><div class="kcard__name">${esc(p.name)}</div><div class="kcard__sub">${esc(c?.name || '')}</div></div>${clientLogo(c, 'avatar--sm')}</div>
            <div class="kcard__meta">${p.service ? `<span class="tag" style="color:${COLORS.service[p.service]}">${esc(label('service', p.service))}</span>` : ''}${tasks.length ? `<span class="tag">${icon('tasks')}${tasks.filter((x) => x.status === 'done').length}/${tasks.length}</span>` : ''}</div>
            <div class="progress" style="--v:${projectProgress(p).toFixed(3)}"><i></i></div>
            <div class="kcard__foot">${avatar(userById(p.owner), 'avatar--sm')}${dueTag(p.due, p.status === 'delivered')}</div></article>`;
        }).join('')}</div>
        <button class="col__add" data-act="newRecord" data-col="projects" data-defaults='${JSON.stringify({ status: s })}'>${icon('plus')}${t('act.add')}</button></section>`;
    }).join('')}</div>`;
  },
  mount(root) {
    enableDnD(root, {
      item: '.kcard[data-id]', zone: '.col[data-zone]', onDrop: (id, status) => {
        const p = projectById(id);
        if (!p || p.status === status) return;
        Store.save('projects', { ...p, status }, status === 'delivered' ? { log: { type: 'delivered', text: 'delivered', extra: { name: p.name } } } : {});
        if (status === 'delivered') burst();
      },
    });
  },
  openId: (id) => openProject(id),
};
function openProject(id) {
  openDrawer(() => {
    const p = projectById(id);
    if (!p) return null;
    const c = clientById(p.clientId);
    const tasks = DB.tasks.filter((tk) => tk.projectId === id).sort((a, b) => (a.status === 'done') - (b.status === 'done') || ((a.due || '9') < (b.due || '9') ? -1 : 1));
    const prog = projectProgress(p);
    return `${drawerHead(`${t('ent.project')} · ${esc(c?.name || '')}`, esc(p.name), `<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">${pill('projectStatus', p.status)}${p.service ? `<span class="tag" style="color:${COLORS.service[p.service]}">${esc(label('service', p.service))}</span>` : ''}</div>`)}
      <div class="drawer__body">
        <div class="card" style="padding:16px"><div style="display:flex;justify-content:space-between;margin-bottom:10px"><span class="muted">${t('f.progress')}</span><b class="num lime">${pct(prog)}</b></div><div class="kcard"><div class="progress" style="--v:${prog.toFixed(3)};height:8px"><i></i></div></div></div>
        <div class="stepper">${ENUM.projectStatus.map((s) => `<button style="--c:${COLORS.projectStatus[s]}" class="${s === p.status ? 'is-on' : ''}" data-act="projectStatus" data-id="${p.id}" data-status="${s}">${label('projectStatus', s)}</button>`).join('')}</div>
        <div class="sect">${kv([[t('f.client'), c ? `<a data-act="open" data-kind="client" data-id="${c.id}" style="cursor:pointer;color:var(--violet-2)">${esc(c.name)}</a>` : ''], [t('f.owner'), esc(userById(p.owner)?.name || '')], [t('f.start'), fmtDate(p.start)], [t('f.due'), p.due ? `${fmtDate(p.due)} · ${relDay(p.due)}` : ''], can.finance() ? [t('f.budget'), p.budget ? money(p.budget) : ''] : null])}</div>
        ${p.notes ? `<div class="sect"><h4>${t('f.notes')}</h4><div class="card" style="padding:14px;white-space:pre-wrap">${esc(p.notes)}</div></div>` : ''}
        <div class="sect"><h4>${icon('tasks')}${t('projects.tasks')} · ${tasks.filter((x) => x.status === 'done').length}/${tasks.length}</h4>
          <input class="input" id="projTaskIn" placeholder="${t('projects.addTask')}" data-project="${p.id}" />
          <ul class="list checklist" style="margin-top:8px">${tasks.map((tk) => `<li><button class="tick ${tk.status === 'done' ? 'is-on' : ''}" data-act="toggleTask" data-id="${tk.id}" aria-label="done">${icon('check')}</button><div class="list__main" data-act="open" data-kind="task" data-id="${tk.id}" style="cursor:pointer"><b style="${tk.status === 'done' ? 'text-decoration:line-through;color:var(--dim)' : ''}">${esc(tk.title)}</b><small>${esc(userById(tk.assignee)?.name || '')}</small></div>${tk.status !== 'done' ? dueTag(tk.due) : ''}</li>`).join('')}</ul></div>
      </div>
      <div class="drawer__foot">${can.remove() ? `<button class="btn btn--danger btn--sm" data-act="deleteRecord" data-col="projects" data-id="${p.id}">${icon('trash')}</button><span class="spacer"></span>` : ''}
        <button class="btn btn--ghost btn--sm" data-act="editRecord" data-col="projects" data-id="${p.id}">${icon('edit')}${t('act.edit')}</button></div>`;
  }, (d) => {
    const inp = $('#projTaskIn', d);
    inp?.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || !inp.value.trim()) return;
      const p = projectById(inp.dataset.project);
      Store.save('tasks', { title: inp.value.trim(), projectId: p.id, clientId: p.clientId, assignee: p.owner || me().id, status: 'todo', priority: 'medium', due: addDays(today(), 3) });
      setTimeout(() => $('#projTaskIn')?.focus(), 30);
    });
  });
}
ACT.projectStatus = (el) => { const p = projectById(el.dataset.id); if (p && p.status !== el.dataset.status) { Store.save('projects', { ...p, status: el.dataset.status }, el.dataset.status === 'delivered' ? { log: { type: 'delivered', text: 'delivered', extra: { name: p.name } } } : {}); if (el.dataset.status === 'delivered') burst(); } };
ACT.toggleTask = (el) => {
  const tk = Store.get('tasks', el.dataset.id);
  if (!tk) return;
  const done = tk.status !== 'done';
  Store.save('tasks', { ...tk, status: done ? 'done' : 'todo', doneAt: done ? today() : '' }, done ? { log: { type: 'done', text: 'done', extra: { name: tk.title } } } : {});
};

/* ==========================================================================
   TASKS
   ========================================================================== */
VIEWS.tasks = {
  title: () => t('nav.tasks'),
  render() {
    const st = uiState('tasks', { who: 'mine', q: '', client: '' });
    const list = DB.tasks.filter((tk) => (st.who !== 'mine' || tk.assignee === me().id) && match(st.q, tk.title, clientById(tk.clientId)?.name) && (!st.client || tk.clientId === st.client));
    const prioRank = { urgent: 0, high: 1, medium: 2, low: 3 };
    return `<div class="toolbar">${seg('tasks.who', st.who, [['mine', t('tasks.mine'), 'user'], ['all', t('tasks.all'), 'team']])}
      ${searchBox('tasks.q', t('tasks.search'))}${selectFilter('tasks.client', DB.clients.map((c) => c.id), (id) => clientById(id)?.name, t('projects.allClients'))}
      <span class="grow"></span><button class="btn btn--sm" data-act="newRecord" data-col="tasks">${icon('plus')}${t('new.task')}</button></div>
      <input class="input" id="quickTask" placeholder="＋  ${t('tasks.quick')}" style="margin-bottom:16px" />
      <div class="board" data-keep-scroll="tasks" style="grid-auto-columns:minmax(260px,1fr)">${ENUM.taskStatus.map((s) => {
        const ts = list.filter((tk) => tk.status === s).sort((a, b) => s === 'done' ? ((a.doneAt || '') < (b.doneAt || '') ? 1 : -1) : prioRank[a.priority] - prioRank[b.priority] || ((a.due || '9') < (b.due || '9') ? -1 : 1));
        return `<section class="col" style="--c:${COLORS.taskStatus[s]}" data-zone="${s}"><div class="col__head"><div class="col__title"><i></i>${label('taskStatus', s)}<span class="n">${ts.length}</span></div>${waveSVG(COLORS.taskStatus[s])}</div>
          <div class="col__body">${ts.slice(0, s === 'done' ? 25 : 200).map((tk) => {
            const c = clientById(tk.clientId), p = projectById(tk.projectId);
            return `<article class="kcard" data-id="${tk.id}" data-act="open" data-kind="task" style="--c:${COLORS.priority[tk.priority]}"><span class="kcard__prio"></span>
              <div class="kcard__top"><div class="kcard__name" style="${s === 'done' ? 'text-decoration:line-through;color:var(--dim)' : ''}">${esc(tk.title)}</div><button class="tick ${s === 'done' ? 'is-on' : ''}" data-act="toggleTask" data-id="${tk.id}" aria-label="done">${icon('check')}</button></div>
              ${c || p ? `<div class="kcard__sub">${esc([c?.name, p?.name].filter(Boolean).join(' · '))}</div>` : ''}
              <div class="kcard__foot">${avatar(userById(tk.assignee), 'avatar--sm')}<span style="display:flex;gap:6px;align-items:center">${tk.priority === 'urgent' || tk.priority === 'high' ? pill('priority', tk.priority) : ''}${s !== 'done' ? dueTag(tk.due) : ''}</span></div></article>`;
          }).join('')}</div></section>`;
      }).join('')}</div>`;
  },
  mount(root) {
    enableDnD(root, {
      item: '.kcard[data-id]', zone: '.col[data-zone]', onDrop: (id, status) => {
        const tk = Store.get('tasks', id);
        if (!tk || tk.status === status) return;
        Store.save('tasks', { ...tk, status, doneAt: status === 'done' ? today() : '' }, status === 'done' ? { log: { type: 'done', text: 'done', extra: { name: tk.title } } } : {});
      },
    });
    const q = $('#quickTask', root);
    q?.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || !q.value.trim()) return;
      const st = UI.tasks;
      Store.save('tasks', { title: q.value.trim(), status: 'todo', priority: 'medium', assignee: me().id, due: addDays(today(), 2), clientId: st.client || '', projectId: '' });
      setTimeout(() => $('#quickTask')?.focus(), 30);
    });
  },
};
ACT.toggleTaskCard = ACT.toggleTask;

/* ==========================================================================
   CONTENT CALENDAR
   ========================================================================== */
VIEWS.calendar = {
  title: () => t('nav.calendar'),
  render() {
    const st = uiState('calendar', { month: thisMonth(), client: '', platform: '' });
    const [y, m] = st.month.split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const offset = (first.getDay() + 1) % 7; // week starts Saturday
    const start = addDays(toISODate(first), -offset);
    const daysInView = Math.ceil((offset + new Date(y, m, 0).getDate()) / 7) * 7;
    const items = DB.content.filter((c) => (!st.client || c.clientId === st.client) && (!st.platform || c.platform === st.platform));
    const byDay = {};
    items.forEach((c) => (byDay[c.date] = byDay[c.date] || []).push(c));
    const monthItems = items.filter((c) => monthKey(c.date) === st.month);
    const T = today();
    const dows = t('cal.dow').split(',');
    return `<div class="cal-head">
      <button class="icon-btn" data-act="calMove" data-n="-1" aria-label="prev">${icon('left', 'flip')}</button>
      <h2>${fmtMonth(st.month, true)}</h2>
      <button class="icon-btn" data-act="calMove" data-n="1" aria-label="next">${icon('right', 'flip')}</button>
      <button class="btn btn--ghost btn--sm" data-act="calMove" data-n="0">${t('act.today')}</button>
      <span style="flex:1"></span>
      ${selectFilter('calendar.client', DB.clients.map((c) => c.id), (id) => clientById(id)?.name, t('cal.allClients'))}
      ${selectFilter('calendar.platform', ENUM.platform, (p) => label('platform', p), t('cal.allPlatforms'))}
      <button class="btn btn--sm" data-act="newRecord" data-col="content" data-defaults='${JSON.stringify({ clientId: st.client || '' })}'>${icon('plus')}${t('new.content')}</button></div>
      <div class="cal">${dows.map((d) => `<div class="cal__dow">${d}</div>`).join('')}
      ${Array.from({ length: daysInView }, (_, i) => {
        const d = addDays(start, i);
        const list = (byDay[d] || []).sort((a, b) => ((a.time || '') < (b.time || '') ? -1 : 1));
        const out = monthKey(d) !== st.month;
        return `<div class="cal__day ${out ? 'is-out' : ''} ${d === T ? 'is-today' : ''}" data-zone="${d}">
          <span class="cal__n">${Number(d.slice(8))}</span>
          <button class="cal__add" data-act="newRecord" data-col="content" data-defaults='${JSON.stringify({ date: d, clientId: st.client || '' })}' aria-label="add">${icon('plus')}</button>
          ${list.slice(0, 3).map((c) => `<div class="chip ${c.status === 'published' ? 'is-done' : ''}" style="--c:${COLORS.platform[c.platform]};--s:${COLORS.contentStatus[c.status]}" data-id="${c.id}" data-act="open" data-kind="content" title="${esc(c.title)} — ${esc(clientById(c.clientId)?.name || '')}"><span class="plat" style="--c:${COLORS.platform[c.platform]};width:18px;height:18px;font-size:.55rem">${PLAT_ABBR[c.platform]}</span><span>${esc(clientById(c.clientId)?.name || '')} · ${esc(c.title)}</span><i class="st"></i></div>`).join('')}
          ${list.length > 3 ? `<button class="cal__more" data-act="calDay" data-date="${d}">${t('cal.more', { n: list.length - 3 })}</button>` : ''}
        </div>`;
      }).join('')}</div>
      <div class="grid g-2 mt">
        <section class="card"><div class="card__head"><h3>${icon('cal')}${t('cal.month')} · ${monthItems.length}</h3></div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">${ENUM.contentStatus.map((s) => `<span class="pill" style="--c:${COLORS.contentStatus[s]}"><i></i>${label('contentStatus', s)} · ${monthItems.filter((c) => c.status === s).length}</span>`).join('')}</div></section>
        <section class="card"><div class="card__head"><h3>${icon('globe')}${t('f.platform')}</h3></div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">${ENUM.platform.map((p) => [p, monthItems.filter((c) => c.platform === p).length]).filter(([, n]) => n).map(([p, n]) => `<span class="pill" style="--c:${COLORS.platform[p]}"><i></i>${label('platform', p)} · ${n}</span>`).join('') || `<span class="dim">${t('msg.empty')}</span>`}</div></section>
      </div>`;
  },
  mount(root) {
    enableDnD(root, {
      item: '.chip[data-id]', zone: '.cal__day[data-zone]', onDrop: (id, date) => {
        const c = Store.get('content', id);
        if (!c || c.date === date) return;
        Store.save('content', { ...c, date });
        toast(t('cal.moved', { date: fmtDate(date) }));
      },
    });
  },
};
ACT.calMove = (el) => {
  const st = UI.calendar;
  const n = +el.dataset.n;
  st.month = n === 0 ? thisMonth() : shiftMonth(st.month, n);
  saveUI();
  renderView();
};
ACT.calDay = (el) => {
  const d = el.dataset.date;
  const list = DB.content.filter((c) => c.date === d && (!UI.calendar.client || c.clientId === UI.calendar.client) && (!UI.calendar.platform || c.platform === UI.calendar.platform));
  openModal({
    title: fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long' }), width: 520,
    body: `<ul class="list">${list.map((c) => `<li class="is-click" data-act="openFromModal" data-kind="content" data-id="${c.id}"><span class="plat" style="--c:${COLORS.platform[c.platform]}">${PLAT_ABBR[c.platform]}</span><div class="list__main"><b>${esc(c.title)}</b><small>${esc(clientById(c.clientId)?.name || '')} · ${esc(c.time || '')}</small></div>${pill('contentStatus', c.status)}</li>`).join('')}</ul>`,
  });
};
ACT.openFromModal = (el) => { closeModal(); setTimeout(() => openEntity(el.dataset.kind, el.dataset.id), 120); };

/* ==========================================================================
   INVOICES
   ========================================================================== */
VIEWS.invoices = {
  title: () => t('nav.invoices'),
  perm: () => can.finance(),
  render() {
    const st = uiState('invoices', { q: '', status: '', sort: 'issue', dir: 'desc' });
    const m = thisMonth();
    const all = DB.invoices;
    const paidMonth = all.filter((i) => i.status === 'paid' && monthKey(i.paidAt) === m);
    const outstanding = all.filter((i) => ['sent', 'overdue'].includes(invStatus(i)));
    const overdue = all.filter((i) => invStatus(i) === 'overdue');
    const drafts = all.filter((i) => i.status === 'draft');
    const list = all.filter((i) => match(st.q, i.number, clientById(i.clientId)?.name) && (!st.status || invStatus(i) === st.status));
    const rows = sortRows(list, st, { total: invTotal, client: (i) => clientById(i.clientId)?.name || '', status: (i) => ENUM.invoiceStatus.indexOf(invStatus(i)) });
    return `<div class="grid g-4 keep">
      ${[['money', t('inv.paidMonth'), paidMonth, '#c8ff3d'], ['clock', t('inv.outstanding'), outstanding, '#5b8cff'], ['alert', t('inv.overdue'), overdue, '#ff5c7a'], ['edit', t('inv.drafts'), drafts, '#a69fbd']]
        .map(([i, l, arr, c]) => `<article class="card kpi"><span class="kpi__label" style="--c:${c}">${icon(i)}${l}</span><b class="kpi__value num">${money(sum(arr, invTotal), true)}</b><div class="kpi__meta">${arr.length} ${t('ent.invoice')}</div></article>`).join('')}
      </div>
      <div class="toolbar mt">${searchBox('invoices.q', t('inv.search'))}${selectFilter('invoices.status', ENUM.invoiceStatus, (s) => label('invoiceStatus', s), t('inv.allStatus'))}
        <span class="grow"></span><button class="btn btn--ghost btn--sm" data-act="genRetainers">${icon('repeat')}${t('inv.retainers')}</button>
        <button class="btn btn--ghost btn--sm" data-act="exportInvoices">${icon('download')}${t('act.export')}</button>
        <button class="btn btn--sm" data-act="newRecord" data-col="invoices">${icon('plus')}${t('new.invoice')}</button></div>
      ${rows.length ? `<div class="table-wrap table-cards"><table class="table"><thead><tr>${sortable('invoices', 'number', t('f.number'), st)}${sortable('invoices', 'client', t('f.client'), st)}${sortable('invoices', 'issue', t('f.issue'), st)}${sortable('invoices', 'due', t('f.due'), st)}${sortable('invoices', 'total', t('f.total'), st)}${sortable('invoices', 'status', t('f.status'), st)}<th></th></tr></thead>
      <tbody>${rows.map((i) => { const s = invStatus(i); const c = clientById(i.clientId); return `<tr data-act="open" data-kind="invoice" data-id="${i.id}">
        <td><b class="num">${esc(i.number)}</b></td><td data-label="${t('f.client')}"><div class="who">${clientLogo(c, 'avatar--sm')}<span>${esc(c?.name || '—')}</span></div></td>
        <td data-label="${t('f.issue')}">${fmtDate(i.issue)}</td><td data-label="${t('f.due')}">${['sent', 'overdue'].includes(s) ? dueTag(i.due) : fmtDate(i.due)}</td>
        <td data-label="${t('f.total')}" class="num"><b>${money(invTotal(i))}</b></td><td data-label="${t('f.status')}">${pill('invoiceStatus', s)}</td>
        <td class="actions">${s !== 'paid' && s !== 'cancelled' ? `<button class="icon-btn icon-btn--sm" data-act="markPaid" data-id="${i.id}" title="${t('act.markPaid')}">${icon('check')}</button>` : ''}<button class="icon-btn icon-btn--sm" data-act="printInvoice" data-id="${i.id}" title="${t('act.print')}">${icon('print')}</button></td></tr>`; }).join('')}</tbody></table></div>` : `<div class="card">${emptyHTML()}</div>`}`;
  },
  openId: (id) => openInvoice(id),
};
ACT.exportInvoices = () => download(`wav-invoices-${today()}.csv`, toCSV(DB.invoices, [
  { h: 'Number', v: (i) => i.number }, { h: 'Client', v: (i) => clientById(i.clientId)?.name }, { h: 'Issue', v: (i) => i.issue }, { h: 'Due', v: (i) => i.due },
  { h: 'Subtotal', v: (i) => invTotals(i).subtotal }, { h: 'VAT', v: (i) => invTotals(i).vat }, { h: 'Total', v: invTotal }, { h: 'Status', v: (i) => label('invoiceStatus', invStatus(i)) }, { h: 'Paid on', v: (i) => i.paidAt },
]));
ACT.markPaid = (el, e) => {
  e?.stopPropagation();
  const i = Store.get('invoices', el.dataset.id);
  if (!i) return;
  Store.save('invoices', { ...i, status: 'paid', paidAt: today() }, { log: { type: 'paid', text: 'paid', extra: { name: i.number } } });
  burst();
  toast(t('msg.saved'));
};
ACT.markSent = (el) => { const i = Store.get('invoices', el.dataset.id); if (i) Store.save('invoices', { ...i, status: 'sent' }); };
ACT.genRetainers = () => {
  const m = thisMonth();
  let n = 0;
  DB.clients.filter((c) => c.status === 'active' && Number(c.retainer) > 0).forEach((c) => {
    if (DB.invoices.some((i) => i.clientId === c.id && i.retainerMonth === m)) return;
    const issue = today();
    Store.save('invoices', { number: nextInvoiceNumber(issue), clientId: c.id, issue, due: addDays(issue, 14), status: 'draft', items: [{ desc: t('inv.retainerFor', { month: fmtMonth(m, true) }), qty: 1, price: Number(c.retainer) }], discount: 0, vat: Number(DB.settings.vat) || 0, notes: '', retainerMonth: m });
    n++;
  });
  toast(n ? t('inv.retainersDone', { n }) : t('inv.retainersNone'));
};
ACT.duplicateInvoice = (el) => {
  const i = Store.get('invoices', el.dataset.id);
  if (!i) return;
  closeDrawer();
  editInvoice(null, { clientId: i.clientId, items: JSON.parse(JSON.stringify(i.items || [])), discount: i.discount, vat: i.vat, notes: i.notes });
};
function openInvoice(id) {
  if (!can.finance()) return toast(t('msg.noAccess'), { err: true });
  openDrawer(() => {
    const i = Store.get('invoices', id);
    if (!i) return null;
    const c = clientById(i.clientId);
    const tot = invTotals(i);
    const s = invStatus(i);
    return `${drawerHead(`${t('ent.invoice')} · ${esc(c?.name || '')}`, `<span class="num">${esc(i.number)}</span>`, `<div style="display:flex;gap:10px;margin-top:12px;align-items:center;flex-wrap:wrap">${pill('invoiceStatus', s)}<b class="num lime" style="font-size:1.2rem">${money(tot.total)}</b></div>`)}
      <div class="drawer__body">
        <div class="quick">${s === 'draft' ? `<button data-act="markSent" data-id="${i.id}">${icon('mail')}${t('act.send')}</button>` : ''}${s !== 'paid' && s !== 'cancelled' ? `<button data-act="markPaid" data-id="${i.id}">${icon('check')}${t('act.markPaid')}</button>` : ''}
          <button data-act="printInvoice" data-id="${i.id}">${icon('print')}${t('act.print')}</button><button data-act="duplicateInvoice" data-id="${i.id}">${icon('repeat')}${t('act.duplicate')}</button></div>
        ${kv([[t('f.client'), c ? `<a data-act="open" data-kind="client" data-id="${c.id}" style="cursor:pointer;color:var(--violet-2)">${esc(c.name)}</a>` : ''], [t('f.issue'), fmtDate(i.issue)], [t('f.due'), `${fmtDate(i.due)}${['sent', 'overdue'].includes(s) ? ' · ' + relDay(i.due) : ''}`], [t('f.paidAt'), i.paidAt ? fmtDate(i.paidAt) : '']])}
        <div class="sect"><h4>${t('f.items')}</h4><div class="table-wrap"><table class="table"><thead><tr><th>${t('f.desc')}</th><th>${t('f.qty')}</th><th>${t('f.price')}</th><th style="text-align:end">${t('f.total')}</th></tr></thead><tbody>
          ${(i.items || []).map((it) => `<tr style="cursor:default"><td style="white-space:normal">${esc(it.desc)}</td><td class="num">${it.qty}</td><td class="num">${money(it.price)}</td><td class="num" style="text-align:end">${money(it.qty * it.price)}</td></tr>`).join('')}</tbody></table></div>
          <div class="totals"><div><span>${t('f.subtotal')}</span><span class="num">${money(tot.subtotal)}</span></div>${tot.discount ? `<div><span>${t('f.discount')} (${i.discount}%)</span><span class="num">−${money(tot.discount)}</span></div>` : ''}${tot.vat ? `<div><span>${t('f.vat')} (${i.vat}%)</span><span class="num">${money(tot.vat)}</span></div>` : ''}<div class="grand"><span>${t('f.total')}</span><b class="num">${money(tot.total)}</b></div></div></div>
        ${i.notes ? `<div class="sect"><h4>${t('f.notes')}</h4><div class="card" style="padding:14px;white-space:pre-wrap">${esc(i.notes)}</div></div>` : ''}
      </div>
      <div class="drawer__foot">${can.remove() ? `<button class="btn btn--danger btn--sm" data-act="deleteRecord" data-col="invoices" data-id="${i.id}">${icon('trash')}</button><span class="spacer"></span>` : ''}
        <button class="btn btn--ghost btn--sm" data-act="editRecord" data-col="invoices" data-id="${i.id}">${icon('edit')}${t('act.edit')}</button></div>`;
  });
}
function editInvoice(id, defaults = {}) {
  if (!can.finance()) return toast(t('msg.noAccess'), { err: true });
  const existing = id ? Store.get('invoices', id) : null;
  const issue = today();
  const inv = existing ? JSON.parse(JSON.stringify(existing)) : { number: nextInvoiceNumber(issue), issue, due: addDays(issue, 14), status: 'draft', items: [{ desc: '', qty: 1, price: 0 }], discount: 0, vat: Number(DB.settings.vat) || 0, notes: '', clientId: '', ...defaults };
  const row = (it = { desc: '', qty: 1, price: 0 }) => `<div class="items__row"><input class="input" data-it="desc" value="${esc(it.desc)}" placeholder="${t('f.desc')}" /><input class="input" data-it="qty" type="number" min="0" step="any" value="${it.qty}" /><input class="input" data-it="price" type="number" min="0" step="any" value="${it.price}" /><span class="total num"></span><button class="icon-btn icon-btn--sm" data-act="rmItem" aria-label="remove">${icon('close')}</button></div>`;
  openModal({
    title: t(existing ? 'edit.invoice' : 'new.invoice'), width: 820,
    body: `<form id="invForm" novalidate><div class="form-grid">
        <label class="field" data-k="number"><span>${t('f.number')} <b>*</b></span><input name="number" value="${esc(inv.number)}" dir="ltr" /></label>
        <label class="field" data-k="clientId"><span>${t('f.client')} <b>*</b></span><select name="clientId">${clientOptions(inv.clientId, '')}</select></label>
        <label class="field"><span>${t('f.issue')}</span><input type="date" name="issue" value="${esc(inv.issue)}" /></label>
        <label class="field"><span>${t('f.due')}</span><input type="date" name="due" value="${esc(inv.due)}" /></label>
        <label class="field"><span>${t('f.status')}</span><select name="status">${optList(ENUM.invoiceStatus.filter((s) => s !== 'overdue'), (s) => label('invoiceStatus', s), inv.status)}</select></label>
        <div class="form-grid" style="grid-template-columns:1fr 1fr;gap:12px"><label class="field"><span>${t('f.discount')}</span><input type="number" min="0" max="100" step="any" name="discount" value="${inv.discount || 0}" /></label><label class="field"><span>${t('f.vat')}</span><input type="number" min="0" max="100" step="any" name="vat" value="${inv.vat || 0}" /></label></div>
      </div>
      <div class="sect" style="margin-top:18px"><h4>${t('f.items')}</h4>
        <div class="items"><div class="items__row items__head"><span>${t('f.desc')}</span><span>${t('f.qty')}</span><span>${t('f.price')}</span><span style="text-align:end">${t('f.total')}</span><span></span></div><div id="itemRows">${(inv.items.length ? inv.items : [{ desc: '', qty: 1, price: 0 }]).map(row).join('')}</div></div>
        <button type="button" class="btn btn--ghost btn--sm" data-act="addItem" style="margin-top:10px">${icon('plus')}${t('inv.addItem')}</button>
        <div class="totals" id="invTotals"></div></div>
      <label class="field field--full" style="margin-top:14px"><span>${t('f.notes')}</span><textarea name="notes" rows="2">${esc(inv.notes)}</textarea></label></form>`,
    foot: `<button class="btn btn--ghost" data-act="closeModal">${t('act.cancel')}</button><button class="btn" data-primary data-act="saveInvoice" data-id="${esc(id || '')}">${icon('check')}${t('act.save')}</button>`,
    onMount(m) {
      ACT.addItem = () => { $('#itemRows').insertAdjacentHTML('beforeend', row()); recalc(); $('#itemRows .items__row:last-child input').focus(); };
      ACT.rmItem = (b) => { if ($$('#itemRows .items__row').length > 1) b.closest('.items__row').remove(); recalc(); };
      const recalc = () => {
        const items = readItems();
        const tot = invTotals({ items, discount: $('[name=discount]', m).value, vat: $('[name=vat]', m).value });
        $$('#itemRows .items__row').forEach((r, i) => { $('.total', r).textContent = money((items[i]?.qty || 0) * (items[i]?.price || 0)); });
        $('#invTotals').innerHTML = `<div><span>${t('f.subtotal')}</span><span class="num">${money(tot.subtotal)}</span></div>${tot.discount ? `<div><span>${t('f.discount')}</span><span class="num">−${money(tot.discount)}</span></div>` : ''}${tot.vat ? `<div><span>${t('f.vat')}</span><span class="num">${money(tot.vat)}</span></div>` : ''}<div class="grand"><span>${t('f.total')}</span><b class="num">${money(tot.total)}</b></div>`;
      };
      $('#invForm', m).addEventListener('input', recalc);
      $('#invForm', m).addEventListener('submit', (e) => e.preventDefault());
      recalc();
    },
  });
}
function readItems() {
  return $$('#itemRows .items__row').map((r) => ({ desc: $('[data-it=desc]', r).value.trim(), qty: Number($('[data-it=qty]', r).value) || 0, price: Number($('[data-it=price]', r).value) || 0 })).filter((it) => it.desc || it.price);
}
ACT.saveInvoice = (el) => {
  const f = $('#invForm');
  const val = (n) => $(`[name="${n}"]`, f).value.trim();
  $$('.field', f).forEach((x) => x.classList.remove('is-invalid'));
  if (!val('number') || !val('clientId')) {
    if (!val('number')) $('.field[data-k=number]', f).classList.add('is-invalid');
    if (!val('clientId')) $('.field[data-k=clientId]', f).classList.add('is-invalid');
    return toast(t('msg.required'), { err: true });
  }
  const id = el.dataset.id;
  const existing = id ? Store.get('invoices', id) : null;
  const status = val('status');
  const rec = { ...(existing || {}), number: val('number'), clientId: val('clientId'), issue: val('issue'), due: val('due'), status, discount: Number(val('discount')) || 0, vat: Number(val('vat')) || 0, notes: val('notes'), items: readItems() };
  if (status === 'paid' && !rec.paidAt) rec.paidAt = today();
  if (status !== 'paid') rec.paidAt = '';
  closeModal();
  const saved = Store.save('invoices', rec, status === 'paid' && existing?.status !== 'paid' ? { log: { type: 'paid', text: 'paid', extra: { name: rec.number } } } : {});
  toast(t('msg.saved'));
  openInvoice(saved.id);
};
ACT.printInvoice = (el, e) => {
  e?.stopPropagation();
  const i = Store.get('invoices', el.dataset.id);
  if (!i) return;
  const c = clientById(i.clientId) || {};
  const tot = invTotals(i);
  const S = DB.settings;
  const dir = LANG === 'ar' ? 'rtl' : 'ltr';
  const html = `<!doctype html><html lang="${LANG}" dir="${dir}"><head><meta charset="utf-8"><title>${esc(i.number)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Alexandria:wght@400;600;800&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font-family:${LANG === 'ar' ? 'Alexandria' : 'Inter'},sans-serif;color:#151021;font-size:13px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .top{background:#07060b;color:#fff;padding:38px 48px 30px;position:relative;overflow:hidden}.top:after{content:'';position:absolute;inset:auto -10% -60px -10%;height:120px;background:radial-gradient(60% 100% at 50% 100%,rgba(139,61,255,.55),transparent)}
  .row{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;position:relative;z-index:1}.word{letter-spacing:.42em;font-weight:600;font-size:12px;color:#a69fbd;direction:ltr}.word i{font-style:normal;color:#b06bff}
  h1{font-family:Anton,${LANG === 'ar' ? 'Alexandria' : 'Impact'},sans-serif;font-weight:400;font-size:46px;margin:14px 0 0;letter-spacing:.02em;text-transform:uppercase;line-height:1}h1 span{background:linear-gradient(100deg,#5b2bff,#8b3dff 45%,#e07bff);-webkit-background-clip:text;background-clip:text;color:transparent}
  .meta{text-align:end;font-size:12px;color:#a69fbd;line-height:1.8}.meta b{color:#fff;font-weight:600}.body{padding:34px 48px}.cols{display:flex;gap:40px;margin-bottom:28px}.cols div{flex:1}.lab{font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:#8b8499;margin-bottom:6px;font-weight:600}
  table{width:100%;border-collapse:collapse}th{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#8b8499;text-align:start;padding:10px 8px;border-bottom:2px solid #151021}td{padding:12px 8px;border-bottom:1px solid #eee9f5}.n{text-align:end;font-variant-numeric:tabular-nums;white-space:nowrap}
  .tot{margin-top:18px;margin-inline-start:auto;width:300px}.tot div{display:flex;justify-content:space-between;padding:6px 0}.tot .g{border-top:2px solid #151021;margin-top:6px;padding-top:12px;font-size:18px;font-weight:700}.tot .g b{color:#5b2bff}
  .foot{margin-top:40px;padding-top:18px;border-top:1px solid #eee9f5;display:flex;justify-content:space-between;color:#8b8499;font-size:11px}.wave{height:6px;background:linear-gradient(100deg,#5b2bff,#8b3dff 45%,#e07bff)}.notes{margin-top:24px;padding:14px;border-radius:10px;background:#f6f3fb;white-space:pre-wrap}</style></head><body>
  <div class="top"><div class="row"><div><svg width="56" viewBox="0 0 124 124"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2=".3"><stop offset="0" stop-color="#5b2bff"/><stop offset=".5" stop-color="#9b4dff"/><stop offset="1" stop-color="#e07bff"/></linearGradient></defs><path d="M10 36 C 20 36 25 88 39 88 C 51 88 53 56 62 56 C 71 56 73 88 85 88 C 100 88 106 46 116 32" fill="none" stroke="url(#g)" stroke-width="12" stroke-linecap="round"/></svg><div class="word">W<i>Λ</i>V</div>
  <h1>${LANG === 'ar' ? 'فاتورة' : 'Invoice'} <span>${esc(i.number)}</span></h1></div>
  <div class="meta">${t('f.issue')}: <b>${fmtDate(i.issue, { day: 'numeric', month: 'long', year: 'numeric' })}</b><br>${t('f.due')}: <b>${fmtDate(i.due, { day: 'numeric', month: 'long', year: 'numeric' })}</b><br>${t('f.status')}: <b>${esc(label('invoiceStatus', invStatus(i)))}</b></div></div></div><div class="wave"></div>
  <div class="body"><div class="cols"><div><div class="lab">${t('inv.from')}</div><b>${esc(S.agency)}</b><br>${esc(S.address || '')}${S.phone ? '<br>' + esc(S.phone) : ''}${S.email ? '<br>' + esc(S.email) : ''}${S.website ? '<br>' + esc(S.website) : ''}${S.taxId ? `<br>${t('set.taxId')}: ${esc(S.taxId)}` : ''}</div>
  <div><div class="lab">${t('inv.billTo')}</div><b>${esc(c.name || '')}</b>${c.contact ? '<br>' + esc(c.contact) : ''}${c.phone ? '<br><span dir="ltr">' + esc(c.phone) + '</span>' : ''}${c.email ? '<br>' + esc(c.email) : ''}</div></div>
  <table><thead><tr><th>${t('f.desc')}</th><th class="n">${t('f.qty')}</th><th class="n">${t('f.price')}</th><th class="n">${t('f.total')}</th></tr></thead><tbody>${(i.items || []).map((it) => `<tr><td>${esc(it.desc)}</td><td class="n">${it.qty}</td><td class="n">${money(it.price)}</td><td class="n">${money(it.qty * it.price)}</td></tr>`).join('')}</tbody></table>
  <div class="tot"><div><span>${t('f.subtotal')}</span><span class="n">${money(tot.subtotal)}</span></div>${tot.discount ? `<div><span>${t('f.discount')} (${i.discount}%)</span><span class="n">−${money(tot.discount)}</span></div>` : ''}${tot.vat ? `<div><span>${t('f.vat')} (${i.vat}%)</span><span class="n">${money(tot.vat)}</span></div>` : ''}<div class="g"><span>${t('f.total')}</span><b class="n">${money(tot.total)}</b></div></div>
  ${i.notes ? `<div class="notes">${esc(i.notes)}</div>` : ''}
  <div class="foot"><span>${t('inv.thanks')}</span><span>${esc(t('app.slogan'))}</span></div></div></body></html>`;
  const fr = document.createElement('iframe');
  fr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(fr);
  const doc = fr.contentWindow.document;
  doc.open(); doc.write(html); doc.close();
  const go2 = () => { try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (x) {} setTimeout(() => fr.remove(), 60000); };
  (fr.contentWindow.document.fonts ? fr.contentWindow.document.fonts.ready.then(() => setTimeout(go2, 250)) : setTimeout(go2, 700));
};

/* ==========================================================================
   TEAM
   ========================================================================== */
function memberStats(u) {
  const m = thisMonth(), [from, to] = [`${m}-01`, today()];
  return {
    open: DB.leads.filter((l) => l.owner === u.id && OPEN_STAGES.includes(l.stage)).length,
    wonValue: sum(DB.leads.filter((l) => l.owner === u.id && l.stage === 'won' && l.wonAt >= from && l.wonAt <= to), (l) => l.value),
    wonCount: DB.leads.filter((l) => l.owner === u.id && l.stage === 'won' && l.wonAt >= from && l.wonAt <= to).length,
    tasksOpen: DB.tasks.filter((tk) => tk.assignee === u.id && tk.status !== 'done').length,
    tasksDone: DB.tasks.filter((tk) => tk.assignee === u.id && tk.status === 'done' && monthKey(tk.doneAt) === m).length,
    posts: DB.content.filter((c) => c.assignee === u.id && monthKey(c.date) === m).length,
  };
}
VIEWS.team = {
  title: () => t('nav.team'),
  render() {
    const users = DB.users.filter((u) => u.active !== false || can.team());
    const stats = users.map((u) => ({ u, s: memberStats(u) }));
    const board = [...stats].filter((x) => x.u.active !== false).map((x) => ({ ...x, score: x.s.wonValue / 1000 + x.s.tasksDone * 3 + x.s.posts * 2 })).sort((a, b) => b.score - a.score).slice(0, 5);
    return `<div class="toolbar">${can.team() ? `<span class="muted" style="font-size:.84rem">${isCloud() ? t('team.cloudNote') : ''}</span><span class="grow"></span><button class="btn btn--sm" data-act="newRecord" data-col="users">${icon('plus')}${t('new.member')}</button>` : ''}</div>
      <section class="card"><div class="card__head"><h3>${icon('spark')}${t('team.leaderboard')}</h3></div>
        <ul class="list">${board.map((x, i) => `<li>${`<span class="rank rank--${i + 1}">${i + 1}</span>`}${avatar(x.u)}<div class="list__main"><b>${esc(x.u.name)}${x.u.id === me().id ? ` <span class="pill" style="--c:var(--lime)">${t('team.you')}</span>` : ''}</b><small>${esc(x.u.title || label('dept', x.u.dept))}</small></div>
          <span class="tag">${icon('target')}${money(x.s.wonValue, true)}</span><span class="tag">${icon('tasks')}${x.s.tasksDone}</span><span class="tag">${icon('cal')}${x.s.posts}</span></li>`).join('')}</ul></section>
      <div class="cards mt">${stats.map(({ u, s }) => `<article class="member" ${can.team() ? `data-act="editRecord" data-col="users" data-id="${u.id}" style="cursor:pointer;${u.active === false ? 'opacity:.55' : ''}"` : ''}>
        <div class="member__top">${avatar(u, 'avatar--lg')}<div style="flex:1;min-width:0"><b>${esc(u.name)}</b><small>${esc(u.title || '')}${u.title && u.dept ? ' · ' : ''}${esc(label('dept', u.dept))}</small><small dir="ltr" style="text-align:start">${esc(u.email || '')}</small></div>${pill('role', u.role, '')}${u.active === false ? `<span class="pill pill--plain">${t('team.inactive')}</span>` : ''}</div>
        <div class="member__stats"><div><b class="num">${s.open}</b><small>${t('team.openLeads')}</small></div><div><b class="num">${s.wonCount}</b><small>${t('team.wonMonth')}</small></div><div><b class="num">${s.tasksOpen}</b><small>${t('team.tasksOpen')}</small></div><div><b class="num">${s.posts}</b><small>${t('team.posts')}</small></div></div>
      </article>`).join('')}</div>`;
  },
};
COLORS.role = { admin: '#c8ff3d', manager: '#e07bff', member: '#5b8cff' };
function editMember(id) {
  if (!can.team()) return toast(t('msg.noAccess'), { err: true });
  const existing = id ? userById(id) : null;
  const rec = existing ? { ...existing } : { role: 'member', dept: 'content', active: true, color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)] };
  const schema = isCloud() ? [...SCHEMA.users, { k: 'password', type: 'password', hint: existing ? 'f.passwordHint' : '', req: !existing, full: true }] : SCHEMA.users;
  openModal({
    title: t(existing ? 'edit.member' : 'new.member'),
    body: `<form id="memForm" novalidate>${formHTML(schema, rec)}</form>`,
    foot: `<button class="btn btn--ghost" data-act="closeModal">${t('act.cancel')}</button><button class="btn" data-primary data-act="saveMember" data-id="${esc(id || '')}">${icon('check')}${t('act.save')}</button>`,
    onMount: (m) => $('#memForm', m).addEventListener('submit', (e) => { e.preventDefault(); $('[data-primary]', m).click(); }),
  });
  ACT.saveMember = async (el) => {
    const data = readForm($('#memForm'), schema);
    if (!data) return toast(t('msg.required'), { err: true });
    if (id === me().id) { data.active = true; if (me().role === 'admin') data.role = 'admin'; }
    const user = { ...(existing || {}), ...data, id: id || uid('U') };
    const password = user.password;
    delete user.password;
    if (isCloud()) {
      el.disabled = true;
      try {
        const j = await Sync.call('saveUser', { user, password: password || '' });
        DB.users = j.users.map(normalize);
        Store.persist();
      } catch (e) { el.disabled = false; return toast(e.message, { err: true }); }
    } else {
      const i = DB.users.findIndex((u) => u.id === user.id);
      if (i >= 0) DB.users[i] = user; else DB.users.push(user);
      Store.persist();
    }
    closeModal();
    toast(t('msg.saved'));
    emitChange();
  };
}

/* ==========================================================================
   REPORTS
   ========================================================================== */
VIEWS.reports = {
  title: () => t('nav.reports'),
  perm: () => can.finance(),
  render() {
    const st = uiState('reports', { period: 'month' });
    const range = periodRange(st.period);
    const prev = prevRange(range);
    const cur = salesStats(range), old = salesStats(prev);
    const delta = (a, b, money_ = false) => { if (st.period === 'all') return ''; if (!b) return a ? `<b>↑</b> ${t('kpi.vsPrev')}` : ''; const d = (a - b) / b; return `<b class="${d < 0 ? 'down' : ''}">${d >= 0 ? '↑' : '↓'} ${Math.abs(Math.round(d * 100))}%</b> ${t('kpi.vsPrev')}`; };
    const leads = DB.leads.filter((l) => inRange(l.createdAt, range));
    const bySource = ENUM.source.map((s) => { const ls = leads.filter((l) => l.source === s); const won = ls.filter((l) => l.stage === 'won').length; return { s, n: ls.length, won, conv: ls.length ? won / ls.length : 0 }; }).filter((x) => x.n).sort((a, b) => b.n - a.n);
    const maxSrc = Math.max(1, ...bySource.map((x) => x.n));
    const funnelStages = ['new', 'contacted', 'discovery', 'proposal', 'negotiation', 'won'];
    const reached = funnelStages.map((s, i) => leads.filter((l) => { const at = l.stage === 'lost' ? ENUM.stage.indexOf(l.lostFrom || 'contacted') : ENUM.stage.indexOf(l.stage); return at >= i; }).length);
    const months = Array.from({ length: 12 }, (_, i) => shiftMonth(thisMonth(), i - 11));
    const rev = months.map((m) => sum(DB.invoices.filter((i) => i.status === 'paid' && monthKey(i.paidAt) === m), invTotal));
    const lost = DB.leads.filter((l) => l.stage === 'lost' && inRange(l.lostAt, range));
    const lostCounts = ENUM.lostReason.map((r) => [r, lost.filter((l) => l.lostReason === r).length]).filter(([, n]) => n);
    let acc = 0;
    const lostTotal = Math.max(1, lost.length);
    const stops = lostCounts.map(([r, n]) => { const a = acc; acc += (n / lostTotal) * 100; return `${COLORS.lostReason[r]} ${a}% ${acc}%`; }).join(',') || '#2a2340 0 100%';
    const services = ENUM.service.map((s) => [s, leads.filter((l) => l.service === s).length]).filter(([, n]) => n).sort((a, b) => b[1] - a[1]);
    const maxSvc = Math.max(1, ...services.map((x) => x[1]));
    const team = DB.users.filter((u) => u.active !== false).map((u) => {
      const won = DB.leads.filter((l) => l.owner === u.id && l.stage === 'won' && inRange(l.wonAt, range));
      return { u, leads: leads.filter((l) => l.owner === u.id).length, won: won.length, value: sum(won, (l) => l.value), tasks: DB.tasks.filter((tk) => tk.assignee === u.id && tk.status === 'done' && inRange(tk.doneAt, range)).length, posts: DB.content.filter((c) => c.assignee === u.id && c.status === 'published' && inRange(c.date, range)).length };
    }).sort((a, b) => b.value - a.value || b.tasks - a.tasks);

    return `<div class="toolbar">${seg('reports.period', st.period, [['month', t('rep.month')], ['lastMonth', t('rep.lastMonth')], ['quarter', t('rep.quarter')], ['year', t('rep.year')], ['all', t('rep.all')]])}<span class="grow"></span><span class="muted" style="font-size:.8rem">${fmtDate(range[0])} — ${fmtDate(range[1])}</span></div>
      <div class="grid g-4 keep">
        <article class="card kpi"><span class="kpi__label">${icon('leads')}${t('kpi.newLeads')}</span><b class="kpi__value num">${cur.newLeads}</b><div class="kpi__meta">${delta(cur.newLeads, old.newLeads)}</div></article>
        <article class="card kpi"><span class="kpi__label">${icon('target')}${t('kpi.winRate')}</span><b class="kpi__value num">${pct(cur.winRate)}</b><div class="kpi__meta">${cur.won} ${t('rep.won')} · ${money(cur.wonValue, true)}</div></article>
        <article class="card kpi"><span class="kpi__label">${icon('money')}${t('kpi.revenue')}</span><b class="kpi__value num">${money(cur.revenue, true)}</b><div class="kpi__meta">${delta(cur.revenue, old.revenue)}</div></article>
        <article class="card kpi"><span class="kpi__label">${icon('clock')}${t('kpi.avgDeal')}</span><b class="kpi__value num">${money(cur.avgDeal, true)}</b><div class="kpi__meta">${cur.cycle} ${t('kpi.cycle')}</div></article>
      </div>
      <section class="card mt"><div class="card__head"><h3>${icon('trend')}${t('rep.revenue')}</h3><b class="num lime">${money(sum(rev), true)}</b></div>${areaChart(months, rev)}</section>
      <div class="grid g-2 mt">
        <section class="card"><div class="card__head"><h3>${icon('target')}${t('rep.sources')}</h3></div>${bySource.length ? `<ul class="hbars">${bySource.map((x) => `<li style="--v:${(x.n / maxSrc).toFixed(3)};--c:${COLORS.source[x.s]}"><span>${label('source', x.s)}</span><i></i><b class="num">${x.n} · <span class="lime">${pct(x.conv)}</span></b></li>`).join('')}</ul>` : emptyHTML()}</section>
        <section class="card"><div class="card__head"><h3>${icon('leads')}${t('rep.funnel')}</h3></div>${leads.length ? `<div class="funnel">${funnelStages.map((s, i) => `<div class="funnel__row"><span>${label('stage', s)}</span><div class="funnel__bar" style="--v:${(reached[i] / Math.max(1, reached[0])).toFixed(3)};--c:${COLORS.stage[s]}">${reached[i]}</div><b>${i ? pct(reached[i] / Math.max(1, reached[i - 1])) : ''}</b></div>`).join('')}</div>` : emptyHTML()}</section>
        <section class="card"><div class="card__head"><h3>${icon('alert')}${t('rep.lost')}</h3></div>${lost.length ? `<div class="donut-wrap"><div class="donut-center"><div class="donut" style="--stops:${stops}"></div><div><span><b class="num">${lost.length}</b><small>${label('stage', 'lost')}</small></span></div></div><ul class="legend">${lostCounts.map(([r, n]) => `<li style="--c:${COLORS.lostReason[r]}"><i></i>${label('lostReason', r)}<b class="num">${n}</b></li>`).join('')}</ul></div>` : emptyHTML()}</section>
        <section class="card"><div class="card__head"><h3>${icon('spark')}${t('rep.services')}</h3></div>${services.length ? `<ul class="hbars">${services.map(([s, n]) => `<li style="--v:${(n / maxSvc).toFixed(3)};--c:${COLORS.service[s]}"><span>${label('service', s)}</span><i></i><b class="num">${n}</b></li>`).join('')}</ul>` : emptyHTML()}</section>
      </div>
      <section class="card mt" style="padding:0;overflow:hidden"><div class="card__head" style="padding:20px 20px 0"><h3>${icon('team')}${t('rep.team')}</h3></div>
        <div class="table-wrap table-cards" style="border:0;border-radius:0"><table class="table"><thead><tr><th>${t('nav.team')}</th><th>${t('rep.leads')}</th><th>${t('rep.won')}</th><th>${t('rep.value')}</th><th>${t('rep.tasks')}</th><th>${t('rep.posts')}</th></tr></thead>
        <tbody>${team.map((x) => `<tr style="cursor:default"><td><div class="who">${avatar(x.u, 'avatar--sm')}<div><b>${esc(x.u.name)}</b><small>${esc(label('dept', x.u.dept))}</small></div></div></td><td data-label="${t('rep.leads')}" class="num">${x.leads}</td><td data-label="${t('rep.won')}" class="num">${x.won}</td><td data-label="${t('rep.value')}" class="num">${money(x.value)}</td><td data-label="${t('rep.tasks')}" class="num">${x.tasks}</td><td data-label="${t('rep.posts')}" class="num">${x.posts}</td></tr>`).join('')}</tbody></table></div></section>
      <section class="card mt"><div class="card__head"><h3>${icon('download')}${t('rep.exports')}</h3></div><div class="quick">
        ${['leads', 'clients', 'projects', 'tasks', 'content', 'invoices'].map((c) => `<button data-act="exportCol" data-col="${c}">${icon('download')}${t('nav.' + (c === 'content' ? 'calendar' : c))}</button>`).join('')}</div></section>`;
  },
};
function areaChart(labels, values) {
  const W = 800, H = 200, P = 26;
  const max = Math.max(1, ...values) * 1.15;
  const x = (i) => P + (i / Math.max(1, labels.length - 1)) * (W - P * 2);
  const y = (v) => H - P - (v / max) * (H - P * 2);
  const pts = values.map((v, i) => [x(i), y(v)]);
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const cx = (x0 + x1) / 2; d += ` C${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`; }
  const rtl = document.documentElement.dir === 'rtl';
  return `<svg class="area" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="${rtl ? 'transform:scaleX(-1)' : ''}">
    ${[0.25, 0.5, 0.75, 1].map((f) => `<line class="gridline" x1="${P}" x2="${W - P}" y1="${y(max * f / 1.15)}" y2="${y(max * f / 1.15)}"/>`).join('')}
    <path d="${d} L${x(labels.length - 1)} ${H - P} L${P} ${H - P}Z" fill="url(#gFill)"/><path class="line" d="${d}"/>
    ${pts.map(([px, py], i) => `<circle class="dot" cx="${px}" cy="${py}" r="3.5"><title>${fmtMonth(labels[i])}: ${money(values[i])}</title></circle>`).join('')}
    ${labels.map((l, i) => `<text x="${x(i)}" y="${H - 6}" text-anchor="middle" style="${rtl ? `transform:scaleX(-1);transform-origin:${x(i)}px ${H - 6}px` : ''}">${fmtMonth(l)}</text>`).join('')}</svg>`;
}
ACT.exportCol = (el) => {
  const col = el.dataset.col;
  const rows = DB[col];
  const keys = uniq(rows.flatMap((r) => Object.keys(r)));
  download(`wav-${col}-${today()}.csv`, toCSV(rows, keys.map((k) => ({ h: k, v: (r) => (k === 'items' ? (r.items || []).map((it) => `${it.desc} x${it.qty} @${it.price}`) : r[k]) }))));
};

/* ==========================================================================
   SETTINGS
   ========================================================================== */
VIEWS.settings = {
  title: () => t('nav.settings'),
  render() {
    const S = DB.settings;
    const admin = can.settings();
    const dis = admin ? '' : 'disabled';
    return `<div class="grid g-2">
      <section class="card"><div class="card__head"><h3>${icon('settings')}${t('set.workspace')}</h3></div>
        ${admin ? '' : `<p class="muted" style="margin-top:0">${t('set.adminOnly')}</p>`}
        <form id="setForm" class="form-grid">
          ${[['agency', 'set.agency'], ['website', 'f.website'], ['phone', 'set.phone'], ['email', 'set.email'], ['address', 'set.address'], ['taxId', 'set.taxId'], ['invPrefix', 'set.invPrefix']].map(([k, l]) => `<label class="field"><span>${t(l)}</span><input name="${k}" value="${esc(S[k] || '')}" ${dis} /></label>`).join('')}
          <label class="field"><span>${t('set.vat')}</span><input type="number" min="0" max="100" name="vat" value="${esc(S.vat || 0)}" ${dis} /></label>
          <label class="field"><span>${t('set.currency')}</span><select name="currency" ${dis}>${optList(Object.keys(CURRENCY), (c) => c, S.currency)}</select></label>
          <label class="field"><span>${t('set.language')}</span><select data-act-change="lang">${optList(['ar', 'en'], (l) => (l === 'ar' ? 'العربية' : 'English'), LANG)}</select></label>
        </form>
        ${admin ? `<div style="display:flex;justify-content:flex-end;margin-top:16px"><button class="btn btn--sm" data-act="saveSettings">${icon('check')}${t('act.save')}</button></div>` : ''}
      </section>
      <section class="card"><div class="card__head"><h3>${icon('sync')}${t('set.data')}</h3></div>
        ${kv([[t('set.mode'), isCloud() ? `<span class="lime">${t('set.modeCloud')}</span>` : t('set.modeDemo')], isCloud() ? [t('set.lastSync'), Sync.lastSync ? ago(Sync.lastSync) : '—'] : null])}
        <label class="field" style="margin-top:14px"><span>${t('set.url')}</span><input class="input" id="apiUrl" dir="ltr" placeholder="https://script.google.com/macros/s/…/exec" value="${esc(Sync.url())}" ${isCloud() ? 'readonly' : ''} /></label>
        <div class="quick" style="margin-top:12px">
          ${isCloud() ? `<button data-act="syncNow">${icon('sync')}${t('set.syncNow')}</button><button data-act="disconnect">${icon('logout', 'flip')}${t('set.disconnect')}</button>` : `<button data-act="testUrl">${icon('link')}${t('set.test')}</button><button data-act="connectUrl">${icon('lock')}${t('login.connectBtn')}</button>`}
        </div>
        <div class="quick" style="margin-top:16px;padding-top:16px;border-top:1px solid var(--line)">
          ${admin || !isCloud() ? `<button data-act="backup">${icon('download')}${t('set.backup')}</button>` : ''}
          ${!isCloud() ? `<label class="btn btn--ghost btn--sm" style="cursor:pointer">${icon('upload')}${t('set.restore')}<input type="file" accept="application/json" id="restoreFile" hidden /></label><button data-act="resetDemo">${icon('repeat')}${t('set.reset')}</button>` : ''}
        </div>
      </section>
      ${isCloud() ? `<section class="card"><div class="card__head"><h3>${icon('lock')}${t('set.password')}</h3></div><form id="passForm" class="form-grid"><label class="field"><span>${t('set.current')}</span><input type="password" name="current" autocomplete="current-password" /></label><label class="field"><span>${t('set.newPass')}</span><input type="password" name="next" autocomplete="new-password" minlength="8" /></label></form><div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="btn btn--sm" data-act="changePass">${icon('check')}${t('act.save')}</button></div></section>` : ''}
      <section class="card"><div class="card__head"><h3>${icon('globe')}${t('set.website')}</h3></div><p class="muted" style="margin:0;line-height:1.8">${t('set.websiteText')}</p>
        <pre class="code" dir="ltr">fetch(WEB_APP_URL, {
  method: 'POST',
  body: JSON.stringify({
    action: 'websiteLead', key: WEBSITE_KEY,
    name, contact, company, service, message, planId, pulseScore
  })
});</pre></section>
    </div>`;
  },
  mount(root) {
    $('[data-act-change="lang"]', root)?.addEventListener('change', (e) => { if (e.target.value !== LANG) ACT.lang(); });
    $('#restoreFile', root)?.addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        const j = JSON.parse(await f.text());
        if (!j.users || !j.leads) throw new Error('bad');
        Store.replaceAll({ users: j.users, settings: j.settings, data: Object.fromEntries(COLS.map((c) => [c, j[c] || []])) });
        toast(t('set.restored'));
      } catch (x) { toast('Invalid backup file', { err: true }); }
    });
  },
};
ACT.saveSettings = async () => {
  const f = $('#setForm');
  const S = { ...DB.settings };
  $$('input[name], select[name]', f).forEach((el) => (S[el.name] = el.type === 'number' ? Number(el.value) || 0 : el.value.trim()));
  if (isCloud()) {
    try { const j = await Sync.call('saveSettings', { settings: S }); DB.settings = { ...DEFAULT_SETTINGS, ...j.settings }; } catch (e) { return toast(e.message, { err: true }); }
  } else DB.settings = S;
  Store.persist();
  toast(t('set.saved'));
  emitChange();
};
ACT.backup = () => {
  const snap = { exportedAt: new Date().toISOString(), users: DB.users, settings: DB.settings };
  COLS.forEach((c) => (snap[c] = DB[c]));
  download(`wav-crm-backup-${today()}.json`, JSON.stringify(snap, null, 2), 'application/json');
};
ACT.resetDemo = async () => { if (await confirmBox(t('set.resetQ'))) { seedDemo(); emitChange(); toast(t('msg.saved')); } };
ACT.syncNow = async () => { await Sync.flush(); await Sync.pull(); toast(Sync.state === 'ok' ? t('sync.ok') : t('sync.error'), { err: Sync.state !== 'ok' }); renderView(); };
const validApiUrl = (u) => /^https:\/\/script\.google(usercontent)?\.com\/.+/.test(u);
ACT.testUrl = async () => {
  const u = $('#apiUrl').value.trim();
  if (!validApiUrl(u)) return toast(t('login.urlBad'), { err: true });
  try { await Sync.call('ping', {}, { auth: false, url: u }); toast(t('set.testOk')); } catch (e) { toast(t('login.err'), { err: true }); }
};
ACT.connectUrl = async () => {
  const u = $('#apiUrl').value.trim();
  if (!validApiUrl(u)) return toast(t('login.urlBad'), { err: true });
  try { await Sync.call('ping', {}, { auth: false, url: u }); } catch (e) { return toast(t('login.err'), { err: true }); }
  LS.set('wav_api', u);
  logout();
};
ACT.disconnect = async () => {
  if (!(await confirmBox(t('set.disconnect') + '?'))) return;
  LS.del('wav_api');
  LS.del('wav_cloud_cache');
  Sync.outbox = [];
  Sync.saveOutbox();
  logout();
};
ACT.changePass = async () => {
  const f = $('#passForm');
  const cur = $('[name=current]', f).value, next = $('[name=next]', f).value;
  if (!cur || next.length < 8) return toast(t('msg.required'), { err: true });
  try {
    const j = await Sync.call('changePassword', { current: cur, next });
    if (j.token) { SESSION.token = j.token; LS.set('wav_session', SESSION); }
    f.reset();
    toast(t('set.passOk'));
  } catch (e) { toast(e.code === 'BADPASS' ? t('login.bad') : e.message, { err: true }); }
};

/* ==========================================================================
   LOGIN / SESSION
   ========================================================================== */
let LOGIN_MODE = null;
function renderLogin(msg = '') {
  $('#app').hidden = true;
  $('#login').hidden = false;
  closeDrawer(); closeModal(); closePalette();
  const api = Sync.url();
  const mode = LOGIN_MODE || (api ? 'cloud' : 'demo');
  const card = $('#loginCard');
  const head = `<div class="login__top">${brandHTML()}<button class="lang-btn" data-act="lang">${LANG === 'ar' ? 'EN' : 'ع'}</button></div><h1 class="login__title">${t('login.title')}</h1>`;
  if (mode === 'cloud' && api) {
    card.innerHTML = `${head}<p class="login__lead">${t('login.lead')}</p>
      <form id="loginForm" novalidate>
        <label class="field"><span>${t('login.email')}</span><input type="email" name="email" autocomplete="username" dir="ltr" required /></label>
        <label class="field"><span>${t('login.password')}</span><input type="password" name="password" autocomplete="current-password" required /></label>
        <p class="login__err" id="loginErr">${esc(msg)}</p>
        <button class="btn btn--block" type="submit">${icon('arrow', 'flip')}<span>${t('login.signin')}</span></button>
      </form>
      <div class="login__foot"><span class="login__badge"><i></i>${t('login.connected')}</span>
        <div style="display:flex;gap:14px;margin-top:12px;flex-wrap:wrap"><button class="dim" data-act="loginDemo">${t('login.useDemo')}</button><button class="dim" data-act="loginChangeUrl">${t('set.disconnect')}</button></div></div>`;
    $('#loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target, btn = $('button[type=submit]', f);
      const email = f.email.value.trim().toLowerCase(), password = f.password.value;
      if (!email || !password) return ($('#loginErr').textContent = t('msg.required'));
      btn.disabled = true; $('span', btn).textContent = t('login.signing'); $('#loginErr').textContent = '';
      try {
        const j = await Sync.call('login', { email, password }, { auth: false });
        if (LS.get('wav_cloud_user') !== j.user.id) { LS.del('wav_cloud_cache'); Sync.outbox = []; Sync.saveOutbox(); }
        LS.set('wav_cloud_user', j.user.id);
        SESSION = { mode: 'cloud', userId: j.user.id, token: j.token };
        LS.set('wav_session', SESSION);
        Sync.lastSync = j.now;
        Store.replaceAll(j);
        startApp();
      } catch (err) {
        btn.disabled = false; $('span', btn).textContent = t('login.signin');
        $('#loginErr').textContent = err.code === 'BADPASS' || err.code === 'AUTH' ? t('login.bad') : err.code === 'LOCKED' ? t('login.locked') : t('login.err');
      }
    });
    setTimeout(() => $('#loginForm [name=email]')?.focus(), 50);
  } else {
    seedIfEmpty();
    card.innerHTML = `${head}<p class="login__lead"><span class="login__badge"><i></i>${t('login.demoBadge')}</span><br><br>${t('login.demoLead')}</p>
      <div class="demo-users">${DB.users.filter((u) => u.active !== false).map((u) => `<button class="demo-user" data-act="demoLogin" data-id="${u.id}">${avatar(u)}<span style="min-width:0"><b>${esc(u.name)}</b><small>${esc(label('role', u.role))} · ${esc(label('dept', u.dept))}</small></span></button>`).join('')}</div>
      <div class="login__foot"><details ${api ? 'open' : ''}><summary>${icon('lock')}${t('login.connect')}</summary>
        <p style="margin:0 0 10px">${t('login.connectHint')}</p>
        <div style="display:flex;gap:8px"><input class="input" id="loginUrl" dir="ltr" placeholder="https://script.google.com/macros/s/…/exec" value="${esc(api)}" /><button class="btn btn--sm" data-act="loginConnect">${t('login.connectBtn')}</button></div>
        <p class="login__err" id="loginErr">${esc(msg)}</p></details></div>`;
  }
  if (!$('#loginWaves').dataset.on) { $('#loginWaves').dataset.on = '1'; startWaves($('#loginWaves'), { lines: 7, clean: 1, amp: 1.1, interactive: true, alpha: 0.5 }); }
}
function seedIfEmpty() {
  const prev = SESSION;
  SESSION = { mode: 'demo' };
  if (!Store.load()) seedDemo();
  SESSION = prev;
}
ACT.demoLogin = (el) => {
  SESSION = { mode: 'demo', userId: el.dataset.id };
  LS.set('wav_session', SESSION);
  Store.load() || seedDemo();
  startApp();
};
ACT.loginDemo = () => { LOGIN_MODE = 'demo'; renderLogin(); };
ACT.loginChangeUrl = () => { LS.del('wav_api'); LOGIN_MODE = 'demo'; renderLogin(); };
ACT.loginConnect = async (el) => {
  const u = $('#loginUrl').value.trim();
  if (!validApiUrl(u)) return ($('#loginErr').textContent = t('login.urlBad'));
  el.disabled = true;
  try { await Sync.call('ping', {}, { auth: false, url: u }); LS.set('wav_api', u); LOGIN_MODE = 'cloud'; renderLogin(); }
  catch (e) { el.disabled = false; $('#loginErr').textContent = t('login.err'); }
};
function startApp() {
  LOGIN_MODE = null;
  $('#login').hidden = true;
  $('#app').hidden = false;
  Sync.start();
  ROUTE = { view: '', id: '' };
  onRoute();
}
async function logout(expired = false) {
  if (isCloud() && Sync.outbox.length && !expired) await Sync.flush();
  Sync.stop();
  SESSION = null;
  LS.del('wav_session');
  LOGIN_MODE = null;
  closeSheet();
  renderLogin(expired ? t('msg.sessionEnded') : '');
}
ACT.logout = () => logout();
function onAuthExpired() { if (SESSION) logout(true); }

/* ==========================================================================
   BOOT
   ========================================================================== */
(function boot() {
  if (SESSION && isCloud() && (!Sync.url() || !SESSION.token)) SESSION = null;
  if (SESSION) {
    if (!Store.load()) { if (isCloud()) SESSION = null; else seedDemo(); }
    if (SESSION && !userById(SESSION.userId)) SESSION = null;
  }
  setTimeout(() => $('#boot').classList.add('is-done'), 350);
  if (SESSION) startApp(); else renderLogin();
})();
