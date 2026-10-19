/* ==========================================================================
   i18n — English + Arabic (RTL). Every UI string lives here.
   ========================================================================== */
const I18N = {
  en: {
    'app.name': 'WAV CRM',
    'app.tag': 'Growth OS',
    'app.slogan': "Don't follow the wave. Be the wave.",

    'nav.overview': 'Overview', 'nav.sales': 'Sales', 'nav.delivery': 'Delivery', 'nav.money': 'Money', 'nav.agency': 'Agency',
    'nav.dashboard': 'Dashboard', 'nav.leads': 'Leads', 'nav.clients': 'Clients', 'nav.projects': 'Projects', 'nav.tasks': 'Tasks',
    'nav.calendar': 'Content calendar', 'nav.calendarShort': 'Calendar', 'nav.invoices': 'Invoices', 'nav.team': 'Team', 'nav.reports': 'Reports',
    'nav.settings': 'Settings', 'nav.more': 'More', 'nav.leadsShort': 'Leads',

    'sub.dashboard': 'Is the agency moving, or just active?', 'sub.leads': 'From first hello to signed deal', 'sub.clients': 'The brands we move',
    'sub.projects': 'Everything in production', 'sub.tasks': 'Who is doing what, and by when', 'sub.calendar': 'Plan, approve and publish',
    'sub.invoices': 'Billing, retainers and cash in', 'sub.team': 'The people behind the wave', 'sub.reports': 'Real numbers. Real movement.',
    'sub.settings': 'Workspace, data and integrations',

    'login.title': 'Make <em>waves.</em>', 'login.lead': 'Sign in to the WAV workspace.',
    'login.email': 'Email', 'login.password': 'Password', 'login.signin': 'Sign in', 'login.signing': 'Signing in…',
    'login.demoBadge': 'Demo workspace', 'login.demoLead': 'Pick a teammate to explore. Data stays in this browser.',
    'login.connect': 'Connect a Google Sheet', 'login.connectHint': 'Paste the Web App URL from your Apps Script deployment.',
    'login.connectBtn': 'Connect', 'login.useDemo': 'Use the demo instead', 'login.connected': 'Connected to Google Sheets',
    'login.bad': 'Wrong email or password.', 'login.err': "Couldn't reach the server. Check the connection URL.", 'login.urlBad': 'That doesn\'t look like an Apps Script Web App URL.',
    'login.locked': 'Too many attempts. Try again in a few minutes.',

    'top.search': 'Search or jump to…', 'top.new': 'New', 'top.notifications': 'Notifications', 'top.nothing': "You're all caught up.",

    'act.save': 'Save', 'act.cancel': 'Cancel', 'act.delete': 'Delete', 'act.edit': 'Edit', 'act.close': 'Close', 'act.add': 'Add',
    'act.new': 'New', 'act.undo': 'Undo', 'act.export': 'Export CSV', 'act.print': 'Print / PDF', 'act.markPaid': 'Mark as paid',
    'act.convert': 'Convert to client', 'act.addNote': 'Add note', 'act.call': 'Call', 'act.whatsapp': 'WhatsApp', 'act.email': 'Email',
    'act.logout': 'Sign out', 'act.viewAll': 'View all', 'act.today': 'Today', 'act.confirm': 'Confirm', 'act.duplicate': 'Duplicate',
    'act.send': 'Mark as sent', 'act.open': 'Open',

    'new.lead': 'New lead', 'new.client': 'New client', 'new.project': 'New project', 'new.task': 'New task', 'new.content': 'New post',
    'new.invoice': 'New invoice', 'new.member': 'New teammate',
    'edit.lead': 'Edit lead', 'edit.client': 'Edit client', 'edit.project': 'Edit project', 'edit.task': 'Edit task', 'edit.content': 'Edit post',
    'edit.invoice': 'Edit invoice', 'edit.member': 'Edit teammate',

    'ent.lead': 'Lead', 'ent.client': 'Client', 'ent.project': 'Project', 'ent.task': 'Task', 'ent.content': 'Post', 'ent.invoice': 'Invoice', 'ent.member': 'Teammate',

    'f.name': 'Name', 'f.company': 'Company / brand', 'f.phone': 'Phone / WhatsApp', 'f.email': 'Email', 'f.source': 'Source', 'f.service': 'Service',
    'f.services': 'Services', 'f.value': 'Deal value', 'f.stage': 'Stage', 'f.owner': 'Owner', 'f.followUp': 'Next follow-up',
    'f.industry': 'Industry', 'f.notes': 'Notes', 'f.contact': 'Contact person', 'f.retainer': 'Monthly retainer', 'f.status': 'Status',
    'f.manager': 'Account manager', 'f.since': 'Client since', 'f.color': 'Brand color', 'f.client': 'Client', 'f.title': 'Title',
    'f.start': 'Start date', 'f.due': 'Due date', 'f.budget': 'Budget', 'f.progress': 'Progress %', 'f.project': 'Project',
    'f.assignee': 'Assignee', 'f.priority': 'Priority', 'f.platform': 'Platform', 'f.format': 'Format', 'f.date': 'Publish date',
    'f.time': 'Time', 'f.caption': 'Caption / brief', 'f.link': 'Asset link', 'f.number': 'Invoice #', 'f.issue': 'Issue date',
    'f.items': 'Line items', 'f.desc': 'Description', 'f.qty': 'Qty', 'f.price': 'Unit price', 'f.total': 'Total', 'f.discount': 'Discount %',
    'f.vat': 'VAT %', 'f.subtotal': 'Subtotal', 'f.role': 'Access', 'f.dept': 'Department', 'f.jobTitle': 'Job title', 'f.password': 'Password',
    'f.passwordHint': 'Leave empty to keep the current password', 'f.active': 'Active', 'f.lostReason': 'Why was it lost?', 'f.website': 'Website / page',
    'f.pulse': 'Pulse score', 'f.plan': 'Pulse plan', 'f.city': 'City', 'f.created': 'Created', 'f.updated': 'Updated', 'f.paidAt': 'Paid on',
    'f.retainerMonth': 'Retainer month',

    'stage.new': 'New', 'stage.contacted': 'Contacted', 'stage.discovery': 'Discovery', 'stage.proposal': 'Proposal',
    'stage.negotiation': 'Negotiation', 'stage.won': 'Won', 'stage.lost': 'Lost',
    'source.website': 'Website', 'source.pulse': 'Pulse check', 'source.meta': 'Meta ads', 'source.instagram': 'Instagram',
    'source.tiktok': 'TikTok', 'source.google': 'Google', 'source.referral': 'Referral', 'source.whatsapp': 'WhatsApp',
    'source.event': 'Event', 'source.cold': 'Outreach',
    'service.strategy': 'Strategy & Brand', 'service.content': 'Content & Creative', 'service.media': 'Media & Performance',
    'service.tech': 'Technology & Development', 'service.digital': 'Digital Experience', 'service.growth': 'Growth & Analytics',
    'service.print': 'Print & Production', 'service.consulting': 'Business Experience Consulting',
    'industry.fnb': 'Food & Beverage', 'industry.fmcg': 'FMCG & Consumer', 'industry.auto': 'Automotive', 'industry.corporate': 'Corporate & Services',
    'industry.org': 'Organizations', 'industry.education': 'Education', 'industry.health': 'Health & Beauty', 'industry.retail': 'Retail & E-commerce',
    'industry.realestate': 'Real estate', 'industry.other': 'Other',
    'clientStatus.active': 'Active', 'clientStatus.onboarding': 'Onboarding', 'clientStatus.paused': 'Paused', 'clientStatus.ended': 'Ended',
    'projectStatus.brief': 'Brief', 'projectStatus.progress': 'In progress', 'projectStatus.review': 'Client review',
    'projectStatus.delivered': 'Delivered', 'projectStatus.hold': 'On hold',
    'taskStatus.todo': 'To do', 'taskStatus.doing': 'Doing', 'taskStatus.review': 'Review', 'taskStatus.done': 'Done',
    'priority.low': 'Low', 'priority.medium': 'Medium', 'priority.high': 'High', 'priority.urgent': 'Urgent',
    'platform.instagram': 'Instagram', 'platform.facebook': 'Facebook', 'platform.tiktok': 'TikTok', 'platform.linkedin': 'LinkedIn',
    'platform.snapchat': 'Snapchat', 'platform.youtube': 'YouTube', 'platform.x': 'X',
    'format.post': 'Post', 'format.reel': 'Reel', 'format.story': 'Story', 'format.carousel': 'Carousel', 'format.video': 'Video', 'format.ad': 'Ad creative',
    'contentStatus.idea': 'Idea', 'contentStatus.writing': 'Writing', 'contentStatus.design': 'Design', 'contentStatus.approval': 'Client approval',
    'contentStatus.scheduled': 'Scheduled', 'contentStatus.published': 'Published',
    'invoiceStatus.draft': 'Draft', 'invoiceStatus.sent': 'Sent', 'invoiceStatus.paid': 'Paid', 'invoiceStatus.overdue': 'Overdue', 'invoiceStatus.cancelled': 'Cancelled',
    'role.admin': 'Admin', 'role.manager': 'Manager', 'role.member': 'Member',
    'dept.management': 'Management', 'dept.accounts': 'Account management', 'dept.creative': 'Creative & design', 'dept.media': 'Media buying',
    'dept.content': 'Content & social', 'dept.dev': 'Development', 'dept.sales': 'Sales',
    'lostReason.budget': 'Budget', 'lostReason.timing': 'Timing', 'lostReason.competitor': 'Went with a competitor', 'lostReason.noResponse': 'No response',
    'lostReason.fit': 'Not a fit', 'lostReason.other': 'Other',

    'dash.hello.morning': 'Good morning', 'dash.hello.afternoon': 'Good afternoon', 'dash.hello.evening': 'Good evening',
    'dash.pulse': 'Agency pulse', 'dash.level.wave': 'Making waves', 'dash.level.rising': 'Rising', 'dash.level.ripple': 'Ripple', 'dash.level.flatline': 'Flatline',
    'dash.headline.wave': 'The agency is <em>moving.</em>', 'dash.headline.rising': 'Strong — keep it <em>connected.</em>',
    'dash.headline.ripple': 'Movement is <em>starting.</em>', 'dash.headline.flatline': 'Active, but not <em>moving.</em>',
    'dash.sub.wave': 'Follow-ups on time, work delivered, cash coming in. Protect the momentum.',
    'dash.sub.rising': 'Most things are on track. Clear the few items below and the signal gets cleaner.',
    'dash.sub.ripple': 'A few gaps are absorbing momentum. Start with what is overdue.',
    'dash.sub.flatline': 'Too much is slipping. Fix the overdue items first — that is where the biggest jump is.',
    'dash.f.followups': 'late follow-ups', 'dash.f.tasks': 'overdue tasks', 'dash.f.invoices': 'overdue invoices', 'dash.f.content': 'posts behind',
    'dash.f.win': 'win rate',
    'kpi.pipeline': 'Open pipeline', 'kpi.won': 'Won this month', 'kpi.mrr': 'Monthly retainers', 'kpi.outstanding': 'Outstanding',
    'kpi.deals': '{n} open deals', 'kpi.wonDeals': '{n} deals closed', 'kpi.clients': 'from {n} active clients', 'kpi.overdue': '{n} overdue',
    'kpi.allPaid': 'nothing overdue', 'kpi.newLeads': 'New leads', 'kpi.winRate': 'Win rate', 'kpi.revenue': 'Revenue collected',
    'kpi.avgDeal': 'Average deal', 'kpi.cycle': 'Days to close', 'kpi.vsPrev': 'vs previous period',
    'dash.today': 'Today’s focus', 'dash.pipeline': 'Pipeline by stage', 'dash.trend': 'Leads — last 6 months', 'dash.sources': 'Where leads come from',
    'dash.upcoming': 'Next 7 days of content', 'dash.activity': 'Latest activity', 'dash.newLeads': 'New', 'dash.wonLeads': 'Won',
    'dash.empty.today': 'Nothing due. Make some waves.', 'dash.empty.content': 'No posts planned for the next 7 days.',
    'focus.followUp': 'Follow up with {name}', 'focus.task': '{name}', 'focus.invoice': 'Invoice {name} is overdue', 'focus.content': 'Post for {name} is not ready',

    'leads.board': 'Board', 'leads.table': 'Table', 'leads.allOwners': 'All owners', 'leads.allSources': 'All sources', 'leads.allServices': 'All services',
    'leads.search': 'Search leads…', 'leads.lostTitle': 'Mark as lost', 'leads.convertDone': '{name} is now a client.', 'leads.timeline': 'Timeline',
    'leads.notePh': 'Write a note — call summary, objection, next step…', 'leads.stageMoved': 'moved {name} to {stage}',
    'leads.created': 'added lead {name}', 'leads.noted': 'added a note on {name}', 'leads.converted': 'converted {name} to a client',
    'leads.fromPulse': 'Came from the website pulse check', 'leads.openClient': 'Open client', 'leads.allStages': 'All stages',

    'clients.search': 'Search clients…', 'clients.allIndustries': 'All industries', 'clients.allStatus': 'All statuses', 'clients.mo': '/mo',
    'clients.activeProjects': 'Active projects', 'clients.postsMonth': 'Posts this month', 'clients.retainer': 'Retainer',
    'clients.health.good': 'Healthy', 'clients.health.warn': 'Needs attention', 'clients.health.bad': 'At risk', 'clients.created': 'added client {name}',
    'clients.tab.projects': 'Projects', 'clients.tab.content': 'Content', 'clients.tab.invoices': 'Invoices', 'clients.tab.activity': 'Activity',
    'clients.billed': 'Billed', 'clients.paid': 'Paid', 'clients.lifetime': 'Lifetime value',

    'projects.search': 'Search projects…', 'projects.tasks': 'Tasks', 'projects.addTask': 'Add a task and press Enter…', 'projects.created': 'started project {name}',
    'projects.delivered': 'delivered {name}', 'projects.allClients': 'All clients',

    'tasks.mine': 'My tasks', 'tasks.all': 'Everyone', 'tasks.quick': 'Quick add — type a task and press Enter', 'tasks.done': 'completed {name}',
    'tasks.search': 'Search tasks…', 'tasks.allPeople': 'Everyone',

    'cal.allClients': 'All clients', 'cal.allPlatforms': 'All platforms', 'cal.month': 'This month', 'cal.byStatus': 'By status',
    'cal.dow': 'Sat,Sun,Mon,Tue,Wed,Thu,Fri', 'cal.more': '+{n} more', 'cal.moved': 'Moved to {date}', 'cal.published': 'published a post for {name}',

    'inv.paidMonth': 'Paid this month', 'inv.outstanding': 'Outstanding', 'inv.overdue': 'Overdue', 'inv.drafts': 'Drafts',
    'inv.retainers': 'Create this month’s retainer invoices', 'inv.retainersDone': '{n} retainer invoices created as drafts.',
    'inv.retainersNone': 'All retainer invoices for this month already exist.', 'inv.paidLog': 'marked invoice {name} as paid',
    'inv.search': 'Search invoices…', 'inv.allStatus': 'All statuses', 'inv.billTo': 'Bill to', 'inv.thanks': 'Thank you for moving with WAV.',
    'inv.retainerFor': 'Monthly retainer — {month}', 'inv.addItem': 'Add line', 'inv.from': 'From',

    'team.leaderboard': 'Leaderboard — this month', 'team.openLeads': 'Open leads', 'team.wonMonth': 'Won this month', 'team.tasksOpen': 'Open tasks',
    'team.tasksDone': 'Done (month)', 'team.posts': 'Posts (month)', 'team.inactive': 'Inactive', 'team.you': 'You',
    'team.cloudNote': 'Teammates sign in with their email and the password you set here.',

    'rep.period': 'Period', 'rep.month': 'This month', 'rep.lastMonth': 'Last month', 'rep.quarter': 'This quarter', 'rep.year': 'This year', 'rep.all': 'All time',
    'rep.sources': 'Leads & conversion by source', 'rep.funnel': 'Pipeline funnel', 'rep.revenue': 'Revenue collected — last 12 months',
    'rep.lost': 'Why deals are lost', 'rep.team': 'Team performance', 'rep.services': 'Demand by service', 'rep.exports': 'Export data',
    'rep.conv': 'conv.', 'rep.leads': 'Leads', 'rep.won': 'Won', 'rep.value': 'Won value', 'rep.tasks': 'Tasks done', 'rep.posts': 'Posts published',

    'set.workspace': 'Workspace', 'set.agency': 'Agency name', 'set.currency': 'Currency', 'set.vat': 'Default VAT %', 'set.address': 'Address',
    'set.phone': 'Phone', 'set.email': 'Email', 'set.taxId': 'Tax ID', 'set.invPrefix': 'Invoice prefix', 'set.language': 'Language',
    'set.data': 'Data & sync', 'set.mode': 'Mode', 'set.modeDemo': 'Demo — saved in this browser only', 'set.modeCloud': 'Live — Google Sheets',
    'set.url': 'Apps Script Web App URL', 'set.test': 'Test connection', 'set.testOk': 'Connection works.', 'set.disconnect': 'Disconnect',
    'set.backup': 'Download backup (JSON)', 'set.restore': 'Restore backup', 'set.reset': 'Reset demo data', 'set.resetQ': 'Replace all demo data with fresh samples?',
    'set.restored': 'Backup restored.', 'set.saved': 'Settings saved.', 'set.lastSync': 'Last sync', 'set.syncNow': 'Sync now',
    'set.password': 'Change my password', 'set.current': 'Current password', 'set.newPass': 'New password', 'set.passOk': 'Password changed.',
    'set.website': 'Website integration', 'set.websiteText': 'The website contact form and pulse check can drop leads straight into this CRM. In Apps Script, run <b>showWebsiteKey</b> to get the key, then send leads to the same Web App URL with action <b>websiteLead</b>.',
    'set.adminOnly': 'Only admins can change workspace settings.',

    'sync.demo': 'Demo mode', 'sync.ok': 'Synced', 'sync.syncing': 'Syncing…', 'sync.offline': 'Offline — {n} waiting', 'sync.error': 'Sync error',

    'msg.saved': 'Saved.', 'msg.deleted': 'Deleted.', 'msg.deleteQ': 'Delete “{name}”? This can’t be undone.', 'msg.required': 'Fill in the required fields.',
    'msg.noAccess': 'You don’t have access to this.', 'msg.sessionEnded': 'Your session ended. Sign in again.', 'msg.copied': 'Copied.',
    'msg.empty': 'Nothing here yet.', 'msg.noResults': 'No results.', 'msg.offlineSaved': 'Saved offline — will sync when back online.',
    'msg.demoBanner': '<b>Demo mode.</b> Everything you do is saved in this browser only. Connect a Google Sheet from Settings to share data with the team.',
    'msg.connect': 'Connect',

    'time.today': 'Today', 'time.tomorrow': 'Tomorrow', 'time.yesterday': 'Yesterday', 'time.daysAgo': '{n}d ago', 'time.inDays': 'in {n}d',
    'time.justNow': 'just now', 'time.minAgo': '{n}m ago', 'time.hoursAgo': '{n}h ago', 'time.overdue': '{n}d late',

    'pal.jump': 'Go to', 'pal.create': 'Create', 'pal.results': 'Results', 'pal.hint.move': 'navigate', 'pal.hint.open': 'open', 'pal.hint.close': 'close',
  },

  ar: {
    'app.name': 'WAV CRM',
    'app.tag': 'نظام النمو',
    'app.slogan': 'متمشيش ورا الموجة. كون انت الموجة.',

    'nav.overview': 'نظرة عامة', 'nav.sales': 'المبيعات', 'nav.delivery': 'التنفيذ', 'nav.money': 'الفلوس', 'nav.agency': 'الوكالة',
    'nav.dashboard': 'الرئيسية', 'nav.leads': 'العملاء المحتملين', 'nav.clients': 'العملاء', 'nav.projects': 'المشاريع', 'nav.tasks': 'المهام',
    'nav.calendar': 'كالندر المحتوى', 'nav.calendarShort': 'الكالندر', 'nav.invoices': 'الفواتير', 'nav.team': 'الفريق', 'nav.reports': 'التقارير',
    'nav.settings': 'الإعدادات', 'nav.more': 'المزيد', 'nav.leadsShort': 'الليدز',

    'sub.dashboard': 'الوكالة بتتحرك… ولا بس مشغولة؟', 'sub.leads': 'من أول رسالة لحد العقد', 'sub.clients': 'البراندات اللي بنحركها',
    'sub.projects': 'كل الشغل اللي في الإنتاج', 'sub.tasks': 'مين بيعمل إيه، وإمتى', 'sub.calendar': 'خطط، اعتمد، وانشر',
    'sub.invoices': 'الفواتير والـ Retainers والتحصيل', 'sub.team': 'الناس اللي ورا الموجة', 'sub.reports': 'أرقام حقيقية. حركة حقيقية.',
    'sub.settings': 'المساحة والداتا والربط',

    'login.title': 'يلا نعمل <em>Wave.</em>', 'login.lead': 'سجّل دخولك على مساحة شغل WAV.',
    'login.email': 'الإيميل', 'login.password': 'الباسورد', 'login.signin': 'دخول', 'login.signing': 'بنسجّل دخولك…',
    'login.demoBadge': 'نسخة تجريبية', 'login.demoLead': 'اختار حد من الفريق وجرّب. الداتا بتتحفظ على المتصفح ده بس.',
    'login.connect': 'اربط بـ Google Sheet', 'login.connectHint': 'حط لينك الـ Web App اللي طلع من نشر الـ Apps Script.',
    'login.connectBtn': 'اربط', 'login.useDemo': 'استخدم النسخة التجريبية', 'login.connected': 'متربط بـ Google Sheets',
    'login.bad': 'الإيميل أو الباسورد غلط.', 'login.err': 'مقدرناش نوصل للسيرفر. راجع لينك الربط.', 'login.urlBad': 'اللينك ده مش شكل لينك Apps Script Web App.',
    'login.locked': 'محاولات كتير. جرّب تاني بعد كام دقيقة.',

    'top.search': 'دوّر أو روح لـ…', 'top.new': 'جديد', 'top.notifications': 'التنبيهات', 'top.nothing': 'مفيش حاجة متأخرة. تمام.',

    'act.save': 'حفظ', 'act.cancel': 'إلغاء', 'act.delete': 'حذف', 'act.edit': 'تعديل', 'act.close': 'إغلاق', 'act.add': 'إضافة',
    'act.new': 'جديد', 'act.undo': 'تراجع', 'act.export': 'تصدير CSV', 'act.print': 'طباعة / PDF', 'act.markPaid': 'اتدفعت',
    'act.convert': 'حوّله لعميل', 'act.addNote': 'إضافة ملاحظة', 'act.call': 'اتصال', 'act.whatsapp': 'واتساب', 'act.email': 'إيميل',
    'act.logout': 'تسجيل خروج', 'act.viewAll': 'عرض الكل', 'act.today': 'النهارده', 'act.confirm': 'تأكيد', 'act.duplicate': 'نسخ',
    'act.send': 'اتبعتت', 'act.open': 'فتح',

    'new.lead': 'عميل محتمل جديد', 'new.client': 'عميل جديد', 'new.project': 'مشروع جديد', 'new.task': 'مهمة جديدة', 'new.content': 'بوست جديد',
    'new.invoice': 'فاتورة جديدة', 'new.member': 'عضو جديد في الفريق',
    'edit.lead': 'تعديل العميل المحتمل', 'edit.client': 'تعديل العميل', 'edit.project': 'تعديل المشروع', 'edit.task': 'تعديل المهمة', 'edit.content': 'تعديل البوست',
    'edit.invoice': 'تعديل الفاتورة', 'edit.member': 'تعديل عضو الفريق',

    'ent.lead': 'عميل محتمل', 'ent.client': 'عميل', 'ent.project': 'مشروع', 'ent.task': 'مهمة', 'ent.content': 'بوست', 'ent.invoice': 'فاتورة', 'ent.member': 'عضو فريق',

    'f.name': 'الاسم', 'f.company': 'الشركة / البراند', 'f.phone': 'الموبايل / واتساب', 'f.email': 'الإيميل', 'f.source': 'المصدر', 'f.service': 'الخدمة',
    'f.services': 'الخدمات', 'f.value': 'قيمة الصفقة', 'f.stage': 'المرحلة', 'f.owner': 'المسؤول', 'f.followUp': 'المتابعة الجاية',
    'f.industry': 'المجال', 'f.notes': 'ملاحظات', 'f.contact': 'الشخص المسؤول', 'f.retainer': 'الـ Retainer الشهري', 'f.status': 'الحالة',
    'f.manager': 'مدير الحساب', 'f.since': 'عميل من', 'f.color': 'لون البراند', 'f.client': 'العميل', 'f.title': 'العنوان',
    'f.start': 'تاريخ البداية', 'f.due': 'تاريخ التسليم', 'f.budget': 'الميزانية', 'f.progress': 'نسبة الإنجاز %', 'f.project': 'المشروع',
    'f.assignee': 'مسؤول التنفيذ', 'f.priority': 'الأولوية', 'f.platform': 'المنصة', 'f.format': 'النوع', 'f.date': 'تاريخ النشر',
    'f.time': 'الوقت', 'f.caption': 'الكابشن / البريف', 'f.link': 'لينك الملفات', 'f.number': 'رقم الفاتورة', 'f.issue': 'تاريخ الإصدار',
    'f.items': 'البنود', 'f.desc': 'الوصف', 'f.qty': 'الكمية', 'f.price': 'سعر الوحدة', 'f.total': 'الإجمالي', 'f.discount': 'خصم %',
    'f.vat': 'ضريبة القيمة المضافة %', 'f.subtotal': 'المجموع', 'f.role': 'الصلاحية', 'f.dept': 'القسم', 'f.jobTitle': 'المسمى الوظيفي', 'f.password': 'الباسورد',
    'f.passwordHint': 'سيبه فاضي عشان الباسورد الحالي يفضل زي ما هو', 'f.active': 'نشط', 'f.lostReason': 'ليه الصفقة ضاعت؟', 'f.website': 'الموقع / الصفحة',
    'f.pulse': 'نتيجة الـ Pulse', 'f.plan': 'خطة الـ Pulse', 'f.city': 'المدينة', 'f.created': 'اتضاف', 'f.updated': 'آخر تعديل', 'f.paidAt': 'اتدفعت يوم',
    'f.retainerMonth': 'شهر الـ Retainer',

    'stage.new': 'جديد', 'stage.contacted': 'اتكلمنا', 'stage.discovery': 'فهم الاحتياج', 'stage.proposal': 'عرض سعر',
    'stage.negotiation': 'تفاوض', 'stage.won': 'اتقفلت', 'stage.lost': 'ضاعت',
    'source.website': 'الموقع', 'source.pulse': 'Pulse check', 'source.meta': 'إعلانات Meta', 'source.instagram': 'إنستجرام',
    'source.tiktok': 'تيك توك', 'source.google': 'جوجل', 'source.referral': 'ترشيح', 'source.whatsapp': 'واتساب',
    'source.event': 'إيفنت', 'source.cold': 'تواصل مباشر',
    'service.strategy': 'الاستراتيجية والبراند', 'service.content': 'المحتوى والإبداع', 'service.media': 'الإعلانات والأداء',
    'service.tech': 'التكنولوجيا والبرمجة', 'service.digital': 'التصميم والتجربة الرقمية', 'service.growth': 'النمو والتحليل',
    'service.print': 'الطباعة والإنتاج', 'service.consulting': 'استشارات تجربة البيزنس',
    'industry.fnb': 'أكل ومشروبات', 'industry.fmcg': 'سلع استهلاكية', 'industry.auto': 'عربيات', 'industry.corporate': 'شركات وخدمات',
    'industry.org': 'منظمات ومجتمعات', 'industry.education': 'تعليم', 'industry.health': 'صحة وتجميل', 'industry.retail': 'تجزئة وتجارة إلكترونية',
    'industry.realestate': 'عقارات', 'industry.other': 'أخرى',
    'clientStatus.active': 'شغال', 'clientStatus.onboarding': 'بنبدأ معاه', 'clientStatus.paused': 'متوقف مؤقتاً', 'clientStatus.ended': 'خلص',
    'projectStatus.brief': 'بريف', 'projectStatus.progress': 'شغالين', 'projectStatus.review': 'مراجعة العميل',
    'projectStatus.delivered': 'اتسلّم', 'projectStatus.hold': 'متعلّق',
    'taskStatus.todo': 'لسه', 'taskStatus.doing': 'شغالين', 'taskStatus.review': 'مراجعة', 'taskStatus.done': 'خلصت',
    'priority.low': 'عادية', 'priority.medium': 'متوسطة', 'priority.high': 'مهمة', 'priority.urgent': 'عاجلة',
    'platform.instagram': 'إنستجرام', 'platform.facebook': 'فيسبوك', 'platform.tiktok': 'تيك توك', 'platform.linkedin': 'لينكدإن',
    'platform.snapchat': 'سناب شات', 'platform.youtube': 'يوتيوب', 'platform.x': 'X',
    'format.post': 'بوست', 'format.reel': 'ريلز', 'format.story': 'ستوري', 'format.carousel': 'كاروسيل', 'format.video': 'فيديو', 'format.ad': 'تصميم إعلان',
    'contentStatus.idea': 'فكرة', 'contentStatus.writing': 'كتابة', 'contentStatus.design': 'تصميم', 'contentStatus.approval': 'موافقة العميل',
    'contentStatus.scheduled': 'متجدول', 'contentStatus.published': 'اتنشر',
    'invoiceStatus.draft': 'مسودة', 'invoiceStatus.sent': 'اتبعتت', 'invoiceStatus.paid': 'اتدفعت', 'invoiceStatus.overdue': 'متأخرة', 'invoiceStatus.cancelled': 'ملغية',
    'role.admin': 'أدمن', 'role.manager': 'مدير', 'role.member': 'عضو',
    'dept.management': 'الإدارة', 'dept.accounts': 'إدارة الحسابات', 'dept.creative': 'الكرييتف والتصميم', 'dept.media': 'الميديا باينج',
    'dept.content': 'المحتوى والسوشيال', 'dept.dev': 'البرمجة', 'dept.sales': 'المبيعات',
    'lostReason.budget': 'الميزانية', 'lostReason.timing': 'التوقيت', 'lostReason.competitor': 'راح لمنافس', 'lostReason.noResponse': 'مبيردّش',
    'lostReason.fit': 'مش مناسب لينا', 'lostReason.other': 'سبب تاني',

    'dash.hello.morning': 'صباح الخير', 'dash.hello.afternoon': 'نهارك سعيد', 'dash.hello.evening': 'مساء الخير',
    'dash.pulse': 'نبض الوكالة', 'dash.level.wave': 'عاملين Wave', 'dash.level.rising': 'في الطلوع', 'dash.level.ripple': 'تموّج خفيف', 'dash.level.flatline': 'خط مستقيم',
    'dash.headline.wave': 'الوكالة <em>بتتحرك.</em>', 'dash.headline.rising': 'قوي… خليه <em>مربوط.</em>',
    'dash.headline.ripple': 'الحركة <em>بدأت.</em>', 'dash.headline.flatline': 'مشغولين… بس مش <em>بنتحرك.</em>',
    'dash.sub.wave': 'المتابعات في وقتها، الشغل بيتسلّم، والفلوس داخلة. حافظ على الـ Momentum.',
    'dash.sub.rising': 'معظم الحاجات ماشية. خلّص الكام حاجة اللي تحت والإشارة هتبقى أنضف.',
    'dash.sub.ripple': 'فيه فجوات بتمتص الـ Momentum. ابدأ بالحاجات المتأخرة.',
    'dash.sub.flatline': 'حاجات كتير بتفلت. صلّح المتأخر الأول — ده مكان أكبر قفزة.',
    'dash.f.followups': 'متابعات متأخرة', 'dash.f.tasks': 'مهام متأخرة', 'dash.f.invoices': 'فواتير متأخرة', 'dash.f.content': 'بوستات متأخرة',
    'dash.f.win': 'نسبة الإغلاق',
    'kpi.pipeline': 'الـ Pipeline المفتوح', 'kpi.won': 'اتقفل الشهر ده', 'kpi.mrr': 'الـ Retainers الشهرية', 'kpi.outstanding': 'فلوس لسه ماتحصّلتش',
    'kpi.deals': '{n} صفقة مفتوحة', 'kpi.wonDeals': '{n} صفقة اتقفلت', 'kpi.clients': 'من {n} عميل شغال', 'kpi.overdue': '{n} متأخرة',
    'kpi.allPaid': 'مفيش متأخرات', 'kpi.newLeads': 'عملاء محتملين جداد', 'kpi.winRate': 'نسبة الإغلاق', 'kpi.revenue': 'الإيرادات المحصّلة',
    'kpi.avgDeal': 'متوسط الصفقة', 'kpi.cycle': 'أيام للإغلاق', 'kpi.vsPrev': 'مقارنة بالفترة اللي قبلها',
    'dash.today': 'تركيز النهارده', 'dash.pipeline': 'الـ Pipeline حسب المرحلة', 'dash.trend': 'العملاء المحتملين — آخر 6 شهور', 'dash.sources': 'العملاء جايين منين',
    'dash.upcoming': 'محتوى الـ 7 أيام الجاية', 'dash.activity': 'آخر النشاطات', 'dash.newLeads': 'جداد', 'dash.wonLeads': 'اتقفلوا',
    'dash.empty.today': 'مفيش حاجة مستحقة. يلا نعمل Wave.', 'dash.empty.content': 'مفيش بوستات متخططة للـ 7 أيام الجاية.',
    'focus.followUp': 'تابع مع {name}', 'focus.task': '{name}', 'focus.invoice': 'فاتورة {name} متأخرة', 'focus.content': 'بوست {name} لسه مش جاهز',

    'leads.board': 'بورد', 'leads.table': 'جدول', 'leads.allOwners': 'كل المسؤولين', 'leads.allSources': 'كل المصادر', 'leads.allServices': 'كل الخدمات',
    'leads.search': 'دوّر في العملاء المحتملين…', 'leads.lostTitle': 'الصفقة ضاعت', 'leads.convertDone': '{name} بقى عميل.', 'leads.timeline': 'التايم لاين',
    'leads.notePh': 'اكتب ملاحظة — ملخص مكالمة، اعتراض، الخطوة الجاية…', 'leads.stageMoved': 'نقل {name} لمرحلة {stage}',
    'leads.created': 'ضاف {name} كعميل محتمل', 'leads.noted': 'كتب ملاحظة على {name}', 'leads.converted': 'حوّل {name} لعميل',
    'leads.fromPulse': 'جه من الـ Pulse check على الموقع', 'leads.openClient': 'افتح العميل', 'leads.allStages': 'كل المراحل',

    'clients.search': 'دوّر في العملاء…', 'clients.allIndustries': 'كل المجالات', 'clients.allStatus': 'كل الحالات', 'clients.mo': '/شهر',
    'clients.activeProjects': 'مشاريع شغالة', 'clients.postsMonth': 'بوستات الشهر', 'clients.retainer': 'Retainer',
    'clients.health.good': 'تمام', 'clients.health.warn': 'محتاج متابعة', 'clients.health.bad': 'في خطر', 'clients.created': 'ضاف العميل {name}',
    'clients.tab.projects': 'المشاريع', 'clients.tab.content': 'المحتوى', 'clients.tab.invoices': 'الفواتير', 'clients.tab.activity': 'النشاط',
    'clients.billed': 'اتفوتر', 'clients.paid': 'اتدفع', 'clients.lifetime': 'إجمالي التعامل',

    'projects.search': 'دوّر في المشاريع…', 'projects.tasks': 'المهام', 'projects.addTask': 'اكتب مهمة واضغط Enter…', 'projects.created': 'بدأ مشروع {name}',
    'projects.delivered': 'سلّم {name}', 'projects.allClients': 'كل العملاء',

    'tasks.mine': 'مهامي', 'tasks.all': 'الكل', 'tasks.quick': 'إضافة سريعة — اكتب المهمة واضغط Enter', 'tasks.done': 'خلّص {name}',
    'tasks.search': 'دوّر في المهام…', 'tasks.allPeople': 'الكل',

    'cal.allClients': 'كل العملاء', 'cal.allPlatforms': 'كل المنصات', 'cal.month': 'الشهر ده', 'cal.byStatus': 'حسب الحالة',
    'cal.dow': 'السبت,الأحد,الاتنين,التلات,الأربع,الخميس,الجمعة', 'cal.more': '+{n} كمان', 'cal.moved': 'اتنقل لـ {date}', 'cal.published': 'نشر بوست لـ {name}',

    'inv.paidMonth': 'اتحصّل الشهر ده', 'inv.outstanding': 'لسه ماتحصّلش', 'inv.overdue': 'متأخر', 'inv.drafts': 'مسودات',
    'inv.retainers': 'اعمل فواتير الـ Retainer للشهر ده', 'inv.retainersDone': 'اتعمل {n} فاتورة Retainer كمسودة.',
    'inv.retainersNone': 'كل فواتير الـ Retainer للشهر ده موجودة بالفعل.', 'inv.paidLog': 'سجّل إن فاتورة {name} اتدفعت',
    'inv.search': 'دوّر في الفواتير…', 'inv.allStatus': 'كل الحالات', 'inv.billTo': 'الفاتورة لـ', 'inv.thanks': 'شكراً إنك بتتحرك مع WAV.',
    'inv.retainerFor': 'Retainer شهري — {month}', 'inv.addItem': 'إضافة بند', 'inv.from': 'من',

    'team.leaderboard': 'الترتيب — الشهر ده', 'team.openLeads': 'عملاء مفتوحين', 'team.wonMonth': 'اتقفل الشهر ده', 'team.tasksOpen': 'مهام مفتوحة',
    'team.tasksDone': 'خلصت (الشهر)', 'team.posts': 'بوستات (الشهر)', 'team.inactive': 'غير نشط', 'team.you': 'انت',
    'team.cloudNote': 'أعضاء الفريق بيدخلوا بالإيميل والباسورد اللي انت بتحطه هنا.',

    'rep.period': 'الفترة', 'rep.month': 'الشهر ده', 'rep.lastMonth': 'الشهر اللي فات', 'rep.quarter': 'الربع ده', 'rep.year': 'السنة دي', 'rep.all': 'كل الوقت',
    'rep.sources': 'العملاء ونسبة التحويل حسب المصدر', 'rep.funnel': 'قمع الـ Pipeline', 'rep.revenue': 'الإيرادات المحصّلة — آخر 12 شهر',
    'rep.lost': 'الصفقات بتضيع ليه', 'rep.team': 'أداء الفريق', 'rep.services': 'الطلب حسب الخدمة', 'rep.exports': 'تصدير الداتا',
    'rep.conv': 'تحويل', 'rep.leads': 'عملاء', 'rep.won': 'اتقفل', 'rep.value': 'قيمة المقفول', 'rep.tasks': 'مهام خلصت', 'rep.posts': 'بوستات اتنشرت',

    'set.workspace': 'مساحة الشغل', 'set.agency': 'اسم الوكالة', 'set.currency': 'العملة', 'set.vat': 'الضريبة الافتراضية %', 'set.address': 'العنوان',
    'set.phone': 'التليفون', 'set.email': 'الإيميل', 'set.taxId': 'الرقم الضريبي', 'set.invPrefix': 'بادئة رقم الفاتورة', 'set.language': 'اللغة',
    'set.data': 'الداتا والمزامنة', 'set.mode': 'الوضع', 'set.modeDemo': 'تجريبي — محفوظ على المتصفح ده بس', 'set.modeCloud': 'لايف — Google Sheets',
    'set.url': 'لينك الـ Apps Script Web App', 'set.test': 'اختبر الربط', 'set.testOk': 'الربط شغال.', 'set.disconnect': 'افصل الربط',
    'set.backup': 'نزّل نسخة احتياطية (JSON)', 'set.restore': 'استرجع نسخة احتياطية', 'set.reset': 'رجّع الداتا التجريبية', 'set.resetQ': 'نبدّل كل الداتا التجريبية بداتا جديدة؟',
    'set.restored': 'النسخة الاحتياطية رجعت.', 'set.saved': 'الإعدادات اتحفظت.', 'set.lastSync': 'آخر مزامنة', 'set.syncNow': 'زامن دلوقتي',
    'set.password': 'غيّر الباسورد بتاعي', 'set.current': 'الباسورد الحالي', 'set.newPass': 'الباسورد الجديد', 'set.passOk': 'الباسورد اتغيّر.',
    'set.website': 'الربط مع الموقع', 'set.websiteText': 'فورم التواصل والـ Pulse check في الموقع يقدروا يدخّلوا العملاء على الـ CRM ده على طول. في الـ Apps Script شغّل <b>showWebsiteKey</b> عشان تاخد المفتاح، وبعدين ابعت العملاء لنفس لينك الـ Web App بـ action اسمه <b>websiteLead</b>.',
    'set.adminOnly': 'الأدمن بس هو اللي يقدر يغيّر إعدادات المساحة.',

    'sync.demo': 'وضع تجريبي', 'sync.ok': 'متزامن', 'sync.syncing': 'بنزامن…', 'sync.offline': 'أوفلاين — {n} مستني', 'sync.error': 'مشكلة في المزامنة',

    'msg.saved': 'اتحفظ.', 'msg.deleted': 'اتحذف.', 'msg.deleteQ': 'تحذف “{name}”؟ مش هتقدر ترجّعه.', 'msg.required': 'كمّل الخانات المطلوبة.',
    'msg.noAccess': 'معندكش صلاحية على ده.', 'msg.sessionEnded': 'الجلسة خلصت. سجّل دخول تاني.', 'msg.copied': 'اتنسخ.',
    'msg.empty': 'مفيش حاجة هنا لسه.', 'msg.noResults': 'مفيش نتايج.', 'msg.offlineSaved': 'اتحفظ أوفلاين — هيتزامن أول ما النت يرجع.',
    'msg.demoBanner': '<b>وضع تجريبي.</b> كل اللي بتعمله بيتحفظ على المتصفح ده بس. اربط Google Sheet من الإعدادات عشان الفريق كله يشوف نفس الداتا.',
    'msg.connect': 'اربط',

    'time.today': 'النهارده', 'time.tomorrow': 'بكرة', 'time.yesterday': 'امبارح', 'time.daysAgo': 'من {n} يوم', 'time.inDays': 'بعد {n} يوم',
    'time.justNow': 'دلوقتي', 'time.minAgo': 'من {n} دقيقة', 'time.hoursAgo': 'من {n} ساعة', 'time.overdue': 'متأخر {n} يوم',

    'pal.jump': 'روح لـ', 'pal.create': 'اعمل', 'pal.results': 'النتايج', 'pal.hint.move': 'تنقّل', 'pal.hint.open': 'افتح', 'pal.hint.close': 'اقفل',
  },
};

let LANG = (() => { try { const q = new URLSearchParams(location.search).get('lang'); if (q === 'ar' || q === 'en') return q; return localStorage.getItem('wav_lang') || 'ar'; } catch (e) { return 'ar'; } })();

function t(key, vars) {
  let s = I18N[LANG][key];
  if (s === undefined) s = I18N.en[key];
  if (s === undefined) return key;
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
  return s;
}
function setLang(l) {
  LANG = l;
  try { localStorage.setItem('wav_lang', l); } catch (e) {}
  document.documentElement.lang = l;
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
}
setLang(LANG);
