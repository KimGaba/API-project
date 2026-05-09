import { useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

type NavItemId =
  | 'overview'
  | 'customers'
  | 'billing'
  | 'data-pipelines'
  | 'system-health';

type NavItem = {
  id: NavItemId;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  group: 'Operations' | 'Platform';
};

type StatusTone = 'good' | 'warn' | 'neutral';

type AdminStatusResponse = {
  data?: {
    sourceSummaries?: SourceSummary[];
    recentRuns?: RecentRun[];
    notes?: string[];
  };
  meta?: {
    generatedAt?: string;
    totalSources?: number;
    totalRecentRuns?: number;
  };
};

type AdminOverviewResponse = {
  data?: {
    customers?: CustomerSummary[];
    usageOverview?: UsageOverview | null;
    databaseOverview?: DatabaseOverview | null;
  };
  meta?: {
    generatedAt?: string;
    dataAvailable?: boolean;
    fallbackReason?: string;
    periodStart?: string;
  };
};

type BillingPlansResponse = {
  data?: BillingPlan[];
  meta?: {
    mode?: string;
    checkoutConfigured?: boolean;
    webhookConfigured?: boolean;
  };
};

type HealthResponse = {
  status?: string;
  service?: string;
  timestamp?: string;
};

type SourceSummary = {
  sourceCode: string;
  sourceName: string;
  countryCode: string;
  status: string;
  licenseTag: string;
  accessMethod: string;
  commercialReuseAllowed: boolean;
  updateCadence: string | null;
  companiesCount: number;
  sourceRecordsCount: number;
  ingestionRunsCount: number;
  latestRun: {
    status: string;
    startedAt: string | null;
    completedAt: string | null;
    recordsSeen: number;
    recordsWritten: number;
    recordsFailed: number;
  } | null;
};

type RecentRun = {
  id: string;
  sourceCode: string;
  sourceName: string;
  countryCode: string;
  runType: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  recordsSeen: number;
  recordsWritten: number;
  recordsFailed: number;
  checkpoint: string | null;
  errorMessage: string | null;
};

type BillingPlan = {
  code: string;
  displayName: string;
  monthlyQuota: number;
  rpmLimit: number;
  notes?: string;
};

type CustomerSummary = {
  id: string;
  email: string;
  name: string | null;
  companyName: string | null;
  countryCode: string | null;
  defaultPlan: string;
  status: string;
  subscription: {
    planName: string;
    status: string | null;
    monthlyQuota: number | null;
    rpmLimit: number | null;
  } | null;
  activeApiKeys: number;
  lastApiKeyUsedAt: string | null;
  currentPeriodTotalRequests: number;
};

type UsageOverview = {
  activeCustomers: number;
  activeApiKeys: number;
  currentPeriodTotalRequests: number;
  currentPeriodSearchRequests: number;
  currentPeriodLookupRequests: number;
  currentPeriodChangesRequests: number;
  usageEventCount: number;
  latestUsageAt: string | null;
};

type DatabaseOverview = {
  companyCount: number;
  ingestedCompanyCount: number;
  seededCompanyCount: number;
  addressCount: number;
  activityCount: number;
  sourceRecordCount: number;
  latestCompanySourceAt: string | null;
};

type LoadState = {
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  apiReachable: boolean;
};

type AlertItem = {
  title: string;
  detail: string;
  tone: StatusTone;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3011';

const navItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    eyebrow: 'Mission control',
    title: 'Operations triage overview',
    description: 'Start here to spot what needs action now, then jump into the focused operator views.',
    group: 'Operations'
  },
  {
    id: 'customers',
    label: 'Customers',
    eyebrow: 'Accounts',
    title: 'Customers',
    description: 'Review account health, API access and which customers need follow-up.',
    group: 'Operations'
  },
  {
    id: 'billing',
    label: 'Billing',
    eyebrow: 'Revenue ops',
    title: 'Billing',
    description: 'Check plan coverage, quota fit and billing configuration gaps.',
    group: 'Operations'
  },
  {
    id: 'data-pipelines',
    label: 'Data pipelines',
    eyebrow: 'Ingestion & sources',
    title: 'Data pipelines',
    description: 'Track source health, recent runs and data freshness.',
    group: 'Platform'
  },
  {
    id: 'system-health',
    label: 'System health',
    eyebrow: 'Runtime & alerts',
    title: 'System health',
    description: 'Monitor runtime health, active alerts and fallback conditions.',
    group: 'Platform'
  }
];

const fallbackCustomerRows = [
  {
    name: 'Company Data Demo',
    owner: 'demo@companydata.local',
    plan: 'free',
    usage: '0 / 1,000',
    usageDetail: 'No live customer usage connected yet',
    keys: '1 key',
    lastSeen: 'Fallback row',
    status: 'Healthy',
    tone: 'neutral' as const,
    action: 'Review onboarding',
    note: 'Seeded local account row'
  }
];

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
}

function formatWhen(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  }).format(date) + ' UTC';
}

function formatDuration(startedAt: string | null, completedAt: string | null) {
  if (!startedAt || !completedAt) return 'In progress';
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return '—';

  const totalSeconds = Math.round((end - start) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

function toneFromRunStatus(status: string): StatusTone {
  if (status === 'succeeded' || status === 'completed' || status === 'healthy' || status === 'ok' || status === 'active') return 'good';
  if (status === 'running' || status === 'partial' || status === 'degraded' || status === 'watch') return 'warn';
  return 'neutral';
}

function humanizeStatus(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function iconForSection(id: NavItemId) {
  switch (id) {
    case 'overview':
      return '◫';
    case 'customers':
      return '◎';
    case 'billing':
      return '¤';
    case 'data-pipelines':
      return '⟳';
    case 'system-health':
      return '●';
  }
}

function Panel({
  title,
  eyebrow,
  action,
  children,
  className = ''
}: {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`.trim()}>
      <div className="panel-header">
        <div>
          {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
          <h3>{title}</h3>
        </div>
        {action ? <div className="panel-action">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  return <span className={`status-badge ${tone}`}>{label}</span>;
}

export default function App() {
  const [active, setActive] = useState<NavItemId>('overview');
  const [theme, setTheme] = useState<Theme>('light');
  const [loadState, setLoadState] = useState<LoadState>({
    loading: true,
    error: null,
    lastUpdated: null,
    apiReachable: false
  });
  const [adminStatus, setAdminStatus] = useState<AdminStatusResponse | null>(null);
  const [adminOverview, setAdminOverview] = useState<AdminOverviewResponse | null>(null);
  const [billingPlans, setBillingPlans] = useState<BillingPlansResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);

  const activeItem = useMemo(
    () => navItems.find((item) => item.id === active) ?? navItems[0],
    [active]
  );

  async function loadData() {
    setLoadState((current) => ({ ...current, loading: true, error: null }));

    try {
      const [healthResponse, adminStatusResponse, adminOverviewResponse, plansResponse] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/health`),
        fetch(`${API_BASE_URL}/v1/admin/status`),
        fetch(`${API_BASE_URL}/v1/admin/overview`),
        fetch(`${API_BASE_URL}/v1/billing/plans`)
      ]);

      let reachable = false;
      let nextHealth: HealthResponse | null = null;
      let nextAdminStatus: AdminStatusResponse | null = null;
      let nextAdminOverview: AdminOverviewResponse | null = null;
      let nextBilling: BillingPlansResponse | null = null;
      const errors: string[] = [];

      if (healthResponse.status === 'fulfilled' && healthResponse.value.ok) {
        reachable = true;
        nextHealth = (await healthResponse.value.json()) as HealthResponse;
      } else {
        errors.push('health');
      }

      if (adminStatusResponse.status === 'fulfilled' && adminStatusResponse.value.ok) {
        reachable = true;
        nextAdminStatus = (await adminStatusResponse.value.json()) as AdminStatusResponse;
      } else {
        errors.push('admin status');
      }

      if (adminOverviewResponse.status === 'fulfilled' && adminOverviewResponse.value.ok) {
        reachable = true;
        nextAdminOverview = (await adminOverviewResponse.value.json()) as AdminOverviewResponse;
      } else {
        errors.push('admin overview');
      }

      if (plansResponse.status === 'fulfilled' && plansResponse.value.ok) {
        reachable = true;
        nextBilling = (await plansResponse.value.json()) as BillingPlansResponse;
      } else {
        errors.push('billing plans');
      }

      setHealth(nextHealth);
      setAdminStatus(nextAdminStatus);
      setAdminOverview(nextAdminOverview);
      setBillingPlans(nextBilling);
      setLoadState({
        loading: false,
        error: errors.length === 4 ? `Could not reach ${API_BASE_URL}. Using local fallback data.` : null,
        lastUpdated: new Date().toISOString(),
        apiReachable: reachable
      });
    } catch (error) {
      setLoadState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown loading error',
        lastUpdated: new Date().toISOString(),
        apiReachable: false
      });
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    document.title = `Company Data Ops · ${activeItem.label}`;
  }, [activeItem]);

  const sourceSummaries = adminStatus?.data?.sourceSummaries ?? [];
  const recentRuns = adminStatus?.data?.recentRuns ?? [];
  const adminNotes = adminStatus?.data?.notes ?? [];
  const plans = billingPlans?.data ?? [];
  const customers = adminOverview?.data?.customers ?? [];
  const usageOverview = adminOverview?.data?.usageOverview ?? null;
  const databaseOverview = adminOverview?.data?.databaseOverview ?? null;

  const activeSources = sourceSummaries.filter((row) => row.status === 'active').length;
  const failedSourceRuns = sourceSummaries.filter((row) => row.latestRun?.status === 'failed').length;
  const totalCompanies = databaseOverview?.companyCount ?? sourceSummaries.reduce((sum, row) => sum + row.companiesCount, 0);
  const totalRecords = databaseOverview?.sourceRecordCount ?? sourceSummaries.reduce((sum, row) => sum + row.sourceRecordsCount, 0);
  const writtenRecords = recentRuns.reduce((sum, row) => sum + row.recordsWritten, 0);
  const failedRunRecords = recentRuns.reduce((sum, row) => sum + row.recordsFailed, 0);
  const seenRecords = usageOverview?.currentPeriodTotalRequests ?? recentRuns.reduce((sum, row) => sum + row.recordsSeen, 0);
  const failedRuns = recentRuns.filter((row) => row.status === 'failed').length;
  const runningRuns = recentRuns.filter((row) => row.status === 'running').length;
  const partialRuns = recentRuns.filter((row) => row.status === 'partial').length;
  const latestCompletedRun = recentRuns.find((row) => row.completedAt);
  const readinessPercent = Math.min(
    100,
    Math.max(18, Math.round(sourceSummaries.length > 0 ? (activeSources / Math.max(sourceSummaries.length, 1)) * 100 : 78))
  );

  const alertItems: AlertItem[] = [
    ...(!loadState.apiReachable
      ? [{ title: 'API not reachable', detail: `Admin is running in local fallback mode instead of reading ${API_BASE_URL}.`, tone: 'warn' as const }]
      : []),
    ...(failedRuns > 0
      ? [{ title: 'Failed ingestion runs', detail: `${failedRuns} recent run(s) failed and need operator review.`, tone: 'warn' as const }]
      : []),
    ...(partialRuns > 0
      ? [{ title: 'Partial ingestion outcomes', detail: `${partialRuns} recent run(s) completed partially. Check checkpoints and retry posture.`, tone: 'warn' as const }]
      : []),
    ...(failedRunRecords > 0
      ? [{ title: 'Rejected records detected', detail: `${formatNumber(failedRunRecords)} records failed during recent ingestion runs.`, tone: 'warn' as const }]
      : []),
    ...(failedSourceRuns > 0
      ? [{ title: 'Degraded integrations', detail: `${failedSourceRuns} source integration(s) show a failed latest run.`, tone: 'warn' as const }]
      : []),
    ...(!adminOverview?.meta?.dataAvailable
      ? [{ title: 'Customer overview is fallback-backed', detail: adminOverview?.meta?.fallbackReason ?? 'The overview endpoint is not returning a DB-backed snapshot.', tone: 'neutral' as const }]
      : []),
    ...(!(billingPlans?.meta?.checkoutConfigured)
      ? [{ title: 'Billing checkout not configured', detail: 'Plan data is visible, but checkout wiring is still incomplete for live billing operations.', tone: 'neutral' as const }]
      : [])
  ];

  const adminStats = [
    {
      label: 'Active customers',
      value: usageOverview ? String(usageOverview.activeCustomers) : customers.length > 0 ? String(customers.length) : '1',
      detail: usageOverview
        ? `${formatNumber(usageOverview.activeApiKeys)} active API keys this period`
        : 'Falls back to local seeded rows when DB customer snapshot is unavailable'
    },
    {
      label: 'Platform requests',
      value: usageOverview ? formatCompact(usageOverview.currentPeriodTotalRequests) : recentRuns.length > 0 ? formatCompact(writtenRecords) : '0',
      detail: usageOverview
        ? `${formatNumber(usageOverview.usageEventCount)} usage events captured`
        : 'Using ingestion-derived proxy metrics until usage counters are available'
    },
    {
      label: 'Companies sources tracked',
      value: totalCompanies > 0 ? formatCompact(totalCompanies) : '2',
      detail: totalRecords > 0 ? `${formatCompact(totalRecords)} source records sources tracked` : 'Fallback-only local rows right now'
    },
    {
      label: 'Freshest completed ingest',
      value: latestCompletedRun?.completedAt ? formatWhen(latestCompletedRun.completedAt) : databaseOverview?.latestCompanySourceAt ? formatWhen(databaseOverview.latestCompanySourceAt) : '—',
      detail: latestCompletedRun ? `${latestCompletedRun.sourceCode} · ${humanizeStatus(latestCompletedRun.status)}` : 'No completed ingest in current payload'
    }
  ];

  const customerRows = customers.length > 0
    ? customers
        .map((row) => {
          const planName = row.subscription?.planName ?? row.defaultPlan;
          const monthlyQuota = row.subscription?.monthlyQuota;
          const usageTotal = row.currentPeriodTotalRequests;
          const quotaRatio = monthlyQuota && monthlyQuota > 0 ? usageTotal / monthlyQuota : null;
          const isInactive = row.status !== 'active';
          const hasNoKeys = row.activeApiKeys === 0;
          const highUsage = quotaRatio !== null && quotaRatio >= 0.8;
          const tone: StatusTone = isInactive || hasNoKeys || highUsage ? 'warn' : 'good';
          const statusLabel = isInactive ? 'Watch' : highUsage ? 'High usage' : hasNoKeys ? 'Key gap' : 'Healthy';

          return {
            name: row.companyName || row.name || row.email,
            owner: row.name || row.email,
            plan: planName,
            usage: monthlyQuota ? `${formatNumber(usageTotal)} / ${formatNumber(monthlyQuota)}` : `${formatNumber(usageTotal)} this month`,
            usageDetail: row.subscription?.rpmLimit
              ? `${formatNumber(row.subscription.rpmLimit)} rpm cap`
              : 'Default rate limit',
            keys: `${row.activeApiKeys} key${row.activeApiKeys === 1 ? '' : 's'}`,
            lastSeen: formatWhen(row.lastApiKeyUsedAt),
            status: statusLabel,
            tone,
            action: isInactive ? 'Check account state' : hasNoKeys ? 'Provision API key' : highUsage ? 'Review quota / upsell' : 'Monitor normally',
            note: `${row.email} · ${row.countryCode ?? '—'}`
          };
        })
        .sort((left, right) => {
          const leftScore = (left.tone === 'warn' ? 1 : 0) + (left.status === 'High usage' ? 1 : 0);
          const rightScore = (right.tone === 'warn' ? 1 : 0) + (right.status === 'High usage' ? 1 : 0);
          return rightScore - leftScore || left.name.localeCompare(right.name);
        })
    : fallbackCustomerRows;

  const customerAttentionRows = customerRows.filter((row) => row.tone !== 'good').slice(0, 4);

  const billingRows = customers.length > 0
    ? customers.slice(0, 6).map((customer) => ({
        account: customer.companyName || customer.email,
        issue: customer.subscription
          ? `${humanizeStatus(customer.subscription.status ?? 'unknown')} subscription · quota ${customer.subscription.monthlyQuota ? formatNumber(customer.subscription.monthlyQuota) : 'custom'}`
          : `No subscription row yet · default ${customer.defaultPlan}`,
        amount: customer.subscription?.rpmLimit ? `${formatNumber(customer.subscription.rpmLimit)} rpm` : 'Manual / default',
        action: customer.subscription ? humanizeStatus(customer.subscription.planName) : 'Needs subscription wiring'
      }))
    : plans.length > 0
      ? plans.slice(0, 4).map((plan) => ({
          account: plan.displayName,
          issue: plan.notes ?? `${formatNumber(plan.monthlyQuota)} monthly requests`,
          amount: plan.code === 'free' ? 'Free tier' : `${formatNumber(plan.rpmLimit)} rpm`,
          action: plan.code === 'enterprise' ? 'Manual review path' : 'Config present'
        }))
      : [
          { account: 'Starter', issue: 'Plan shell is present locally', amount: '60 rpm', action: 'Needs live wiring' },
          { account: 'Growth', issue: 'Higher-volume default option', amount: '300 rpm', action: 'Needs live wiring' },
          { account: 'Enterprise', issue: 'Contract / manual path', amount: 'Custom', action: 'Operator-managed' }
        ];

  const sourceRows = sourceSummaries.length > 0
    ? sourceSummaries.map((row) => ({
        source: `${row.countryCode} · ${row.sourceName}`,
        status: row.latestRun?.status === 'failed' ? 'Degraded' : row.status === 'active' ? 'Healthy' : 'Watch',
        detail: `${row.accessMethod} · ${row.licenseTag}`,
        freshness: formatWhen(row.latestRun?.completedAt ?? row.latestRun?.startedAt),
        records: row.sourceRecordsCount > 0 ? formatCompact(row.sourceRecordsCount) : '—'
      }))
    : [
        { source: 'NO · Norway registry', status: 'Healthy', detail: 'Public endpoint · delta sync enabled', freshness: '17m ago', records: '740k' },
        { source: 'UK · Companies House', status: 'Degraded', detail: 'API key needed for full live run', freshness: '2h ago', records: '310k' },
        { source: 'Seed fixtures', status: 'Watch', detail: 'Fallback dataset only', freshness: 'Static', records: '180k' }
      ];

  const runRows = recentRuns.length > 0
    ? recentRuns.slice(0, 6).map((row) => ({
        run: `${row.sourceCode}-${row.runType}-${row.id.slice(0, 8)}`,
        source: row.sourceName,
        result: humanizeStatus(row.status),
        records: formatNumber(row.recordsWritten),
        duration: formatDuration(row.startedAt, row.completedAt),
        checkpoint: row.checkpoint ?? '—'
      }))
    : [
        { run: 'NO-delta-2026-05-05-07:58', source: 'Norway registry', result: 'Completed', records: '12,482', duration: '11m 08s', checkpoint: 'company:11482' },
        { run: 'UK-backfill-2026-05-05-03:10', source: 'Companies House', result: 'Partial', records: '84,229', duration: '52m 44s', checkpoint: 'chunk:84' },
        { run: 'seed-refresh-2026-05-04-22:12', source: 'Seed fixtures', result: 'Completed', records: '2,400', duration: '00m 31s', checkpoint: 'done' }
      ];

  const databaseRows = [
    {
      metric: 'Total companies',
      value: totalCompanies > 0 ? formatNumber(totalCompanies) : '2',
      note: databaseOverview ? 'Current local companies table count' : 'Fallback or source-summary aggregate'
    },
    {
      metric: 'Ingested vs seeded',
      value: databaseOverview ? `${formatNumber(databaseOverview.ingestedCompanyCount)} / ${formatNumber(databaseOverview.seededCompanyCount)}` : '—',
      note: databaseOverview ? 'Ingested companies first, seeded rows second' : 'Needs database overview endpoint'
    },
    {
      metric: 'Related rows',
      value: databaseOverview ? `${formatNumber(databaseOverview.addressCount)} addr · ${formatNumber(databaseOverview.activityCount)} acts` : '—',
      note: 'Address and activity table coverage in the local DB'
    },
    {
      metric: 'Latest source-backed company update',
      value: databaseOverview?.latestCompanySourceAt ? formatWhen(databaseOverview.latestCompanySourceAt) : latestCompletedRun?.completedAt ? formatWhen(latestCompletedRun.completedAt) : '—',
      note: databaseOverview ? 'Uses companies.latest_source_record_at' : 'Fallback to recent ingestion run'
    }
  ];

  const statusChecks = [
    {
      service: 'API',
      state: health?.status === 'ok' ? 'Healthy' : loadState.apiReachable ? 'Watch' : 'Offline',
      note: health?.service ? `${health.service} · ${formatWhen(health.timestamp)}` : `Expected on ${API_BASE_URL}`
    },
    {
      service: 'Admin app',
      state: 'Healthy',
      note: 'Legacy admin app on :3013 (deprecated) with local fallback rendering; use :3014 for the canonical internal surface.'
    },
    {
      service: 'Admin overview',
      state: adminOverview?.meta?.dataAvailable ? 'Healthy' : 'Watch',
      note: adminOverview?.meta?.dataAvailable
        ? `DB-backed snapshot for period ${adminOverview.meta.periodStart}`
        : adminOverview?.meta?.fallbackReason ?? 'Overview unavailable, falling back locally'
    },
    {
      service: 'Billing plans',
      state: billingPlans?.meta?.checkoutConfigured ? 'Healthy' : 'Watch',
      note: billingPlans?.meta
        ? `${billingPlans.meta.mode} mode · webhook ${billingPlans.meta.webhookConfigured ? 'configured' : 'not configured'}`
        : 'Awaiting billing plan endpoint'
    },
    {
      service: 'Ingestion worker',
      state: failedRuns > 0 ? 'Watch' : 'Healthy',
      note: failedRuns > 0 ? `${failedRuns} recent failed run(s) need operator review` : 'No failed runs in current admin payload'
    }
  ];

  const logEvents = [
    ...(adminNotes.length > 0 ? adminNotes : []),
    ...(adminOverview?.meta?.dataAvailable
      ? ['Customer and usage snapshot is coming from the local database.']
      : [adminOverview?.meta?.fallbackReason ?? 'Admin overview endpoint not available; embedded local fallback is active.'])
  ].slice(0, 6);

  const activityFeed = [
    `${loadState.apiReachable ? 'Live admin data connected' : 'Fallback mode active'} · ${loadState.lastUpdated ? formatWhen(loadState.lastUpdated) : 'Awaiting first load'}`,
    `${runningRuns > 0 ? `${runningRuns} ingestion run(s) in progress` : 'No in-progress ingestion jobs right now'}`,
    `${usageOverview ? `${formatNumber(usageOverview.currentPeriodSearchRequests)} search requests recorded this period` : 'Usage section falls back to ingestion-derived operator signals when counters are absent'}`,
    `${sourceSummaries.length > 0 ? `${activeSources}/${sourceSummaries.length} integrations currently active` : 'Integration readiness is using embedded fallback rows'}`
  ];


  const groupedNav = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    acc[item.group] ??= [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <div className="admin-app" data-theme={theme}>
      <aside className="admin-sidebar">
        <div className="brand-block">
          <div className="brand-mark">CD</div>
          <div>
            <div className="brand-title">Company Data Ops</div>
            <p className="brand-copy">Operator console for customer follow-up, billing review, pipeline checks and runtime health.</p>
          </div>
        </div>

        <div className="sidebar-controls">
          <button
            className="button ghost"
            onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
          >
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
          <button className="button secondary" onClick={() => void loadData()} disabled={loadState.loading}>
            {loadState.loading ? 'Refreshing…' : 'Reload operator data'}
          </button>
        </div>

        <nav className="admin-nav" aria-label="Admin sections">
          {Object.entries(groupedNav).map(([group, items]) => (
            <div key={group} className="nav-group">
              <div className="nav-group-label">{group}</div>
              {items.map((item) => (
                <button
                  key={item.id}
                  className={item.id === active ? 'nav-item active' : 'nav-item'}
                  onClick={() => setActive(item.id)}
                >
                  <span className="nav-icon" aria-hidden="true">{iconForSection(item.id)}</span>
                  <span className="nav-copy">
                    <strong>{item.label}</strong>
                    <small>{item.eyebrow}</small>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-runtime">
          <div className="eyebrow">Runtime connection</div>
          <strong>Legacy admin on :3013 (deprecated)</strong>
          <p>Reads live admin data from {API_BASE_URL} when available and flags when a view is using local fallback rows.</p>
          <div className="runtime-pills">
            <span className={loadState.apiReachable ? 'status-badge good' : 'status-badge warn'}>
              {loadState.apiReachable ? 'API connected' : 'Fallback data'}
            </span>
            <span className="status-badge neutral">Operator only</span>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="topbar panel">
          <div>
            <div className="breadcrumb">Operations / {activeItem.label}</div>
            <h1>{activeItem.title}</h1>
            <p>{activeItem.description}</p>
          </div>
          <div className="topbar-meta">
            <div className="topbar-chip-row">
              <span className="status-badge neutral">Operator console</span>
              <span className={loadState.apiReachable ? 'status-badge good' : 'status-badge warn'}>
                {loadState.apiReachable ? 'Live data' : 'Fallback data'}
              </span>
            </div>
            <div className="topbar-chip-row">
              <span className="status-badge neutral">UTC {loadState.lastUpdated ? formatWhen(loadState.lastUpdated) : '—'}</span>
              <button className="button primary" onClick={() => setActive('system-health')}>
                Open system health
              </button>
            </div>
          </div>
        </header>

        {loadState.error ? <div className="callout warn">{loadState.error}</div> : null}

        <section className="kpi-grid">
          {adminStats.map((item) => (
            <article className="kpi-card panel" key={item.label}>
              <div className="eyebrow">Snapshot</div>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              <p>{item.detail}</p>
            </article>
          ))}
        </section>

        {active === 'overview' ? (
          <section className="overview-stack">
            <Panel
              title="Customer overview"
              eyebrow="Internal customer control"
              action={<span className="status-badge neutral">{customerRows.length} customer row(s)</span>}
              className="focus-panel overview-table-panel"
            >
              <div className="table-shell">
                <table>
                  <thead>
                    <tr>
                      <th>Customer / company</th>
                      <th>Plan</th>
                      <th>Requests this period</th>
                      <th>Status</th>
                      <th>Last activity</th>
                      <th>Next action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerRows.map((row) => (
                      <tr key={row.name + row.note}>
                        <td>
                          <strong>{row.name}</strong>
                          <div className="subtle-note">{row.owner} · {row.note}</div>
                        </td>
                        <td>
                          <strong>{row.plan}</strong>
                          <div className="subtle-note">{row.keys} · {row.usageDetail}</div>
                        </td>
                        <td>
                          <div className="mono">{row.usage}</div>
                        </td>
                        <td><StatusBadge label={row.status} tone={row.tone} /></td>
                        <td className="mono">{row.lastSeen}</td>
                        <td>{row.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <section className="overview-support-grid">
              <Panel
                title="Data sources & integrations"
                eyebrow="Upstreams"
                action={<span className="status-badge neutral">{sourceRows.length} tracked</span>}
              >
                <div className="table-shell">
                  <table>
                    <thead>
                      <tr>
                        <th>Registry</th>
                        <th>Status</th>
                        <th>Detail</th>
                        <th>Freshness</th>
                        <th>Records</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sourceRows.slice(0, 5).map((row) => (
                        <tr key={row.source}>
                          <td><strong>{row.source}</strong></td>
                          <td><StatusBadge label={row.status} tone={row.status === 'Healthy' ? 'good' : 'warn'} /></td>
                          <td>{row.detail}</td>
                          <td className="mono">{row.freshness}</td>
                          <td className="mono">{row.records}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel
                title="System health"
                eyebrow="Runtime & alerts"
                action={<span className="status-badge neutral">{alertItems.length} alert item(s)</span>}
              >
                <div className="stack-list compact">
                  {statusChecks.slice(0, 4).map((row) => (
                    <div className="list-row" key={row.service}>
                      <div>
                        <strong>{row.service}</strong>
                        <p>{row.note}</p>
                      </div>
                      <StatusBadge label={row.state} tone={row.state === 'Healthy' ? 'good' : row.state === 'Offline' ? 'neutral' : 'warn'} />
                    </div>
                  ))}
                  {customerAttentionRows.length > 0 ? customerAttentionRows.slice(0, 2).map((row) => (
                    <div className="list-row" key={row.name + row.action}>
                      <div>
                        <strong>{row.name}</strong>
                        <p>{row.action}</p>
                      </div>
                      <StatusBadge label={row.status} tone={row.tone} />
                    </div>
                  )) : null}
                </div>
              </Panel>
            </section>
          </section>
        ) : null}

        {active === 'customers' ? (
          <section className="main-grid">
            <div className="main-column">
              <Panel title="Customers needing attention" eyebrow="Accounts" action={<span className="status-badge neutral">{customerRows.length} accounts shown</span>} className="focus-panel">
                <div className="table-shell">
                  <table>
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Plan / scope</th>
                        <th>Usage</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerRows.map((row) => (
                        <tr key={row.name + row.note}>
                          <td><strong>{row.name}</strong><div className="subtle-note">{row.note}</div></td>
                          <td>{row.plan}</td>
                          <td className="mono">{row.usage}</td>
                          <td><StatusBadge label={row.status} tone={row.status === 'Healthy' ? 'good' : 'warn'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
            <div className="side-column">
              <Panel title="Request volume" eyebrow="Traffic" action={<span className="status-badge neutral">{usageOverview ? 'Live counters' : 'Derived signals'}</span>}>
                <div className="metric-stack">
                  <div className="metric-row"><span>Total requests</span><strong>{usageOverview ? formatNumber(usageOverview.currentPeriodTotalRequests) : (seenRecords > 0 ? formatNumber(seenRecords) : '—')}</strong></div>
                  <div className="metric-row"><span>Search requests</span><strong>{usageOverview ? formatNumber(usageOverview.currentPeriodSearchRequests) : '—'}</strong></div>
                  <div className="metric-row"><span>Lookup requests</span><strong>{usageOverview ? formatNumber(usageOverview.currentPeriodLookupRequests) : '—'}</strong></div>
                  <div className="metric-row"><span>Failed ingest records</span><strong>{failedRunRecords > 0 ? formatNumber(failedRunRecords) : '0'}</strong></div>
                </div>
                <div className="readiness-block">
                  <div className="readiness-head"><span>Integration readiness</span><strong>{readinessPercent}%</strong></div>
                  <div className="meter"><div className="meter-fill" style={{ width: `${readinessPercent}%` }} /></div>
                  <p>{usageOverview ? 'Request numbers are live from local usage tables. Readiness still reflects source coverage until deeper platform telemetry exists.' : 'Usage is falling back to ingestion and source proxies because local usage counters are not available yet.'}</p>
                </div>
              </Panel>
            </div>
          </section>
        ) : null}

        {active === 'billing' ? (
          <section className="main-grid">
            <div className="main-column">
              <Panel title="Billing follow-up" eyebrow="Revenue ops" action={<span className="status-badge neutral">{plans.length > 0 ? `${plans.length} plans loaded` : 'Local plan rows'}</span>} className="focus-panel">
                <div className="stack-list compact">
                  {billingRows.map((row) => (
                    <div className="list-row" key={row.account + row.issue}>
                      <div><strong>{row.account}</strong><p>{row.issue}</p></div>
                      <div className="row-metrics"><strong>{row.amount}</strong><span>{row.action}</span></div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
            <div className="side-column">
              <Panel title="Billing alerts" eyebrow="Configuration" action={<span className="status-badge neutral">{billingPlans?.meta?.checkoutConfigured ? 'Checkout ready' : 'Needs wiring'}</span>}>
                <div className="stack-list compact">
                  <div className="list-row"><div><strong>Checkout</strong><p>{billingPlans?.meta?.checkoutConfigured ? 'Checkout configuration is present for local billing flows.' : 'Checkout wiring is not configured yet.'}</p></div><StatusBadge label={billingPlans?.meta?.checkoutConfigured ? 'Healthy' : 'Watch'} tone={billingPlans?.meta?.checkoutConfigured ? 'good' : 'warn'} /></div>
                  <div className="list-row"><div><strong>Webhook</strong><p>{billingPlans?.meta?.webhookConfigured ? 'Webhook configuration is present.' : 'Webhook configuration is still missing or incomplete.'}</p></div><StatusBadge label={billingPlans?.meta?.webhookConfigured ? 'Healthy' : 'Watch'} tone={billingPlans?.meta?.webhookConfigured ? 'good' : 'warn'} /></div>
                </div>
              </Panel>
            </div>
          </section>
        ) : null}

        {active === 'data-pipelines' ? (
          <section className="main-grid">
            <div className="main-column">
              <Panel title="Source integrations" eyebrow="Upstreams" action={<span className="status-badge neutral">{sourceRows.length} sources tracked</span>} className="focus-panel">
                <div className="table-shell"><table><thead><tr><th>Registry</th><th>Status</th><th>Detail</th><th>Freshness</th><th>Records</th></tr></thead><tbody>{sourceRows.map((row) => (<tr key={row.source}><td><strong>{row.source}</strong></td><td><StatusBadge label={row.status} tone={row.status === 'Healthy' ? 'good' : 'warn'} /></td><td>{row.detail}</td><td className="mono">{row.freshness}</td><td className="mono">{row.records}</td></tr>))}</tbody></table></div>
              </Panel>
              <Panel title="Runs to review" eyebrow="Pipelines" action={<span className="status-badge neutral">{runRows.length} recent runs</span>}>
                <div className="table-shell"><table><thead><tr><th>Run</th><th>Source</th><th>Records</th><th>Duration</th><th>Checkpoint</th><th>Status</th></tr></thead><tbody>{runRows.map((row) => (<tr key={row.run}><td className="mono">{row.run}</td><td>{row.source}</td><td className="mono">{row.records}</td><td className="mono">{row.duration}</td><td className="mono">{row.checkpoint}</td><td><StatusBadge label={row.result} tone={toneFromRunStatus(row.result.toLowerCase())} /></td></tr>))}</tbody></table></div>
              </Panel>
            </div>
            <div className="side-column">
              <Panel title="Data freshness" eyebrow="Storage" action={<span className="status-badge neutral">Postgres-backed summary</span>}>
                <div className="stack-list compact">{databaseRows.map((row) => (<div className="list-row" key={row.metric}><div><strong>{row.metric}</strong><p>{row.note}</p></div><div className="row-metrics"><strong>{row.value}</strong></div></div>))}</div>
              </Panel>
            </div>
          </section>
        ) : null}

        {active === 'system-health' ? (
          <section className="main-grid">
            <div className="main-column">
              <Panel title="Runtime checks" eyebrow="Runtime" action={<span className="status-badge neutral">Local environment</span>} className="focus-panel">
                <div className="stack-list">{statusChecks.map((row) => (<div className="list-row" key={row.service}><div><strong>{row.service}</strong><p>{row.note}</p></div><StatusBadge label={row.state} tone={row.state === 'Healthy' ? 'good' : row.state === 'Offline' ? 'neutral' : 'warn'} /></div>))}</div>
              </Panel>
              <Panel title="Active alerts" eyebrow="Warnings" action={<span className="status-badge neutral">{alertItems.length} active</span>}>
                <div className="stack-list compact">{alertItems.length > 0 ? alertItems.map((alert) => (<div className="list-row" key={alert.title + alert.detail}><div><strong>{alert.title}</strong><p>{alert.detail}</p></div><StatusBadge label={alert.tone === 'warn' ? 'Needs review' : 'Advisory'} tone={alert.tone} /></div>)) : <div className="log-row">No active alerts in the current payload.</div>}</div>
              </Panel>
            </div>
            <div className="side-column">
              <Panel title="Notes and fallbacks" eyebrow="Recent activity" action={<span className="status-badge neutral">{loadState.lastUpdated ? 'Fresh' : 'Pending'}</span>}>
                <div className="log-list">{logEvents.map((entry) => (<div className="log-row" key={entry}>{entry}</div>))}</div>
              </Panel>
              <Panel title="What changed recently" eyebrow="Ops snapshot" action={<span className="status-badge neutral">Internal control surface</span>}>
                <div className="stack-list compact">{activityFeed.map((entry) => (<div className="list-row simple" key={entry}><p>{entry}</p></div>))}</div>
              </Panel>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
