import { type ReactNode, type CSSProperties, useEffect, useMemo, useState } from 'react';

/* ── Inline SVG icons (no dep needed) ────────────────────── */
const Icon = {
  Grid: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  CreditCard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  Database: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  ),
  Refresh: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
  Server: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
      <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
    </svg>
  ),
  Terminal: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Chevron: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  More: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
    </svg>
  ),
  Key: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  EyeOff: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  Save: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
  ),
};

/* ── Types ───────────────────────────────────────────────── */
type NavId = 'overview' | 'customers' | 'billing' | 'data-pipelines' | 'system-health' | 'config';

type ConfigKeyEntry = {
  key: string; label: string; hint: string; secret: boolean;
  masked: string | null; source: 'db' | 'env' | 'unset'; isSet: boolean;
};
type ConfigGroup = { id: string; label: string; description: string; keys: ConfigKeyEntry[] };
type AdminConfigResponse = { data?: { groups?: ConfigGroup[] } };

type StatusTone = 'good' | 'warn' | 'neutral';

type AdminStatusResponse = {
  data?: {
    sourceSummaries?: SourceSummary[];
    recentRuns?: RecentRun[];
    notes?: string[];
  };
  meta?: { generatedAt?: string; totalSources?: number; totalRecentRuns?: number };
};

type AdminOverviewResponse = {
  data?: {
    customers?: CustomerSummary[];
    usageOverview?: UsageOverview | null;
    databaseOverview?: DatabaseOverview | null;
  };
  meta?: { generatedAt?: string; dataAvailable?: boolean; fallbackReason?: string; periodStart?: string };
};

type BillingPlansResponse = {
  data?: BillingPlan[];
  meta?: { mode?: string; checkoutConfigured?: boolean; webhookConfigured?: boolean };
};

type HealthResponse = { status?: string; service?: string; timestamp?: string };

type SourceSummary = {
  sourceCode: string; sourceName: string; countryCode: string; status: string;
  licenseTag: string; accessMethod: string; commercialReuseAllowed: boolean;
  updateCadence: string | null; companiesCount: number; sourceRecordsCount: number;
  ingestionRunsCount: number;
  latestRun: { status: string; startedAt: string | null; completedAt: string | null; recordsSeen: number; recordsWritten: number; recordsFailed: number } | null;
};

type RecentRun = {
  id: string; sourceCode: string; sourceName: string; countryCode: string; runType: string;
  status: string; startedAt: string | null; completedAt: string | null;
  recordsSeen: number; recordsWritten: number; recordsFailed: number;
  checkpoint: string | null; errorMessage: string | null;
};

type BillingPlan = { code: string; displayName: string; monthlyQuota: number; rpmLimit: number; notes?: string };

type CustomerSummary = {
  id: string; email: string; name: string | null; companyName: string | null; countryCode: string | null;
  defaultPlan: string; status: string;
  subscription: { planName: string; status: string | null; monthlyQuota: number | null; rpmLimit: number | null } | null;
  activeApiKeys: number; lastApiKeyUsedAt: string | null; currentPeriodTotalRequests: number;
};

type UsageOverview = {
  activeCustomers: number; activeApiKeys: number; currentPeriodTotalRequests: number;
  currentPeriodSearchRequests: number; currentPeriodLookupRequests: number;
  currentPeriodChangesRequests: number; usageEventCount: number; latestUsageAt: string | null;
};

type DatabaseOverview = {
  companyCount: number; ingestedCompanyCount: number; seededCompanyCount: number;
  addressCount: number; activityCount: number; sourceRecordCount: number; latestCompanySourceAt: string | null;
};

type LoadState = { loading: boolean; error: string | null; lastUpdated: string | null; apiReachable: boolean };

/* ── Constants ───────────────────────────────────────────── */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3011';

const NAV: { id: NavId; label: string; group: string; icon: keyof typeof Icon }[] = [
  { id: 'overview',       label: 'Overview',       group: 'Dashboards',      icon: 'Grid'       },
  { id: 'customers',      label: 'Customers & API', group: 'Dashboards',      icon: 'Users'      },
  { id: 'billing',        label: 'Billing & MRR',  group: 'Dashboards',      icon: 'CreditCard' },
  { id: 'data-pipelines', label: 'Data Pipelines',  group: 'Infrastructure',  icon: 'Database'   },
  { id: 'system-health',  label: 'System Health',   group: 'Infrastructure',  icon: 'Server'     },
  { id: 'config',         label: 'Config & Secrets', group: 'Infrastructure', icon: 'Key'        },
];

const fallbackCustomerRows = [{
  name: 'Company Data Demo', owner: 'demo@companydata.local', plan: 'free',
  usage: '0 / 1,000', usageDetail: 'No live customer usage connected yet',
  keys: '1 key', lastSeen: '—', status: 'Healthy', tone: 'neutral' as const,
  action: 'Review onboarding', note: 'Seeded local account row'
}];

/* ── Helpers ─────────────────────────────────────────────── */
function fmt(v: number) { return new Intl.NumberFormat('en-US').format(v); }
function fmtC(v: number) { return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v); }
function fmtWhen(v: string | null | undefined) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(d) + ' UTC';
}
function fmtDur(s: string | null, e: string | null) {
  if (!s || !e) return 'In progress';
  const ms = new Date(e).getTime() - new Date(s).getTime();
  if (ms < 0) return '—';
  const sec = Math.round(ms / 1000);
  return `${Math.floor(sec / 60)}m ${String(sec % 60).padStart(2, '0')}s`;
}
function tone(status: string): StatusTone {
  if (['succeeded','completed','healthy','ok','active'].includes(status)) return 'good';
  if (['running','partial','degraded','watch'].includes(status)) return 'warn';
  return 'neutral';
}
function humanize(v: string) { return v.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }

/* ── Sub-components ──────────────────────────────────────── */
function Badge({ label, t }: { label: string; t: StatusTone }) {
  return <span className={`a-badge ${t === 'good' ? 'ok' : t === 'warn' ? 'warn' : ''}`}>{label}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cls = (s === 'active' || s === 'healthy' || s === 'paid' || s === 'completed' || s === 'succeeded') ? 'ok'
    : (s === 'syncing' || s === 'warning' || s === 'in progress' || s === 'partial' || s === 'running' || s === 'watch') ? 'warn'
    : (s === 'suspended' || s === 'failed' || s === 'error' || s === 'degraded') ? 'danger'
    : '';
  return <span className={`a-badge ${cls}`}>{status}</span>;
}

function Card({ title, action, children, style }: {
  title?: string; action?: ReactNode; children: ReactNode; style?: CSSProperties
}) {
  return (
    <div className="a-card" style={style}>
      {(title || action) && (
        <div className="a-card-head">
          {title && <span className="a-card-title">{title}</span>}
          {action}
        </div>
      )}
      <div className="a-card-body">{children}</div>
    </div>
  );
}

/* ── Main App ────────────────────────────────────────────── */
export default function App() {
  const [active, setActive] = useState<NavId>('overview');
  const [load, setLoad] = useState<LoadState>({ loading: true, error: null, lastUpdated: null, apiReachable: false });
  const [adminStatus, setAdminStatus] = useState<AdminStatusResponse | null>(null);
  const [adminOverview, setAdminOverview] = useState<AdminOverviewResponse | null>(null);
  const [billingPlans, setBillingPlans] = useState<BillingPlansResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [adminConfig, setAdminConfig] = useState<AdminConfigResponse | null>(null);
  const [configDraft, setConfigDraft] = useState<Record<string, string>>({});
  const [configReveal, setConfigReveal] = useState<Set<string>>(new Set());
  const [configSaving, setConfigSaving] = useState(false);
  const [configSaved, setConfigSaved] = useState<string | null>(null);

  const activeNav = useMemo(() => NAV.find(n => n.id === active) ?? NAV[0], [active]);

  async function loadData() {
    setLoad(c => ({ ...c, loading: true, error: null }));
    try {
      const [hRes, asRes, aoRes, bpRes, acRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/health`),
        fetch(`${API_BASE_URL}/v1/admin/status`),
        fetch(`${API_BASE_URL}/v1/admin/overview`),
        fetch(`${API_BASE_URL}/v1/billing/plans`),
        fetch(`${API_BASE_URL}/v1/admin/config`),
      ]);
      let reachable = false;
      const errs: string[] = [];
      let nextH: HealthResponse | null = null;
      let nextAs: AdminStatusResponse | null = null;
      let nextAo: AdminOverviewResponse | null = null;
      let nextBp: BillingPlansResponse | null = null;
      let nextAc: AdminConfigResponse | null = null;

      if (hRes.status === 'fulfilled' && hRes.value.ok) { reachable = true; nextH = await hRes.value.json() as HealthResponse; } else errs.push('health');
      if (asRes.status === 'fulfilled' && asRes.value.ok) { reachable = true; nextAs = await asRes.value.json() as AdminStatusResponse; } else errs.push('admin status');
      if (aoRes.status === 'fulfilled' && aoRes.value.ok) { reachable = true; nextAo = await aoRes.value.json() as AdminOverviewResponse; } else errs.push('admin overview');
      if (bpRes.status === 'fulfilled' && bpRes.value.ok) { reachable = true; nextBp = await bpRes.value.json() as BillingPlansResponse; } else errs.push('billing plans');
      if (acRes.status === 'fulfilled' && acRes.value.ok) { reachable = true; nextAc = await acRes.value.json() as AdminConfigResponse; } else errs.push('admin config');

      setHealth(nextH); setAdminStatus(nextAs); setAdminOverview(nextAo); setBillingPlans(nextBp); setAdminConfig(nextAc);
      setLoad({ loading: false, error: errs.length === 4 ? `Could not reach ${API_BASE_URL}. Showing fallback data.` : null, lastUpdated: new Date().toISOString(), apiReachable: reachable });
    } catch (err) {
      setLoad({ loading: false, error: err instanceof Error ? err.message : 'Load failed', lastUpdated: new Date().toISOString(), apiReachable: false });
    }
  }

  useEffect(() => { void loadData(); }, []);
  useEffect(() => { document.title = `CompanyData Ops · ${activeNav.label}`; }, [activeNav]);
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ── Derived data ─────────────────────────────────────── */
  const sources = adminStatus?.data?.sourceSummaries ?? [];
  const runs = adminStatus?.data?.recentRuns ?? [];
  const adminNotes = adminStatus?.data?.notes ?? [];
  const plans = billingPlans?.data ?? [];
  const customers = adminOverview?.data?.customers ?? [];
  const usageOv = adminOverview?.data?.usageOverview ?? null;
  const dbOv = adminOverview?.data?.databaseOverview ?? null;

  const activeSources = sources.filter(s => s.status === 'active').length;
  const failedRuns = runs.filter(r => r.status === 'failed').length;
  const runningRuns = runs.filter(r => r.status === 'running').length;
  const totalCompanies = dbOv?.companyCount ?? sources.reduce((a, s) => a + s.companiesCount, 0);
  const latestRun = runs.find(r => r.completedAt);

  const kpis = [
    { label: 'Active customers',  value: usageOv ? String(usageOv.activeCustomers) : String(customers.length || 1),        sub: usageOv ? `${fmt(usageOv.activeApiKeys)} active keys` : 'Seeded fallback', good: true },
    { label: 'API calls (30d)',    value: usageOv ? fmtC(usageOv.currentPeriodTotalRequests) : runs.length > 0 ? fmtC(runs.reduce((a, r) => a + r.recordsWritten, 0)) : '0', sub: usageOv ? `${fmt(usageOv.usageEventCount)} events recorded` : 'Ingestion-derived proxy', good: true },
    { label: 'Companies tracked', value: totalCompanies > 0 ? fmtC(totalCompanies) : '2',                                  sub: dbOv ? `${fmtC(dbOv.sourceRecordCount)} source records` : 'Fallback aggregate', good: true },
    { label: 'Last ingest',       value: latestRun?.completedAt ? fmtWhen(latestRun.completedAt) : dbOv?.latestCompanySourceAt ? fmtWhen(dbOv.latestCompanySourceAt) : '—', sub: latestRun ? `${latestRun.sourceCode} · ${humanize(latestRun.status)}` : 'No completed run yet', good: false },
  ];

  const customerRows = customers.length > 0
    ? customers.map(c => {
        const planName = c.subscription?.planName ?? c.defaultPlan;
        const quota = c.subscription?.monthlyQuota;
        const usage = c.currentPeriodTotalRequests;
        const ratio = quota && quota > 0 ? usage / quota : null;
        const inactive = c.status !== 'active';
        const noKeys = c.activeApiKeys === 0;
        const highUsage = ratio !== null && ratio >= 0.8;
        const t: StatusTone = inactive || noKeys || highUsage ? 'warn' : 'good';
        return {
          name: c.companyName || c.name || c.email, email: c.email,
          plan: planName, usage: quota ? `${fmt(usage)} / ${fmt(quota)}` : `${fmt(usage)} calls`,
          keys: `${c.activeApiKeys} key${c.activeApiKeys === 1 ? '' : 's'}`,
          lastSeen: fmtWhen(c.lastApiKeyUsedAt),
          status: inactive ? 'Watch' : highUsage ? 'High usage' : noKeys ? 'Key gap' : 'Healthy', tone: t,
          joined: c.countryCode ?? '—',
        };
      }).sort((a, b) => (b.tone === 'warn' ? 1 : 0) - (a.tone === 'warn' ? 1 : 0) || a.name.localeCompare(b.name))
    : fallbackCustomerRows.map(r => ({ name: r.name, email: r.owner, plan: r.plan, usage: r.usage, keys: r.keys, lastSeen: r.lastSeen, status: r.status, tone: r.tone, joined: '—' }));

  const sourceRows = sources.length > 0
    ? sources.map(s => ({ name: `${s.countryCode} · ${s.sourceName}`, status: s.latestRun?.status === 'failed' ? 'Degraded' : s.status === 'active' ? 'Active' : 'Watch', updated: fmtWhen(s.latestRun?.completedAt ?? s.latestRun?.startedAt), records: s.sourceRecordsCount > 0 ? fmtC(s.sourceRecordsCount) : '—' }))
    : [
        { name: 'CVR', status: 'Active', updated: '2 min ago', records: '924K' },
        { name: 'Bolagsverket', status: 'Active', updated: '15 min ago', records: '1.2M' },
        { name: 'KVK', status: 'Watch', updated: 'Syncing (45%)', records: '2.1M' },
        { name: 'Handelsregister', status: 'Degraded', updated: '4 hours ago', records: '3.8M' },
        { name: 'Companies House', status: 'Active', updated: '1 min ago', records: '5.2M' },
      ];

  const runRows = runs.length > 0
    ? runs.slice(0, 6).map(r => ({ source: r.sourceName, started: fmtWhen(r.startedAt), duration: fmtDur(r.startedAt, r.completedAt), records: fmt(r.recordsWritten), status: humanize(r.status) }))
    : [
        { source: 'KVK (NL)', started: '10:15 AM', duration: 'In progress', records: '145,000', status: 'Syncing' },
        { source: 'CVR (DK)', started: '09:00 AM', duration: '14m 22s', records: '12,450', status: 'Completed' },
        { source: 'Companies House (UK)', started: '08:30 AM', duration: '45m 10s', records: '84,200', status: 'Completed' },
        { source: 'Handelsregister (DE)', started: '06:00 AM', duration: '2m 14s', records: '0', status: 'Failed' },
      ];

  const statusChecks = [
    { service: 'API Gateway', meta: health?.status === 'ok' ? 'p95: healthy' : `Expected on ${API_BASE_URL}`, status: health?.status === 'ok' ? 'Healthy' : load.apiReachable ? 'Watch' : 'Offline' },
    { service: 'Database (Primary)', meta: dbOv ? `${fmt(dbOv.companyCount)} companies` : 'load: unknown', status: dbOv ? 'Healthy' : 'Watch' },
    { service: 'Ingestion Workers', meta: runningRuns > 0 ? `${runningRuns} run(s) active` : failedRuns > 0 ? `${failedRuns} failed` : 'idle', status: failedRuns > 0 ? 'Degraded' : runningRuns > 0 ? 'Active' : 'Idle' },
    { service: 'Admin overview', meta: adminOverview?.meta?.dataAvailable ? 'DB-backed snapshot' : (adminOverview?.meta?.fallbackReason ?? 'Fallback mode'), status: adminOverview?.meta?.dataAvailable ? 'Healthy' : 'Watch' },
    { service: 'Billing', meta: billingPlans?.meta?.checkoutConfigured ? 'Checkout configured' : 'Checkout not wired', status: billingPlans?.meta?.checkoutConfigured ? 'Healthy' : 'Watch' },
  ];

  const logLines = [
    ...(adminNotes.length > 0 ? adminNotes : []),
    ...(adminOverview?.meta?.dataAvailable ? ['Customer snapshot is live from local database.'] : [adminOverview?.meta?.fallbackReason ?? 'Admin overview not available — fallback active.']),
  ].slice(0, 8);

  const billingRows = customers.length > 0
    ? customers.slice(0, 5).map(c => ({
        account: c.companyName || c.email,
        plan: c.subscription?.planName ?? c.defaultPlan,
        amount: c.subscription?.rpmLimit ? `${fmt(c.subscription.rpmLimit)} rpm` : 'Default',
        status: humanize(c.subscription?.status ?? 'no subscription'),
      }))
    : plans.slice(0, 4).map(p => ({
        account: p.displayName,
        plan: p.notes ?? `${fmt(p.monthlyQuota)} req/mo`,
        amount: p.code === 'free' ? 'Free' : `${fmt(p.rpmLimit)} rpm`,
        status: p.code === 'enterprise' ? 'Manual path' : 'Config present',
      }));

  /* ── Nav groups ───────────────────────────────────────── */
  const navGroups = NAV.reduce<Record<string, typeof NAV>>((acc, n) => {
    (acc[n.group] ??= []).push(n);
    return acc;
  }, {});

  const utcTime = now.toISOString().slice(11, 19);

  /* ── Tab renderers ────────────────────────────────────── */
  function renderOverview() {
    return (
      <div className="a-overview">
        {/* KPI row */}
        <div className="a-kpi-grid">
          {kpis.map(k => (
            <div className="a-kpi" key={k.label}>
              <div className="a-kpi-label">{k.label}</div>
              <div className="a-kpi-value">{k.value}</div>
              <div className={`a-kpi-sub ${k.good ? '' : 'neutral'}`}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Customer table */}
        <Card title="Customer Overview" action={
          <button className="a-card-action">
            <Icon.Plus /> New Customer
          </button>
        }>
          <table className="a-table">
            <thead>
              <tr>
                <th>Customer / Company</th>
                <th>Plan</th>
                <th>API Calls</th>
                <th>Status</th>
                <th>Country</th>
                <th>Last Active</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customerRows.map(row => (
                <tr key={row.name + row.email}>
                  <td>
                    <div className="a-td-main">{row.name}</div>
                    <div className="a-td-sub">{row.email}</div>
                  </td>
                  <td>
                    <span className="a-badge">{row.plan}</span>
                  </td>
                  <td><span className="mono">{row.usage}</span></td>
                  <td><StatusBadge status={row.status} /></td>
                  <td><span className="mono">{row.joined}</span></td>
                  <td><span className="mono" style={{ color: 'var(--muted)' }}>{row.lastSeen}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button style={{ color: 'var(--muted)', padding: '4px' }}>
                      <Icon.More />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Two column */}
        <div className="a-two-col">
          <div className="a-col">
            {/* Sources */}
            <Card title="Data Sources & Integrations">
              <table className="a-table">
                <thead>
                  <tr>
                    <th>Registry</th><th>Status</th><th>Last Updated</th><th>Records</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceRows.slice(0, 5).map(s => (
                    <tr key={s.name}>
                      <td><span className="a-td-main">{s.name}</span></td>
                      <td><StatusBadge status={s.status} /></td>
                      <td><span className="mono" style={{ color: 'var(--muted)' }}>{s.updated}</span></td>
                      <td><span className="mono">{s.records}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* Runs */}
            <Card title="Recent Ingestion Runs">
              <table className="a-table">
                <thead>
                  <tr>
                    <th>Source</th><th>Started</th><th>Duration</th><th>Records</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {runRows.map(r => (
                    <tr key={r.source + r.started}>
                      <td><span style={{ color: '#fff', fontWeight: 500 }}>{r.source}</span></td>
                      <td><span className="mono" style={{ color: 'var(--muted)' }}>{r.started}</span></td>
                      <td><span className="mono">{r.duration}</span></td>
                      <td><span className="mono">{r.records}</span></td>
                      <td><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          <div className="a-col">
            {/* System health */}
            <Card title="System Health">
              <div className="a-health-list">
                {statusChecks.map(c => (
                  <div className="a-health-row" key={c.service}>
                    <div>
                      <div className="a-health-service">{c.service}</div>
                      <div className="a-health-meta">{c.meta}</div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Live logs */}
            <Card title="Live Logs" action={<Icon.Terminal />}>
              <div style={{ padding: '4px 0' }}>
                {logLines.length > 0 ? logLines.map((line, i) => (
                  <div className="a-log-entry" key={i}>
                    <span className="a-log-level info">INFO</span>
                    <span className="a-log-msg">{line}</span>
                  </div>
                )) : (
                  <div className="a-log-entry">
                    <span className="a-log-level info">INFO</span>
                    <span className="a-log-msg">No log entries in current payload.</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Recent billing */}
            <Card title="Billing Summary">
              <table className="a-table">
                <tbody>
                  {billingRows.slice(0, 4).map(b => (
                    <tr key={b.account}>
                      <td>
                        <div className="a-td-main">{b.account}</div>
                        <div className="a-td-sub">{b.plan}</div>
                      </td>
                      <td style={{ textAlign: 'right' }}><span className="mono">{b.amount}</span></td>
                      <td style={{ textAlign: 'right' }}><StatusBadge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  function renderCustomers() {
    return (
      <div className="a-overview">
        <Card title="All Customers" action={
          <span className="a-badge">{customerRows.length} account{customerRows.length !== 1 ? 's' : ''}</span>
        }>
          <table className="a-table">
            <thead>
              <tr>
                <th>Customer</th><th>Plan</th><th>Requests</th><th>Keys</th><th>Status</th><th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {customerRows.map(row => (
                <tr key={row.name + row.email}>
                  <td>
                    <div className="a-td-main">{row.name}</div>
                    <div className="a-td-sub">{row.email}</div>
                  </td>
                  <td><span className="a-badge">{row.plan}</span></td>
                  <td><span className="mono">{row.usage}</span></td>
                  <td><span className="mono">{row.keys}</span></td>
                  <td><StatusBadge status={row.status} /></td>
                  <td><span className="mono" style={{ color: 'var(--muted)' }}>{row.lastSeen}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {usageOv && (
          <div className="a-kpi-grid">
            <div className="a-kpi">
              <div className="a-kpi-label">Active customers</div>
              <div className="a-kpi-value">{usageOv.activeCustomers}</div>
              <div className="a-kpi-sub">{fmt(usageOv.activeApiKeys)} active keys</div>
            </div>
            <div className="a-kpi">
              <div className="a-kpi-label">Total requests</div>
              <div className="a-kpi-value">{fmtC(usageOv.currentPeriodTotalRequests)}</div>
              <div className="a-kpi-sub">{fmt(usageOv.currentPeriodSearchRequests)} search · {fmt(usageOv.currentPeriodLookupRequests)} lookup</div>
            </div>
            <div className="a-kpi">
              <div className="a-kpi-label">Usage events</div>
              <div className="a-kpi-value">{fmtC(usageOv.usageEventCount)}</div>
              <div className="a-kpi-sub neutral">{usageOv.latestUsageAt ? `Last: ${fmtWhen(usageOv.latestUsageAt)}` : 'No events yet'}</div>
            </div>
            <div className="a-kpi">
              <div className="a-kpi-label">Companies in DB</div>
              <div className="a-kpi-value">{dbOv ? fmtC(dbOv.companyCount) : '—'}</div>
              <div className="a-kpi-sub neutral">{dbOv ? `${fmtC(dbOv.sourceRecordCount)} source records` : 'DB overview not available'}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderBilling() {
    return (
      <div className="a-overview">
        <Card title="Billing Overview" action={
          <span className="a-badge">{billingPlans?.meta?.checkoutConfigured ? 'Checkout ready' : 'Needs wiring'}</span>
        }>
          <table className="a-table">
            <thead>
              <tr><th>Account</th><th>Plan</th><th>Rate limit</th><th>Status</th></tr>
            </thead>
            <tbody>
              {billingRows.map(b => (
                <tr key={b.account}>
                  <td><span className="a-td-main">{b.account}</span></td>
                  <td><span className="a-badge">{b.plan}</span></td>
                  <td><span className="mono">{b.amount}</span></td>
                  <td><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="a-main-grid">
          <Card title="Plan Configuration">
            <table className="a-table">
              <thead><tr><th>Plan</th><th>Quota / month</th><th>Rate limit</th><th>Notes</th></tr></thead>
              <tbody>
                {plans.map(p => (
                  <tr key={p.code}>
                    <td><span className="a-td-main">{p.displayName}</span></td>
                    <td><span className="mono">{p.monthlyQuota === 0 ? 'Custom' : fmt(p.monthlyQuota)}</span></td>
                    <td><span className="mono">{p.rpmLimit === 0 ? 'Custom' : `${fmt(p.rpmLimit)} rpm`}</span></td>
                    <td style={{ color: 'var(--muted)' }}>{p.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card title="Billing Config Status">
            <div className="a-health-list">
              <div className="a-health-row">
                <div><div className="a-health-service">Checkout</div><div className="a-health-meta">{billingPlans?.meta?.checkoutConfigured ? 'Configured' : 'Not wired'}</div></div>
                <StatusBadge status={billingPlans?.meta?.checkoutConfigured ? 'Healthy' : 'Watch'} />
              </div>
              <div className="a-health-row">
                <div><div className="a-health-service">Webhook</div><div className="a-health-meta">{billingPlans?.meta?.webhookConfigured ? 'Configured' : 'Missing'}</div></div>
                <StatusBadge status={billingPlans?.meta?.webhookConfigured ? 'Healthy' : 'Watch'} />
              </div>
              <div className="a-health-row">
                <div><div className="a-health-service">Billing mode</div><div className="a-health-meta">{billingPlans?.meta?.mode ?? '—'}</div></div>
                <StatusBadge status={billingPlans?.meta?.mode === 'stripe' ? 'Active' : 'Watch'} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  function renderPipelines() {
    const liveSources = sources.length > 0;
    return (
      <div className="a-overview">

        {/* DB stats strip */}
        {dbOv && (
          <div className="a-kpi-grid">
            <div className="a-kpi"><div className="a-kpi-label">Companies in DB</div><div className="a-kpi-value">{fmtC(dbOv.companyCount)}</div><div className="a-kpi-sub">{fmtC(dbOv.ingestedCompanyCount)} ingested · {fmtC(dbOv.seededCompanyCount)} seeded</div></div>
            <div className="a-kpi"><div className="a-kpi-label">Source records</div><div className="a-kpi-value">{fmtC(dbOv.sourceRecordCount)}</div><div className="a-kpi-sub neutral">raw payloads stored</div></div>
            <div className="a-kpi"><div className="a-kpi-label">Addresses</div><div className="a-kpi-value">{fmtC(dbOv.addressCount)}</div><div className="a-kpi-sub neutral">registered addresses</div></div>
            <div className="a-kpi"><div className="a-kpi-label">Last ingest</div><div className="a-kpi-value" style={{ fontSize: '13px' }}>{fmtWhen(dbOv.latestCompanySourceAt)}</div><div className="a-kpi-sub neutral">latest source record</div></div>
          </div>
        )}

        {/* Source detail cards */}
        {liveSources ? (
          <div>
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: 'var(--fg)' }}>Source Integrations</span>
              <span className="a-badge">{sources.length} tracked</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '12px' }}>
              {sources.map(s => {
                const runStatus = s.latestRun?.status;
                const cardStatus = runStatus === 'failed' ? 'Degraded' : s.status === 'active' ? 'Active' : 'Watch';
                return (
                  <div className="a-card" key={s.sourceCode} style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--fg)', fontSize: '14px' }}>{s.countryCode} · {s.sourceName}</div>
                          <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '2px' }}>
                            {s.accessMethod.toUpperCase()} · {s.updateCadence ?? 'unknown cadence'} · {s.licenseTag}
                          </div>
                        </div>
                        <StatusBadge status={cardStatus} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '14px 18px', gap: '12px' }}>
                      <div>
                        <div style={{ color: 'var(--muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Companies</div>
                        <div style={{ fontWeight: 600, fontSize: '20px', color: 'var(--fg)', marginTop: '4px' }}>{s.companiesCount > 0 ? fmtC(s.companiesCount) : '—'}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source records</div>
                        <div style={{ fontWeight: 600, fontSize: '20px', color: 'var(--fg)', marginTop: '4px' }}>{s.sourceRecordsCount > 0 ? fmtC(s.sourceRecordsCount) : '—'}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ingest runs</div>
                        <div style={{ fontWeight: 600, fontSize: '20px', color: 'var(--fg)', marginTop: '4px' }}>{s.ingestionRunsCount}</div>
                      </div>
                    </div>
                    {s.latestRun ? (
                      <div style={{ padding: '10px 18px 14px', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                        <div>
                          <div style={{ color: 'var(--muted)', fontSize: '11px' }}>Last run</div>
                          <div style={{ fontSize: '12px', color: 'var(--fg)', marginTop: '2px' }}>{fmtWhen(s.latestRun.completedAt ?? s.latestRun.startedAt)}</div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--muted)', fontSize: '11px' }}>Written</div>
                          <div style={{ fontSize: '12px', color: 'var(--fg)', marginTop: '2px' }}>{fmt(s.latestRun.recordsWritten)}</div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--muted)', fontSize: '11px' }}>Failed</div>
                          <div style={{ fontSize: '12px', color: s.latestRun.recordsFailed > 0 ? 'var(--warn)' : 'var(--muted)', marginTop: '2px' }}>{s.latestRun.recordsFailed}</div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--muted)', fontSize: '11px' }}>Status</div>
                          <div style={{ marginTop: '2px' }}><StatusBadge status={humanize(s.latestRun.status)} /></div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '10px 18px 14px', borderTop: '1px solid var(--border)', color: 'var(--muted)', fontSize: '12px' }}>
                        No ingestion run recorded yet.
                      </div>
                    )}
                    <div style={{ padding: '8px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--muted)' }}>
                      <span>Commercial reuse: <strong style={{ color: s.commercialReuseAllowed ? 'var(--ok)' : 'var(--warn)' }}>{s.commercialReuseAllowed ? 'Allowed' : 'Restricted'}</strong></span>
                      <span>·</span>
                      <span>Code: <code style={{ fontSize: '11px' }}>{s.sourceCode}</code></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <Card title="Source Integrations" action={<span className="a-badge">no live data</span>}>
            <div style={{ color: 'var(--muted)', padding: '12px 0' }}>No source summaries returned from API.</div>
          </Card>
        )}

        {/* Ingestion run history */}
        <Card
          title="Recent Ingestion Runs"
          action={<span className="a-badge">{runs.length > 0 ? `${runs.length} runs` : 'live data'}</span>}
        >
          {runs.length > 0 ? (
            <table className="a-table">
              <thead>
                <tr>
                  <th>Source</th><th>Started</th><th>Duration</th>
                  <th>Seen</th><th>Written</th><th>Failed</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {runs.slice(0, 10).map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--fg)' }}>{r.sourceName}</div>
                      <div className="a-td-sub">{r.countryCode} · {r.runType}</div>
                    </td>
                    <td><span className="mono" style={{ color: 'var(--muted)' }}>{fmtWhen(r.startedAt)}</span></td>
                    <td><span className="mono">{fmtDur(r.startedAt, r.completedAt)}</span></td>
                    <td><span className="mono">{fmt(r.recordsSeen)}</span></td>
                    <td><span className="mono">{fmt(r.recordsWritten)}</span></td>
                    <td><span className="mono" style={{ color: r.recordsFailed > 0 ? 'var(--warn)' : 'var(--muted)' }}>{r.recordsFailed}</span></td>
                    <td><StatusBadge status={humanize(r.status)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ color: 'var(--muted)', padding: '12px 0', fontSize: '13px' }}>
              No runs recorded yet. The Norwegian worker has written data directly — run it again to log a tracked run.
            </div>
          )}
        </Card>

      </div>
    );
  }

  function renderHealth() {
    return (
      <div className="a-overview">
        <div className="a-main-grid">
          <div className="a-col">
            <Card title="Runtime Checks">
              <div className="a-health-list">
                {statusChecks.map(c => (
                  <div className="a-health-row" key={c.service}>
                    <div>
                      <div className="a-health-service">{c.service}</div>
                      <div className="a-health-meta">{c.meta}</div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div className="a-col">
            <Card title="Live Logs" action={<Icon.Terminal />}>
              <div style={{ padding: '4px 0' }}>
                {logLines.map((line, i) => (
                  <div className="a-log-entry" key={i}>
                    <span className="a-log-level info">INFO</span>
                    <span className="a-log-msg">{line}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  /* ── Config ──────────────────────────────────────────── */
  function renderConfig() {
    const groups = adminConfig?.data?.groups ?? [];

    async function saveGroup(groupId: string) {
      const group = groups.find(g => g.id === groupId);
      if (!group) return;
      const payload: Record<string, string> = {};
      for (const k of group.keys) {
        if (configDraft[k.key] !== undefined) payload[k.key] = configDraft[k.key];
      }
      if (Object.keys(payload).length === 0) return;
      setConfigSaving(true);
      try {
        const res = await fetch(`${API_BASE_URL}/v1/admin/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setConfigSaved(groupId);
          setTimeout(() => setConfigSaved(null), 3000);
          setConfigDraft(d => {
            const next = { ...d };
            for (const k of group.keys) delete next[k.key];
            return next;
          });
          void loadData();
        }
      } finally {
        setConfigSaving(false);
      }
    }

    const sourceBadge = (source: string) =>
      source === 'db' ? <span className="a-badge ok" style={{ fontSize: '11px' }}>DB</span>
      : source === 'env' ? <span className="a-badge" style={{ fontSize: '11px' }}>ENV</span>
      : <span className="a-badge" style={{ fontSize: '11px', opacity: 0.5 }}>unset</span>;

    return (
      <div className="a-col" style={{ maxWidth: '760px' }}>
        <div className="a-callout" style={{ background: 'rgba(59,130,246,0.06)', borderColor: 'rgba(59,130,246,0.2)', color: 'var(--text)' }}>
          <Icon.Alert />
          <span>
            Values saved here are stored in the database and take precedence over environment variables.
            Changes take effect immediately — no restart needed.
          </span>
        </div>

        {groups.map(group => {
          const groupDirty = group.keys.some(k => configDraft[k.key] !== undefined);
          return (
            <div className="a-card" key={group.id}>
              <div className="a-card-head">
                <div>
                  <span className="a-card-title">{group.label}</span>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{group.description}</div>
                </div>
                <button
                  className="a-btn"
                  disabled={!groupDirty || configSaving}
                  onClick={() => void saveGroup(group.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {configSaved === group.id
                    ? <><Icon.Check /> Saved</>
                    : <><Icon.Save /> Save {group.label}</>}
                </button>
              </div>
              <div className="a-card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {group.keys.map(entry => {
                    const revealed = configReveal.has(entry.key);
                    const draft = configDraft[entry.key];
                    return (
                      <div key={entry.key}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>{entry.label}</label>
                          {sourceBadge(draft !== undefined ? 'db' : entry.source)}
                          {entry.isSet && !draft && (
                            <span style={{ fontSize: '12px', color: 'var(--ok)' }}>
                              <Icon.Check /> Set
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ flex: 1, position: 'relative' }}>
                            <input
                              type={entry.secret && !revealed ? 'password' : 'text'}
                              placeholder={entry.isSet && draft === undefined ? (entry.masked ?? entry.hint) : entry.hint}
                              value={draft ?? ''}
                              onChange={e => setConfigDraft(d => ({ ...d, [entry.key]: e.target.value }))}
                              style={{
                                width: '100%', boxSizing: 'border-box',
                                padding: '8px 36px 8px 10px', fontSize: '13px',
                                border: `1px solid ${draft !== undefined ? 'var(--ok)' : 'var(--border)'}`,
                                borderRadius: '6px', background: 'var(--surface)',
                                color: 'var(--text)', fontFamily: 'monospace',
                              }}
                            />
                            {entry.secret && (
                              <button
                                onClick={() => setConfigReveal(s => {
                                  const n = new Set(s);
                                  n.has(entry.key) ? n.delete(entry.key) : n.add(entry.key);
                                  return n;
                                })}
                                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '2px', width: '18px', height: '18px' }}
                                title={revealed ? 'Hide' : 'Show'}
                              >
                                {revealed ? <Icon.EyeOff /> : <Icon.Eye />}
                              </button>
                            )}
                          </div>
                          {draft !== undefined && (
                            <button
                              className="a-btn"
                              onClick={() => setConfigDraft(d => { const n = { ...d }; delete n[entry.key]; return n; })}
                              style={{ flexShrink: 0 }}
                            >
                              <Icon.X />
                            </button>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', fontFamily: 'monospace' }}>{entry.key}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /* ── Render ───────────────────────────────────────────── */
  return (
    <div className="a-root">
      {/* Sidebar */}
      <aside className="a-sidebar">
        <div className="a-logo">
          <div className="a-logo-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
          </div>
          <span className="a-logo-name">CompanyData Ops</span>
        </div>

        <nav className="a-nav" aria-label="Admin navigation">
          {Object.entries(navGroups).map(([group, items]) => (
            <div className="a-nav-section" key={group}>
              <span className="a-nav-label">{group}</span>
              {items.map(n => {
                const I = Icon[n.icon];
                return (
                  <button
                    key={n.id}
                    className={`a-nav-item ${active === n.id ? 'active' : ''}`}
                    onClick={() => setActive(n.id)}
                    aria-current={active === n.id ? 'page' : undefined}
                  >
                    <I />
                    {n.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <a
            href="http://192.168.1.10:3014/?pgsql=postgres&username=company_data&db=company_data_dev"
            target="_blank"
            rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontSize: '12px', textDecoration: 'none', padding: '8px 10px', borderRadius: '6px', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon.Database />
            <span>Database browser</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', marginLeft: 'auto', opacity: 0.4 }}>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>

        <div className="a-sidebar-footer">
          <div className="a-avatar">AD</div>
          <div>
            <div className="a-sidebar-user-name">Admin User</div>
            <div className="a-sidebar-user-role">System Operator</div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="a-content">
        <header className="a-header">
          <div className="a-breadcrumb">
            <span>Dashboards</span>
            <Icon.Chevron />
            <span className="active">{activeNav.label}</span>
          </div>
          <div className="a-header-right">
            <div className="a-status-pill">
              <span className="a-status-dot" style={{ background: load.apiReachable ? 'var(--ok)' : 'var(--warn)' }} />
              {load.apiReachable ? 'API Connected' : 'Fallback Mode'}
            </div>
            <span className="a-time">UTC {utcTime}</span>
            <button className="a-btn" onClick={() => void loadData()} disabled={load.loading}>
              {load.loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </header>

        <main className="a-scroll">
          {load.error && <div className="a-callout">{load.error}</div>}
          {active === 'overview'        && renderOverview()}
          {active === 'customers'       && renderCustomers()}
          {active === 'billing'         && renderBilling()}
          {active === 'data-pipelines'  && renderPipelines()}
          {active === 'system-health'   && renderHealth()}
          {active === 'config'          && renderConfig()}
        </main>
      </div>
    </div>
  );
}
