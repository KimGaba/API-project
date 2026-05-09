import { useEffect, useMemo, useState } from 'react';

type SearchResult = {
  id?: string;
  country_code?: string;
  countryCode?: string;
  name?: string;
  registration_number?: string;
  registrationNumber?: string;
  source?: string;
  status?: string;
};

type BillingPlan = {
  code: string;
  displayName: string;
  monthlyQuota: number;
  rpmLimit: number;
  notes?: string;
};

type BillingPlansResponse = {
  data?: BillingPlan[];
  meta?: {
    mode?: string;
    checkoutConfigured?: boolean;
    publishableKeyConfigured?: boolean;
  };
};

type HealthResponse = {
  status?: string;
  service?: string;
};

type ThemeMode = 'light' | 'dark';
type DashboardRoute = 'overview' | 'api-keys' | 'usage' | 'billing' | 'playground' | 'settings';

type NavItem = {
  id: DashboardRoute;
  label: string;
  description: string;
  shortLabel: string;
  path: string;
  section: 'main' | 'workspace';
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3011';
const DOCS_BASE_URL = import.meta.env.VITE_DOCS_BASE_URL ?? 'http://localhost:3010';

const navItems: NavItem[] = [
  { id: 'overview', label: 'Dashboard', shortLabel: 'DB', path: '/', section: 'main', description: 'See account health, plan fit and the next customer action to take' },
  { id: 'api-keys', label: 'API Keys', shortLabel: 'AK', path: '/keys', section: 'main', description: 'Issue, copy and rotate credentials for real integration work' },
  { id: 'usage', label: 'Usage', shortLabel: 'US', path: '/usage', section: 'main', description: 'Monitor request volume, quota burn and endpoint mix' },
  { id: 'billing', label: 'Billing', shortLabel: 'BI', path: '/billing', section: 'main', description: 'Review plan limits, checkout state and commercial readiness' },
  { id: 'playground', label: 'Playground', shortLabel: 'PG', path: '/playground', section: 'workspace', description: 'Validate requests against the live local API before wiring code' },
  { id: 'settings', label: 'Settings', shortLabel: 'SE', path: '/settings', section: 'workspace', description: 'Manage workspace access, alerts and account safeguards' }
];

const routeByPath: Record<string, DashboardRoute> = {
  '/': 'overview',
  '/keys': 'api-keys',
  '/usage': 'usage',
  '/billing': 'billing',
  '/playground': 'playground',
  '/settings': 'settings'
};

const docsLinks = [
  { title: 'Quickstart', detail: 'Make your first authenticated company search request in a few minutes.' },
  { title: 'Authentication', detail: 'Use x-api-key headers and keep production keys server-side.' },
  { title: 'Search endpoint', detail: 'Search companies by name today, with richer filters coming later.' },
  { title: 'Countries metadata', detail: 'Use the metadata endpoint to shape country selectors in your product.' }
];

const accountHighlights = [
  '1 live key and 1 sandbox key are ready for immediate testing',
  'Usage is comfortably inside the Starter allowance this month',
  'No billing or API health issue is blocking customer-side evaluation'
];

const activityRows = [
  { country: 'DK', label: 'Novo Nordisk A/S', detail: 'GET /v1/companies/search', time: '10 min ago', state: '200 OK' },
  { country: 'SE', label: 'Spotify AB', detail: 'GET /v1/companies/search', time: '1 hour ago', state: '200 OK' },
  { country: 'SE', label: 'Klarna Bank AB', detail: 'GET /v1/companies/search', time: '3 hours ago', state: '200 OK' },
  { country: 'DE', label: 'Zalando SE', detail: 'GET /v1/companies/search', time: 'Yesterday', state: '200 OK' },
  { country: 'DK', label: 'Maersk Line A/S', detail: 'GET /v1/companies/search', time: 'Yesterday', state: '200 OK' }
];

const endpointUsage = [
  { name: '/v1/companies/search', count: '1,014', pct: 79 },
  { name: '/v1/meta/countries', count: '188', pct: 15 },
  { name: '/health', count: '82', pct: 6 }
];

const maskedKey = (value: string) => `${value.slice(0, 8)}••••${value.slice(-4)}`;
const formatQuota = (value: number) => (value === 0 ? 'Custom' : value.toLocaleString());

function getRouteFromLocation(pathname: string): DashboardRoute {
  return routeByPath[pathname] ?? 'overview';
}

export default function App() {
  const [activeRoute, setActiveRoute] = useState<DashboardRoute>(() => getRouteFromLocation(window.location.pathname));
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = window.localStorage.getItem('company-data-dashboard-theme');
    return saved === 'dark' ? 'dark' : 'light';
  });
  const [query, setQuery] = useState('Example');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [billingPlans, setBillingPlans] = useState<BillingPlan[]>([]);
  const [billingMode, setBillingMode] = useState<string>('stripe');
  const [checkoutConfigured, setCheckoutConfigured] = useState(false);
  const [apiHealth, setApiHealth] = useState<string>('Checking');
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const activeItem = useMemo(
    () => navItems.find((item) => item.id === activeRoute) ?? navItems[0],
    [activeRoute]
  );

  const mainNavItems = navItems.filter((item) => item.section === 'main');
  const workspaceNavItems = navItems.filter((item) => item.section === 'workspace');

  const requestsThisMonth = 1284;
  const monthlyQuota = 10000;
  const usagePercent = Math.round((requestsThisMonth / monthlyQuota) * 100);

  useEffect(() => {
    const onPopState = () => setActiveRoute(getRouteFromLocation(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('company-data-dashboard-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.title = `${activeItem.label} · Company Data Dashboard`;
  }, [activeItem]);

  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      setIsLoadingMeta(true);
      setMetaError(null);

      try {
        const [plansResult, healthResult] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/v1/billing/plans`),
          fetch(`${API_BASE_URL}/health`)
        ]);

        if (cancelled) {
          return;
        }

        const warnings: string[] = [];

        if (plansResult.status === 'fulfilled') {
          if (plansResult.value.ok) {
            const plansData = (await plansResult.value.json()) as BillingPlansResponse;
            setBillingPlans(Array.isArray(plansData.data) ? plansData.data : []);
            setBillingMode(plansData.meta?.mode ?? 'stripe');
            setCheckoutConfigured(Boolean(plansData.meta?.checkoutConfigured));
          } else {
            warnings.push(`Billing plans unavailable (${plansResult.value.status})`);
          }
        } else {
          warnings.push('Billing plans request failed');
        }

        if (healthResult.status === 'fulfilled') {
          if (healthResult.value.ok) {
            const healthData = (await healthResult.value.json()) as HealthResponse;
            setApiHealth(healthData.status ?? 'ok');
          } else {
            warnings.push(`API health unavailable (${healthResult.value.status})`);
            setApiHealth('degraded');
          }
        } else {
          warnings.push('API health request failed');
          setApiHealth('degraded');
        }

        if (warnings.length > 0) {
          setMetaError(warnings.join(' · '));
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setApiHealth('degraded');
        setMetaError(error instanceof Error ? error.message : 'Failed to load dashboard metadata');
      } finally {
        if (!cancelled) {
          setIsLoadingMeta(false);
        }
      }
    }

    loadMeta();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!copiedLabel) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setCopiedLabel(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [copiedLabel]);

  function navigateTo(route: DashboardRoute) {
    const item = navItems.find((entry) => entry.id === route);
    if (!item) {
      return;
    }

    if (window.location.pathname !== item.path) {
      window.history.pushState({}, '', item.path);
    }

    setActiveRoute(route);
  }

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedLabel(label);
    } catch {
      setCopiedLabel(`Could not copy ${label}`);
    }
  }

  async function runSearch() {
    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/v1/companies/search?q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'x-api-key': 'demo_live_123'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed with ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Unknown search error');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  function renderOverview() {
    const currentPlan = billingPlans[1] ?? billingPlans[0];
    const planName = currentPlan?.displayName ?? 'Growth Tier';
    const planPrice = currentPlan?.code === 'starter' ? '€49' : currentPlan?.code === 'growth' ? '€299' : 'Custom';

    return (
      <div className="content-stack dashboard-overview-stack">
        <section className="shell-card overview-hero-panel">
          <div className="overview-hero-copy">
            <span className="section-kicker">Customer workspace</span>
            <h2>Good morning — your backend is healthy and ready for customer testing.</h2>
            <p>
              Company Data stays centered on the same core things as the reference: status up top, a calm shell,
              obvious primary navigation, and recent activity driving the page.
            </p>
            <div className="button-row left hero-actions-row">
              <button className="primary-button" onClick={() => navigateTo('playground')}>Run a live request</button>
              <button className="ghost-button" onClick={() => navigateTo('api-keys')}>Manage API keys</button>
            </div>
          </div>

          <div className="overview-hero-side">
            <div className="hero-side-card shell-card subtle-card">
              <div className="status-row compact">
                <span className={metaError ? 'pill warn' : 'pill success'}>API {isLoadingMeta ? 'Checking' : apiHealth}</span>
                <span className="meta-label">Updated just now</span>
              </div>
              <div className="hero-side-metric">
                <strong>{(monthlyQuota - requestsThisMonth).toLocaleString()}</strong>
                <span>requests remaining this month</span>
              </div>
              <div className="mini-note-list">
                {accountHighlights.map((item) => (
                  <div key={item} className="mini-note-row">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="top-metrics-grid">
          <article className="stat-shell shell-card top-metric-card emphasis">
            <div className="stat-top">
              <span className="stat-label">Monthly usage</span>
              <span className="stat-chip accent">{usagePercent}% used</span>
            </div>
            <strong>{requestsThisMonth.toLocaleString()}</strong>
            <span className="stat-subtitle">of {monthlyQuota.toLocaleString()} requests</span>
            <div className="usage-track compact">
              <div className="usage-fill" style={{ width: `${usagePercent}%` }} />
            </div>
            <p>{(monthlyQuota - requestsThisMonth).toLocaleString()} requests left before reset.</p>
          </article>

          <article className="stat-shell shell-card top-metric-card">
            <div className="stat-top">
              <span className="stat-label">Current plan</span>
              <span className="stat-chip accent">{planName}</span>
            </div>
            <strong>{planPrice}</strong>
            <span className="stat-subtitle">per month</span>
            <p>{checkoutConfigured ? 'Checkout is active and customer-ready.' : 'Checkout shell is in place while self-serve remains scaffolded.'}</p>
          </article>

          <article className="stat-shell shell-card top-metric-card">
            <div className="stat-top">
              <span className="stat-label">Live keys</span>
              <span className="stat-chip">2 available</span>
            </div>
            <strong>1 live / 1 sandbox</strong>
            <span className="stat-subtitle">credential split</span>
            <p>Enough to test safely without blocking production-style integration work.</p>
          </article>

          <article className="stat-shell shell-card top-metric-card">
            <div className="stat-top">
              <span className="stat-label">Data freshness</span>
              <span className="stat-chip">Nordic sync</span>
            </div>
            <strong>2h ago</strong>
            <span className="stat-subtitle">latest regional sync</span>
            <p>14.2M companies remain available in the current synced dataset.</p>
          </article>
        </section>

        <section className="overview-main-grid">
          <article className="shell-card activity-panel">
            <div className="panel-header tight panel-header-spacious">
              <div>
                <span className="section-kicker">Recent activity</span>
                <h3>Latest customer-side requests</h3>
                <p className="panel-intro">A dominant activity area like the reference, focused on the stream customers actually care about.</p>
              </div>
              <div className="button-row overview-panel-actions">
                <button className="ghost-button small" onClick={() => navigateTo('usage')}>View usage</button>
                <button className="primary-button small" onClick={() => navigateTo('playground')}>Test a request</button>
              </div>
            </div>

            {metaError ? <div className="callout error padded-callout">{metaError}</div> : null}

            <div className="activity-list large-activity-list">
              {activityRows.map((row) => (
                <div className="activity-row" key={`${row.label}-${row.time}`}>
                  <div className="activity-row-main">
                    <div className="activity-country-badge">{row.country}</div>
                    <div>
                      <strong>{row.label}</strong>
                      <p>{row.detail}</p>
                    </div>
                  </div>
                  <div className="table-row-meta">
                    <span>{row.time}</span>
                    <span className="pill success">{row.state}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <div className="overview-side-stack">
            <article className="shell-card panel-card side-summary-card">
              <div className="panel-header tight">
                <div>
                  <span className="section-kicker">Workspace summary</span>
                  <h3>Account snapshot</h3>
                </div>
              </div>
              <div className="summary-mini-grid">
                <div className="inset-card">
                  <span>Environment</span>
                  <strong>Production-ready</strong>
                </div>
                <div className="inset-card">
                  <span>Billing mode</span>
                  <strong>{billingMode}</strong>
                </div>
                <div className="inset-card">
                  <span>Primary flow</span>
                  <strong>Search API</strong>
                </div>
                <div className="inset-card">
                  <span>Docs status</span>
                  <strong>Linked</strong>
                </div>
              </div>
            </article>

            <article className="shell-card panel-card side-summary-card">
              <div className="panel-header tight">
                <div>
                  <span className="section-kicker">Endpoint mix</span>
                  <h3>Traffic distribution</h3>
                </div>
              </div>
              <div className="endpoint-list compact-endpoint-list">
                {endpointUsage.map((endpoint) => (
                  <div className="endpoint-row" key={endpoint.name}>
                    <div className="endpoint-copy">
                      <code>{endpoint.name}</code>
                      <strong>{endpoint.count}</strong>
                    </div>
                    <div className="usage-track compact subtle-track">
                      <div className="usage-fill green" style={{ width: `${endpoint.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </div>
    );
  }

  function renderApiKeys() {
    return (
      <div className="content-stack narrow-stack page-stack">
        <section className="page-hero shell-card panel-card">
          <div>
            <span className="section-kicker">API keys</span>
            <h2>Manage credentials</h2>
            <p className="panel-intro">This page exists to help a customer issue, copy and rotate credentials quickly without hunting through unrelated account details.</p>
          </div>
          <button className="primary-button small" onClick={() => copyText('demo key', 'demo_live_123')}>
            {copiedLabel === 'demo key' ? 'Copied' : 'Copy demo key'}
          </button>
        </section>

        <section className="shell-card panel-card">
          <div className="data-table-card">
            <div className="data-table-header data-table-row">
              <span>Name</span>
              <span>Prefix</span>
              <span>Environment</span>
              <span>Last used</span>
            </div>
            {[
              { name: 'Local customer demo', prefix: maskedKey('demo_live_1234'), env: 'Live', used: '2 min ago' },
              { name: 'Sandbox testing', prefix: maskedKey('sandbox_key_9876'), env: 'Sandbox', used: 'Today' }
            ].map((key) => (
              <div className="data-table-row" key={key.name}>
                <div className="table-main">
                  <strong>{key.name}</strong>
                  <p>Used for setup, smoke tests and early production-style validation.</p>
                </div>
                <code>{key.prefix}</code>
                <span className={key.env === 'Live' ? 'pill success' : 'pill'}>{key.env}</span>
                <span>{key.used}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="two-column-grid aligned-top">
          <article className="shell-card panel-card">
            <div className="panel-header tight">
              <div>
                <span className="section-kicker">Quick use</span>
                <h3>First authenticated request</h3>
              </div>
            </div>
            <div className="snippet-card dark-snippet">
              <code>curl -H "x-api-key: demo_live_123" "{API_BASE_URL}/v1/companies/search?q=example&amp;limit=5"</code>
            </div>
            <div className="button-row left">
              <button
                className="ghost-button small"
                onClick={() =>
                  copyText(
                    'curl snippet',
                    `curl -H "x-api-key: demo_live_123" "${API_BASE_URL}/v1/companies/search?q=example&limit=5"`
                  )
                }
              >
                {copiedLabel === 'curl snippet' ? 'Copied' : 'Copy curl'}
              </button>
            </div>
          </article>

          <article className="shell-card panel-card callout-panel">
            <span className="section-kicker">Security note</span>
            <h3>Keep secrets out of client code</h3>
            <p>
              Do not ship keys in browser bundles or share them casually in screenshots. Rotation,
              environment scoping and audit history can deepen here later without changing the page purpose.
            </p>
          </article>
        </section>
      </div>
    );
  }

  function renderUsage() {
    return (
      <div className="content-stack narrow-stack page-stack">
        <section className="page-hero shell-card panel-card">
          <div>
            <span className="section-kicker">Usage</span>
            <h2>Requests and limits</h2>
            <p className="panel-intro">Use this page to understand request burn, remaining headroom and how your traffic is distributed across endpoints.</p>
          </div>
          <span className="pill">Starter allowance</span>
        </section>

        <section className="shell-card panel-card">
          <div className="usage-visual-card">
            <div className="usage-summary">
              <strong>{requestsThisMonth.toLocaleString()}</strong>
              <span>requests this month</span>
            </div>
            <div className="usage-track large">
              <div className="usage-fill" style={{ width: `${usagePercent}%` }} />
            </div>
            <p className="muted">{requestsThisMonth.toLocaleString()} / {monthlyQuota.toLocaleString()} monthly requests used.</p>
          </div>
        </section>

        <section className="two-column-grid aligned-top">
          <article className="shell-card panel-card">
            <div className="panel-header tight">
              <div>
                <span className="section-kicker">Endpoint mix</span>
                <h3>Usage by endpoint</h3>
              </div>
            </div>
            <div className="endpoint-list">
              {endpointUsage.map((endpoint) => (
                <div className="endpoint-row" key={endpoint.name}>
                  <div className="endpoint-copy">
                    <code>{endpoint.name}</code>
                    <strong>{endpoint.count}</strong>
                  </div>
                  <div className="usage-track compact subtle-track">
                    <div className="usage-fill green" style={{ width: `${endpoint.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="shell-card panel-card">
            <div className="panel-header tight">
              <div>
                <span className="section-kicker">Plan fit</span>
                <h3>Do you need a bigger plan yet?</h3>
              </div>
            </div>
            <div className="health-hero neutral-hero">
              <strong>{monthlyQuota - requestsThisMonth}</strong>
              <span>requests remaining this month</span>
            </div>
            <div className="mini-stats-grid triple top-gap">
              <div className="inset-card">
                <span>Current plan</span>
                <strong>Starter</strong>
              </div>
              <div className="inset-card">
                <span>Rate limit context</span>
                <strong>Check billing</strong>
              </div>
              <div className="inset-card">
                <span>Best next step</span>
                <strong>Stay on Starter</strong>
              </div>
            </div>
          </article>
        </section>
      </div>
    );
  }

  function renderBilling() {
    return (
      <div className="content-stack narrow-stack page-stack">
        <section className="page-hero shell-card panel-card">
          <div>
            <span className="section-kicker">Billing</span>
            <h2>Plans and payment readiness</h2>
            <p className="panel-intro">Billing is where customers review plan options, quota shape and whether checkout wiring is actually ready for self-serve use.</p>
          </div>
          <span className="pill">{billingMode}</span>
        </section>

        <section className="shell-card panel-card">
          <div className="billing-summary-grid">
            <div className="inset-card featured-inset">
              <span>Current plan</span>
              <strong>Starter — €49/mo</strong>
              <p>A sensible default for evaluation, first integrations and modest live traffic.</p>
            </div>
            <div className="inset-card">
              <span>Checkout wiring</span>
              <strong>{checkoutConfigured ? 'Configured' : 'Scaffold only'}</strong>
              <p>This is the customer-facing check for self-serve readiness, not an internal billing operations view.</p>
            </div>
          </div>

          <div className="plans-grid top-gap">
            {billingPlans.map((plan) => (
              <div key={plan.code} className="plan-shell inset-card">
                <span>{plan.displayName}</span>
                <strong>{formatQuota(plan.monthlyQuota)} req / month</strong>
                <p>{plan.rpmLimit === 0 ? 'Custom rate limits' : `${plan.rpmLimit} req/min`}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  function renderPlayground() {
    const firstResult = searchResults[0];
    const firstResultCountry = firstResult?.countryCode ?? firstResult?.country_code ?? '—';
    const firstResultReg = firstResult?.registrationNumber ?? firstResult?.registration_number ?? '—';

    return (
      <div className="content-stack narrow-stack page-stack">
        <section className="page-hero shell-card panel-card">
          <div>
            <span className="section-kicker">Playground</span>
            <h2>Test the local API</h2>
            <p className="panel-intro">Use the playground to prove your request path works before moving into application code or support conversations.</p>
          </div>
          <span className="pill">GET /v1/companies/search</span>
        </section>

        <section className="shell-card panel-card">
          <div className="search-bar-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search company name or registration number"
            />
            <button className="primary-button" onClick={runSearch} disabled={isSearching || !query.trim()}>
              {isSearching ? 'Searching…' : 'Run search'}
            </button>
          </div>

          <div className="inline-meta-row">
            <span>Local API: <code>{API_BASE_URL}</code></span>
            <span>Seeded key: <code>demo_live_123</code></span>
          </div>

          {searchError ? <div className="callout error">{searchError}</div> : null}

          <div className="search-results-shell">
            <div className="search-results-summary inset-card">
              <span className="section-kicker">Result summary</span>
              {firstResult ? (
                <>
                  <h4>{firstResult.name ?? 'Unnamed company'}</h4>
                  <div className="summary-pairs">
                    <div>
                      <span>Country</span>
                      <strong>{firstResultCountry}</strong>
                    </div>
                    <div>
                      <span>Registration</span>
                      <strong>{firstResultReg}</strong>
                    </div>
                    <div>
                      <span>Status/source</span>
                      <strong>{firstResult.status ?? firstResult.source ?? 'Available'}</strong>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">No results yet. Run a search to validate the API path, key and payload shape.</div>
              )}
            </div>

            <div className="snippet-card dark-snippet response-snippet">
              <code>
                {searchResults.length > 0
                  ? JSON.stringify(searchResults, null, 2)
                  : '[\n  // search results will render here\n]'}
              </code>
            </div>
          </div>

          {searchResults.length > 0 ? (
            <div className="table-card-list top-gap">
              {searchResults.map((result, index) => {
                const country = result.countryCode ?? result.country_code ?? '—';
                const registrationNumber = result.registrationNumber ?? result.registration_number ?? 'No registration number';

                return (
                  <div key={`${result.id ?? registrationNumber}-${index}`} className="table-row">
                    <div>
                      <strong>{result.name ?? 'Unnamed company'}</strong>
                      <p>{result.source ?? 'Source not provided'}</p>
                    </div>
                    <div className="table-row-meta">
                      <span>{country}</span>
                      <span className="pill soft">{registrationNumber}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </section>
      </div>
    );
  }

  function renderSettings() {
    return (
      <div className="content-stack narrow-stack page-stack">
        <section className="page-hero shell-card panel-card">
          <div>
            <span className="section-kicker">Settings</span>
            <h2>Workspace controls</h2>
            <p className="panel-intro">Settings is for workspace defaults: who has access, which alerts matter and how the account should stay secure.</p>
          </div>
          <a className="ghost-button small link-button" href={DOCS_BASE_URL} target="_blank" rel="noreferrer">
            Open docs
          </a>
        </section>

        <section className="shell-card panel-card">
          <div className="settings-grid">
            <div className="settings-item">
              <strong>Team access</strong>
              <p>2 members · keep workspace access decisions here instead of mixing them into overview or API key pages.</p>
            </div>
            <div className="settings-item">
              <strong>Notifications</strong>
              <p>Usage threshold and billing notices belong here as customer-facing alert preferences.</p>
            </div>
            <div className="settings-item">
              <strong>Security</strong>
              <p>Session history, audit events and stronger account safeguards can grow here over time.</p>
            </div>
          </div>
        </section>

        <section className="shell-card panel-card">
          <div className="panel-header tight">
            <div>
              <span className="section-kicker">Developer handoff</span>
              <h3>Useful docs links</h3>
            </div>
          </div>
          <div className="docs-grid">
            {docsLinks.map((item) => (
              <a className="docs-item utility-link-card" key={item.title} href={DOCS_BASE_URL} target="_blank" rel="noreferrer">
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </a>
            ))}
          </div>
        </section>
      </div>
    );
  }

  function renderRoute() {
    switch (activeRoute) {
      case 'overview':
        return renderOverview();
      case 'api-keys':
        return renderApiKeys();
      case 'usage':
        return renderUsage();
      case 'billing':
        return renderBilling();
      case 'playground':
        return renderPlayground();
      case 'settings':
        return renderSettings();
    }
  }

  return (
    <div className="dashboard-shell" data-theme={theme}>
      <aside className="dashboard-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand-block compact-brand-block" aria-label="Company Data dashboard">
            <div className="brand-mark">CD</div>
            <div>
              <div className="brand-title">Company Data</div>
              <div className="brand-subtitle">Customer dashboard</div>
            </div>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-section-label">Main menu</span>
            <nav className="sidebar-nav" aria-label="Main dashboard sections">
              {mainNavItems.map((item) => (
                <button
                  key={item.id}
                  className={item.id === activeRoute ? 'sidebar-nav-item active' : 'sidebar-nav-item'}
                  onClick={() => navigateTo(item.id)}
                >
                  <span className="nav-pillmark">{item.shortLabel}</span>
                  <span className="nav-copy">
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-section-label">Workspace</span>
            <nav className="sidebar-nav" aria-label="Workspace sections">
              {workspaceNavItems.map((item) => (
                <button
                  key={item.id}
                  className={item.id === activeRoute ? 'sidebar-nav-item active' : 'sidebar-nav-item'}
                  onClick={() => navigateTo(item.id)}
                >
                  <span className="nav-pillmark">{item.shortLabel}</span>
                  <span className="nav-copy">
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-footer shell-card subtle-card">
            <div className="status-row compact">
              <span className="pill success">Ready</span>
              <span className="meta-label">Dashboard on :3012</span>
            </div>
            <strong>Integration workspace</strong>
            <p>API base {API_BASE_URL} · docs handoff kept intact for customer onboarding.</p>
            <div className="sidebar-links">
              <a href={DOCS_BASE_URL} target="_blank" rel="noreferrer">Open docs</a>
              <button className="linkish-button" onClick={() => navigateTo('playground')}>Run a test request</button>
            </div>
          </div>

          <div className="profile-card shell-card">
            <div className="profile-avatar">GA</div>
            <div className="profile-copy">
              <strong>Gaba Workspace</strong>
              <span>Starter customer</span>
            </div>
            <button
              className="ghost-button small theme-toggle-button"
              onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
            >
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar-shell refined-topbar">
          <div>
            <span className="section-kicker">Backend overview</span>
            <h1>{activeItem.label}</h1>
            <p className="section-intro">{activeItem.description}</p>
          </div>

          <div className="topbar-actions">
            <span className={metaError ? 'pill warn' : 'pill success'}>API {isLoadingMeta ? 'Checking' : apiHealth}</span>
            <a className="ghost-button link-button" href={DOCS_BASE_URL} target="_blank" rel="noreferrer">
              Docs
            </a>
            <button
              className={activeRoute === 'overview' ? 'ghost-button' : 'primary-button'}
              onClick={() => navigateTo('api-keys')}
            >
              {activeRoute === 'overview' ? 'API keys' : 'Create key'}
            </button>
          </div>
        </header>

        {renderRoute()}
      </main>
    </div>
  );
}
