/* ==========================================================================
   Metrics — every number on the dashboard & reports comes from here
   ========================================================================== */

function invTotals(inv) {
  const subtotal = sum(inv.items || [], (it) => (Number(it.qty) || 0) * (Number(it.price) || 0));
  const discount = subtotal * ((Number(inv.discount) || 0) / 100);
  const taxable = subtotal - discount;
  const vat = taxable * ((Number(inv.vat) || 0) / 100);
  return { subtotal, discount, vat, total: Math.round((taxable + vat) * 100) / 100 };
}
const invTotal = (inv) => invTotals(inv).total;
function invStatus(inv) {
  if (inv.status === 'sent' && inv.due && inv.due < today()) return 'overdue';
  return inv.status || 'draft';
}

const openLeads = () => DB.leads.filter((l) => OPEN_STAGES.includes(l.stage));
const wonIn = (from, to) => DB.leads.filter((l) => l.stage === 'won' && l.wonAt && l.wonAt >= from && l.wonAt <= to);
const activeClients = () => DB.clients.filter((c) => c.status === 'active' || c.status === 'onboarding');
const mrr = () => sum(DB.clients.filter((c) => c.status === 'active'), (c) => c.retainer);
const isLateFollowUp = (l) => OPEN_STAGES.includes(l.stage) && l.followUp && l.followUp < today();
const isLateTask = (tk) => tk.status !== 'done' && tk.due && tk.due < today();
const isLateContent = (c) => c.status !== 'published' && c.status !== 'scheduled' && c.date && c.date <= addDays(today(), 1);
const monthRange = (key) => { const [y, m] = key.split('-').map(Number); return [`${key}-01`, toISODate(new Date(y, m, 0))]; };

function projectProgress(p) {
  const tasks = DB.tasks.filter((tk) => tk.projectId === p.id);
  if (p.status === 'delivered') return 1;
  if (tasks.length) return tasks.filter((tk) => tk.status === 'done').length / tasks.length;
  return clamp((Number(p.progress) || 0) / 100, 0, 1);
}

function clientHealth(c) {
  const overdueInv = DB.invoices.filter((i) => i.clientId === c.id && invStatus(i) === 'overdue').length;
  const lateTasks = DB.tasks.filter((tk) => tk.clientId === c.id && isLateTask(tk)).length;
  const lateContent = DB.content.filter((x) => x.clientId === c.id && isLateContent(x)).length;
  const score = overdueInv * 3 + lateTasks + lateContent;
  if (c.status === 'paused' || c.status === 'ended') return { key: 'warn', c: '#ffb547' };
  return score >= 4 ? { key: 'bad', c: '#ff5c7a' } : score >= 1 ? { key: 'warn', c: '#ffb547' } : { key: 'good', c: '#c8ff3d' };
}

/* The agency pulse — same idea as the website's "brand signal": noise → clean wave. */
function agencyPulse() {
  const lateFollow = DB.leads.filter(isLateFollowUp).length;
  const lateTasks = DB.tasks.filter(isLateTask).length;
  const lateInv = DB.invoices.filter((i) => invStatus(i) === 'overdue').length;
  const lateContent = DB.content.filter(isLateContent).length;
  const closed = DB.leads.filter((l) => (l.stage === 'won' && l.wonAt >= addDays(today(), -90)) || (l.stage === 'lost' && l.lostAt >= addDays(today(), -90)));
  const winRate = closed.length ? closed.filter((l) => l.stage === 'won').length / closed.length : 0.5;
  let score = 100 - lateFollow * 3 - lateTasks * 3 - lateInv * 6 - lateContent * 2.5 + (winRate - 0.5) * 24;
  score = Math.round(clamp(score, 12, 99));
  const level = score >= 85 ? 'wave' : score >= 68 ? 'rising' : score >= 50 ? 'ripple' : 'flatline';
  return { score, level, lateFollow, lateTasks, lateInv, lateContent, winRate };
}

function periodRange(p) {
  const T = today();
  const m = thisMonth();
  if (p === 'month') return [`${m}-01`, T];
  if (p === 'lastMonth') return monthRange(shiftMonth(m, -1));
  if (p === 'quarter') { const [y, mm] = m.split('-').map(Number); const q = Math.floor((mm - 1) / 3) * 3 + 1; return [`${y}-${pad(q)}-01`, T]; }
  if (p === 'year') return [`${T.slice(0, 4)}-01-01`, T];
  return ['2000-01-01', T];
}
function prevRange([from, to]) {
  const len = daysBetween(from, to) + 1;
  return [addDays(from, -len), addDays(from, -1)];
}
const inRange = (iso, [from, to]) => !!iso && iso.slice(0, 10) >= from && iso.slice(0, 10) <= to;

function salesStats(range) {
  const created = DB.leads.filter((l) => inRange(l.createdAt, range));
  const won = DB.leads.filter((l) => l.stage === 'won' && inRange(l.wonAt, range));
  const lost = DB.leads.filter((l) => l.stage === 'lost' && inRange(l.lostAt, range));
  const revenue = sum(DB.invoices.filter((i) => i.status === 'paid' && inRange(i.paidAt, range)), invTotal);
  const cycles = won.map((l) => daysBetween(dayOf(l.createdAt), l.wonAt)).filter((n) => n >= 0);
  return {
    newLeads: created.length,
    won: won.length,
    wonValue: sum(won, (l) => l.value),
    winRate: won.length + lost.length ? won.length / (won.length + lost.length) : 0,
    revenue,
    avgDeal: won.length ? sum(won, (l) => l.value) / won.length : 0,
    cycle: cycles.length ? Math.round(sum(cycles) / cycles.length) : 0,
  };
}

function focusItems() {
  const T = today();
  const items = [];
  DB.leads.filter((l) => OPEN_STAGES.includes(l.stage) && l.followUp && l.followUp <= T)
    .forEach((l) => items.push({ kind: 'lead', id: l.id, date: l.followUp, icon: 'phone', c: COLORS.stage[l.stage], text: t('focus.followUp', { name: l.name }), sub: l.company, mine: l.owner === me().id }));
  DB.tasks.filter((tk) => tk.status !== 'done' && tk.due && tk.due <= T)
    .forEach((tk) => items.push({ kind: 'task', id: tk.id, date: tk.due, icon: 'tasks', c: COLORS.priority[tk.priority] || '#8b3dff', text: tk.title, sub: clientById(tk.clientId)?.name || '', mine: tk.assignee === me().id }));
  if (can.finance()) DB.invoices.filter((i) => invStatus(i) === 'overdue')
    .forEach((i) => items.push({ kind: 'invoice', id: i.id, date: i.due, icon: 'invoice', c: '#ff5c7a', text: t('focus.invoice', { name: i.number }), sub: clientById(i.clientId)?.name || '', mine: true }));
  DB.content.filter(isLateContent)
    .forEach((c) => items.push({ kind: 'content', id: c.id, date: c.date, icon: 'cal', c: COLORS.platform[c.platform], text: t('focus.content', { name: clientById(c.clientId)?.name || '' }), sub: c.title, mine: c.assignee === me().id }));
  return items.sort((a, b) => (a.mine === b.mine ? (a.date < b.date ? -1 : 1) : a.mine ? -1 : 1));
}

function nextInvoiceNumber(issue) {
  const y = (issue || today()).slice(0, 4);
  const prefix = `${DB.settings.invPrefix || 'WAV'}-${y}-`;
  const max = Math.max(0, ...DB.invoices.filter((i) => String(i.number || '').startsWith(prefix)).map((i) => parseInt(String(i.number).slice(prefix.length), 10) || 0));
  return prefix + String(max + 1).padStart(3, '0');
}

function toCSV(rows, cols) {
  const cell = (v) => { const s = Array.isArray(v) ? v.join(' | ') : String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return '﻿' + [cols.map((c) => cell(c.h)).join(','), ...rows.map((r) => cols.map((c) => cell(c.v(r))).join(','))].join('\n');
}
function download(name, text, type = 'text/csv;charset=utf-8') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
