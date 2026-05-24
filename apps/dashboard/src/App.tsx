import { useEffect, useMemo, useState } from 'react';

/* ── Inline SVG icons ────────────────────────────────────── */
const Icon = {
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  Key: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
    </svg>
  ),
  BarChart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  CreditCard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Activity: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Database: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  LogOut: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Copy: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
};

/* ── Types ───────────────────────────────────────────────── */
type Route = 'overview' | 'api-keys' | 'usage' | 'billing' | 'playground' | 'settings';

type BillingPlan = { code: string; displayName: string; monthlyQuota: number; rpmLimit: number; notes?: string };
type BillingPlansResponse = { data?: BillingPlan[]; meta?: { mode?: string; checkoutConfigured?: boolean; publishableKeyConfigured?: boolean } };
type HealthResponse = { status?: string; service?: string };
type SearchResult = { id?: string; country_code?: string; countryCode?: string; name?: string; registration_number?: string; registrationNumber?: string; source?: string; status?: string };
type CurrentUser = { id: string; email: string; displayName: string | null; emailVerified: boolean; status: string; createdAt: string };
type ApiKey = { id: string; label: string | null; keyPrefix: string; active: boolean; lastUsedAt: string | null; createdAt: string };

/* ── Constants ───────────────────────────────────────────── */
const API_BASE_URL  = import.meta.env.VITE_API_BASE_URL  ?? 'http://localhost:3011';
const DOCS_BASE_URL = import.meta.env.VITE_DOCS_BASE_URL ?? 'http://localhost:3010';

type NavDef = { id: Route; label: string; section: 'main' | 'workspace'; icon: keyof typeof Icon };
const NAV: NavDef[] = [
  { id: 'overview',    label: 'Overview',    section: 'main',      icon: 'Dashboard'   },
  { id: 'api-keys',    label: 'API Keys',    section: 'main',      icon: 'Key'         },
  { id: 'usage',       label: 'Usage',       section: 'main',      icon: 'BarChart'    },
  { id: 'billing',     label: 'Billing',     section: 'main',      icon: 'CreditCard'  },
  { id: 'playground',  label: 'Playground',  section: 'workspace', icon: 'Search'      },
  { id: 'settings',    label: 'Settings',    section: 'workspace', icon: 'Settings'    },
];

const PATH_MAP: Record<string, Route> = { '/': 'overview', '/keys': 'api-keys', '/usage': 'usage', '/billing': 'billing', '/playground': 'playground', '/settings': 'settings' };
const ROUTE_PATH: Record<Route, string> = { 'overview': '/', 'api-keys': '/keys', 'usage': '/usage', 'billing': '/billing', 'playground': '/playground', 'settings': '/settings' };

const ACTIVITY = [
  { country: 'DK', name: 'Novo Nordisk A/S',  endpoint: 'GET /v1/companies/search', time: '10 min ago',   state: '200 OK' },
  { country: 'SE', name: 'Spotify AB',         endpoint: 'GET /v1/companies/search', time: '1 hour ago',  state: '200 OK' },
  { country: 'SE', name: 'Klarna Bank AB',      endpoint: 'GET /v1/companies/search', time: '3 hours ago', state: '200 OK' },
  { country: 'DE', name: 'Zalando SE',          endpoint: 'GET /v1/companies/search', time: 'Yesterday',  state: '200 OK' },
  { country: 'DK', name: 'Maersk Line A/S',     endpoint: 'GET /v1/companies/search', time: 'Yesterday',  state: '200 OK' },
];

const ENDPOINTS = [
  { name: '/v1/companies/search', count: '1,014', pct: 79 },
  { name: '/v1/meta/countries',   count: '188',   pct: 15 },
  { name: '/health',              count: '82',    pct: 6  },
];

const API_KEYS = [
  { name: 'Production – Main App',       prefix: 'ck_live_4xP...', created: 'Oct 12, 2023', lastUsed: '2 mins ago'  },
  { name: 'Staging Environment',          prefix: 'ck_test_9mQ...', created: 'Nov 05, 2023', lastUsed: '4 hours ago' },
  { name: 'Developer Sandbox',            prefix: 'ck_test_2vW...', created: 'Jan 18, 2024', lastUsed: '3 days ago'  },
];

const BILLING_HISTORY = [
  { date: 'Oct 1, 2024',  amount: '€299.00', invoice: 'INV-2024-10' },
  { date: 'Sep 1, 2024',  amount: '€299.00', invoice: 'INV-2024-09' },
  { date: 'Aug 1, 2024',  amount: '€299.00', invoice: 'INV-2024-08' },
];

const CHART_DATA = [40,55,30,45,60,80,65,50,70,85,90,75,60,40,55,30,45,60,80,65,50,70,85,90,75,60,85,95,100,85];

const REQUESTS_THIS_MONTH = 1284;
const MONTHLY_QUOTA = 10000;
const maskKey = (v: string) => `${v.slice(0, 8)}••••${v.slice(-4)}`;
const fmtQuota = (v: number) => v === 0 ? 'Custom' : v.toLocaleString();

/* ── App ─────────────────────────────────────────────────── */
export default function App() {
  const [route,         setRoute]         = useState<Route>(() => PATH_MAP[window.location.pathname] ?? 'overview');
  const [billingPlans,  setBillingPlans]  = useState<BillingPlan[]>([]);
  const [billingMode,   setBillingMode]   = useState('stripe');
  const [checkoutOk,    setCheckoutOk]    = useState(false);
  const [apiHealth,     setApiHealth]     = useState('Checking');
  const [loading,       setLoading]       = useState(true);
  const [metaError,     setMetaError]     = useState<string | null>(null);
  const [query,         setQuery]         = useState('');
  const [searching,     setSearching]     = useState(false);
  const [results,       setResults]       = useState<SearchResult[]>([]);
  const [searchErr,     setSearchErr]     = useState<string | null>(null);
  const [copied,        setCopied]        = useState<string | null>(null);
  // real user session + keys
  const [currentUser,   setCurrentUser]   = useState<CurrentUser | null>(null);
  const [apiKeys,       setApiKeys]       = useState<ApiKey[]>([]);
  const [keysLoading,   setKeysLoading]   = useState(false);
  const [newKeyLabel,   setNewKeyLabel]   = useState('');
  const [creatingKey,   setCreatingKey]   = useState(false);
  const [revealedKey,   setRevealedKey]   = useState<string | null>(null); // shown once after creation

  const activeNav = useMemo(() => NAV.find(n => n.id === route) ?? NAV[0], [route]);
  const mainNav      = NAV.filter(n => n.section === 'main');
  const workspaceNav = NAV.filter(n => n.section === 'workspace');
  const usagePct = Math.round((REQUESTS_THIS_MONTH / MONTHLY_QUOTA) * 100);

  /* routing */
  useEffect(() => {
    const handler = () => setRoute(PATH_MAP[window.location.pathname] ?? 'overview');
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  function go(r: Route) {
    if (window.location.pathname !== ROUTE_PATH[r]) window.history.pushState({}, '', ROUTE_PATH[r]);
    setRoute(r);
  }

  /* load metadata */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setMetaError(null);
      try {
        const [plansRes, healthRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/v1/billing/plans`),
          fetch(`${API_BASE_URL}/health`),
        ]);
        if (cancelled) return;
        const warns: string[] = [];
        if (plansRes.status === 'fulfilled' && plansRes.value.ok) {
          const d = await plansRes.value.json() as BillingPlansResponse;
          setBillingPlans(Array.isArray(d.data) ? d.data : []);
          setBillingMode(d.meta?.mode ?? 'stripe');
          setCheckoutOk(Boolean(d.meta?.checkoutConfigured));
        } else warns.push('Billing plans unavailable');
        if (healthRes.status === 'fulfilled' && healthRes.value.ok) {
          const d = await healthRes.value.json() as HealthResponse;
          setApiHealth(d.status ?? 'ok');
        } else { setApiHealth('degraded'); warns.push('API health unavailable'); }
        if (warns.length > 0) setMetaError(warns.join(' · '));
      } catch (e) { if (!cancelled) { setApiHealth('degraded'); setMetaError(e instanceof Error ? e.message : 'Failed to load metadata'); } }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { document.title = `${activeNav.label} · Company Data`; }, [activeNav]);
  useEffect(() => { if (!copied) return; const t = setTimeout(() => setCopied(null), 1800); return () => clearTimeout(t); }, [copied]);

  /* load session */
  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' })
      .then(r => r.json())
      .then((d: { user?: CurrentUser | null }) => setCurrentUser(d.user ?? null))
      .catch(() => setCurrentUser(null));
  }, []);

  /* load API keys when user is known */
  useEffect(() => {
    if (!currentUser) return;
    setKeysLoading(true);
    fetch(`${API_BASE_URL}/v1/keys`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: { data?: ApiKey[] }) => setApiKeys(d.data ?? []))
      .catch(() => setApiKeys([]))
      .finally(() => setKeysLoading(false));
  }, [currentUser]);

  async function handleCreateKey() {
    setCreatingKey(true);
    try {
      const res = await fetch(`${API_BASE_URL}/v1/keys`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newKeyLabel.trim() || null }),
      });
      const d = await res.json() as { data?: ApiKey; rawKey?: string };
      if (d.data) setApiKeys(prev => [d.data!, ...prev]);
      if (d.rawKey) setRevealedKey(d.rawKey);
      setNewKeyLabel('');
    } finally {
      setCreatingKey(false);
    }
  }

  async function handleRevokeKey(keyId: string) {
    if (!confirm('Revoke this API key? This cannot be undone.')) return;
    await fetch(`${API_BASE_URL}/v1/keys/${keyId}`, { method: 'DELETE', credentials: 'include' });
    setApiKeys(prev => prev.filter(k => k.id !== keyId));
  }

  async function copyText(label: string, value: string) {
    try { await navigator.clipboard.writeText(value); setCopied(label); } catch { setCopied(`Could not copy`); }
  }

  async function runSearch() {
    if (!query.trim()) return;
    setSearching(true); setSearchErr(null);
    try {
      const res = await fetch(`${API_BASE_URL}/v1/companies/search?q=${encodeURIComponent(query)}&limit=5`, { headers: { 'x-api-key': 'demo_live_123' } });
      if (!res.ok) throw new Error(`Search failed with ${res.status}`);
      const d = await res.json();
      setResults(Array.isArray(d.data) ? d.data : []);
    } catch (e) { setSearchErr(e instanceof Error ? e.message : 'Search failed'); setResults([]); }
    finally { setSearching(false); }
  }

  /* ── Overview ─────────────────────────────────────────── */
  function renderOverview() {
    const currentPlan = billingPlans[1] ?? billingPlans[0];
    const planName  = currentPlan?.displayName ?? 'Growth Tier';
    const planPrice = currentPlan?.code === 'starter' ? '€49' : currentPlan?.code === 'growth' ? '€299' : 'Custom';

    return (
      <div className="db-section-stack">
        <div className="db-stat-grid">
          <div className="db-stat">
            <div className="db-stat-top">
              <span className="db-stat-label">API Usage</span>
              <span className="db-stat-icon"><Icon.Activity /></span>
            </div>
            <div>
              <span className="db-stat-value">{REQUESTS_THIS_MONTH.toLocaleString()}</span>
              <span className="db-stat-unit">/ {MONTHLY_QUOTA.toLocaleString()} calls</span>
            </div>
            <div className="db-bar"><div className="db-bar-fill" style={{ width: `${usagePct}%` }} /></div>
            <div className="db-stat-sub">Resets in 12 days · {MONTHLY_QUOTA - REQUESTS_THIS_MONTH} remaining</div>
          </div>

          <div className="db-stat">
            <div className="db-stat-top">
              <span className="db-stat-label">Current Plan</span>
              <span className="db-badge blue">{planName}</span>
            </div>
            <div>
              <span className="db-stat-value">{planPrice}</span>
              <span className="db-stat-unit">/ month</span>
            </div>
            <div className="db-stat-ok">
              <Icon.CheckCircle />
              Active and in good standing
            </div>
          </div>

          <div className="db-stat">
            <div className="db-stat-top">
              <span className="db-stat-label">Database Updates</span>
              <span className="db-stat-icon"><Icon.Database /></span>
            </div>
            <div>
              <span className="db-stat-value">14.2M</span>
              <span className="db-stat-unit">companies</span>
            </div>
            <div className="db-stat-sub">Nordic region synced 2 hours ago.</div>
          </div>
        </div>

        <div className="db-card">
          <div className="db-card-head">
            <div>
              <div className="db-card-title">Recent Activity</div>
            </div>
            <button className="db-card-action">View all logs</button>
          </div>
          <div>
            {ACTIVITY.map(a => (
              <div className="db-activity-row" key={a.name + a.time}>
                <div className="db-activity-left">
                  <span className="db-country-tag">{a.country}</span>
                  <div>
                    <div className="db-activity-name">{a.name}</div>
                    <div className="db-activity-endpoint">{a.endpoint}</div>
                  </div>
                </div>
                <div className="db-activity-right">
                  <span className="db-activity-time">{a.time}</span>
                  <span className="db-badge ok">{a.state}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── API Keys ─────────────────────────────────────────── */
  function renderApiKeys() {
    return (
      <div className="db-section-stack">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Active API Keys</h2>
            <p style={{ fontSize: '13px', color: 'var(--db-muted)', marginTop: '4px' }}>Manage keys for authenticating API requests.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              value={newKeyLabel}
              onChange={e => setNewKeyLabel(e.target.value)}
              placeholder="Label (optional)"
              style={{ fontSize: '13px', padding: '6px 10px', border: '1px solid var(--db-border)', borderRadius: '6px', background: 'var(--db-input-bg)', color: 'var(--db-text)', width: '180px' }}
            />
            <button className="db-btn-primary" onClick={handleCreateKey} disabled={creatingKey}>
              <Icon.Plus /> {creatingKey ? 'Creating…' : 'Create New Key'}
            </button>
          </div>
        </div>

        {revealedKey && (
          <div className="db-info-box" style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.25)' }}>
            <span className="db-info-icon"><Icon.CheckCircle /></span>
            <div style={{ flex: 1 }}>
              <div className="db-info-title">Your new API key — copy it now, it won't be shown again</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <code style={{ fontSize: '13px', wordBreak: 'break-all', flex: 1 }}>{revealedKey}</code>
                <button className="db-key-icon-btn" onClick={() => copyText('revealed', revealedKey)}>
                  {copied === 'revealed' ? <Icon.Check /> : <Icon.Copy />}
                </button>
              </div>
            </div>
            <button onClick={() => setRevealedKey(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--db-muted)', fontSize: '18px', lineHeight: 1 }}>×</button>
          </div>
        )}

        <div className="db-card">
          {keysLoading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--db-muted)', fontSize: '13px' }}>Loading keys…</div>
          ) : apiKeys.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--db-muted)', fontSize: '13px' }}>No API keys yet. Create one above.</div>
          ) : (
            <table className="db-table">
              <thead>
                <tr><th>Label</th><th>Prefix</th><th>Created</th><th>Last Used</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
              </thead>
              <tbody>
                {apiKeys.map(k => (
                  <tr key={k.id}>
                    <td><span className="db-td-main">{k.label ?? '—'}</span></td>
                    <td><code className="db-code-chip">{k.keyPrefix}…</code></td>
                    <td style={{ color: 'var(--db-muted)', fontSize: '13px' }}>{new Date(k.createdAt).toLocaleDateString()}</td>
                    <td style={{ color: 'var(--db-muted)', fontSize: '13px' }}>{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="db-key-actions">
                        <button className="db-key-icon-btn danger" title="Revoke key" onClick={() => handleRevokeKey(k.id)}><Icon.Trash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="db-info-box">
          <span className="db-info-icon"><Icon.Key /></span>
          <div>
            <div className="db-info-title">Keep your keys secure</div>
            <p className="db-info-text">Do not share API keys in public areas like GitHub or client-side code. All requests must be made over HTTPS.</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Usage ────────────────────────────────────────────── */
  function renderUsage() {
    return (
      <div className="db-section-stack">
        <div className="db-card">
          <div className="db-card-head"><div className="db-card-title">API Calls (Last 30 Days)</div></div>
          <div className="db-card-body">
            <div className="db-bar-chart">
              {CHART_DATA.map((v, i) => (
                <div key={i} className="db-bar-col" style={{ height: `${v}%` }} title={`${Math.floor(v * 123)} calls`} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px', color: 'var(--db-muted)' }}>
              <span>Oct 1</span><span>Oct 15</span><span>Oct 30</span>
            </div>
          </div>
        </div>

        <div className="db-two-col">
          <div className="db-card">
            <div className="db-card-head"><div className="db-card-title">Usage by Endpoint</div></div>
            <div className="db-card-body">
              {ENDPOINTS.map(e => (
                <div className="db-endpoint-row" key={e.name}>
                  <div className="db-endpoint-header">
                    <span className="db-endpoint-name">{e.name}</span>
                    <span className="db-endpoint-count">{e.count}</span>
                  </div>
                  <div className="db-endpoint-bar"><div className="db-endpoint-fill" style={{ width: `${e.pct}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="db-card">
            <div className="db-card-head"><div className="db-card-title">Quota</div></div>
            <div className="db-card-body">
              <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--db-text)', letterSpacing: '-0.02em' }}>{usagePct}%</div>
                <div style={{ fontSize: '13px', color: 'var(--db-muted)', marginTop: '4px' }}>of monthly quota used</div>
              </div>
              <div className="db-bar" style={{ height: '8px' }}>
                <div className="db-bar-fill" style={{ width: `${usagePct}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--db-muted)', marginTop: '8px' }}>
                <span>{REQUESTS_THIS_MONTH.toLocaleString()} used</span>
                <span>{MONTHLY_QUOTA.toLocaleString()} limit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Billing ──────────────────────────────────────────── */
  function renderBilling() {
    return (
      <div className="db-section-stack" style={{ maxWidth: '720px' }}>
        <div className="db-card">
          <div className="db-card-head">
            <div>
              <div className="db-card-title">Growth Plan</div>
              <div className="db-card-intro">Billed €299 monthly. Renews Nov 1, 2024.</div>
            </div>
            <span className="db-badge ok">Active</span>
          </div>
          <div className="db-card-body">
            <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
              <span>Monthly Request Limit</span>
              <span style={{ color: 'var(--db-muted)' }}>{REQUESTS_THIS_MONTH.toLocaleString()} / {MONTHLY_QUOTA.toLocaleString()}</span>
            </div>
            <div className="db-bar" style={{ height: '8px' }}><div className="db-bar-fill" style={{ width: `${usagePct}%` }} /></div>
            <p style={{ fontSize: '12px', color: 'var(--db-muted)', marginTop: '6px' }}>Overage billed at €0.005 per request.</p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '22px', paddingTop: '18px', borderTop: '1px solid var(--db-hover)' }}>
              <button className="db-btn-outline">Manage Billing Info</button>
              <button className="db-btn-primary">Upgrade Plan</button>
            </div>
          </div>
        </div>

        {billingPlans.length > 0 && (
          <div className="db-card">
            <div className="db-card-head"><div className="db-card-title">Available Plans</div></div>
            <div className="db-card-body">
              <div className="db-plans-grid">
                {billingPlans.map(p => (
                  <div className="db-plan-card" key={p.code}>
                    <div className="db-plan-name">{p.displayName}</div>
                    <div className="db-plan-quota">{fmtQuota(p.monthlyQuota)}</div>
                    <div className="db-plan-rpm">req / month</div>
                    <div className="db-plan-rpm" style={{ marginTop: '6px' }}>{p.rpmLimit === 0 ? 'Custom rpm' : `${p.rpmLimit} rpm`}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="db-card">
          <div className="db-card-head"><div className="db-card-title">Billing History</div></div>
          <table className="db-table">
            <tbody>
              {BILLING_HISTORY.map(b => (
                <tr key={b.invoice}>
                  <td style={{ color: 'var(--db-muted)', fontSize: '13px' }}>{b.date}</td>
                  <td style={{ fontWeight: 600 }}>{b.amount}</td>
                  <td><span className="db-badge ok"><Icon.Check /> Paid</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="db-card-action" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                      <Icon.Download /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /* ── Playground ───────────────────────────────────────── */
  function renderPlayground() {
    const firstResult = results[0];
    const country = firstResult?.countryCode ?? firstResult?.country_code ?? '—';
    const reg = firstResult?.registrationNumber ?? firstResult?.registration_number ?? '—';

    return (
      <div className="db-section-stack" style={{ maxWidth: '840px' }}>
        <div className="db-card">
          <div className="db-card-head">
            <div>
              <div className="db-card-title">API Playground</div>
              <div className="db-card-intro">Test the company search endpoint without writing code.</div>
            </div>
          </div>
          <div className="db-card-body">
            <div className="db-search-bar">
              <div className="db-search-input-wrap">
                <span className="db-search-input-icon"><Icon.Search /></span>
                <input
                  className="db-search-input"
                  type="text"
                  placeholder="Search by company name or registration number…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && void runSearch()}
                />
              </div>
              <button className="db-btn-primary" onClick={() => void runSearch()} disabled={searching || !query.trim()}>
                {searching ? 'Searching…' : 'Search'}
              </button>
            </div>

            <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--db-muted)', fontWeight: 500 }}>Try:</span>
              {['Novo Nordisk', 'Spotify', 'Maersk'].map(t => (
                <button key={t} style={{ fontSize: '12px', color: 'var(--db-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => { setQuery(t); void runSearch(); }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {searchErr && <div className="db-error">{searchErr}</div>}

        {results.length > 0 && (
          <div className="db-two-col">
            <div className="db-card">
              <div className="db-card-head"><div className="db-card-title">Top Result</div></div>
              <div className="db-card-body">
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--db-text)', marginBottom: '4px' }}>{firstResult.name ?? 'Unknown'}</div>
                <span className="db-badge ok" style={{ marginBottom: '16px', display: 'inline-flex' }}>
                  {firstResult.status ?? 'Active'}
                </span>
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--db-muted)', width: '100px' }}>Country</span>
                    <span style={{ fontWeight: 500 }}>{country}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--db-muted)', width: '100px' }}>Reg. number</span>
                    <span className="mono">{reg}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--db-muted)', width: '100px' }}>Source</span>
                    <span>{firstResult.source ?? '—'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="db-snippet" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <pre>{JSON.stringify(results, null, 2)}</pre>
            </div>
          </div>
        )}

        {results.length === 0 && !searching && !searchErr && (
          <div className="db-card">
            <div className="db-card-body" style={{ textAlign: 'center', padding: '40px', color: 'var(--db-muted)', fontSize: '14px' }}>
              No results yet. Enter a company name above and hit Search.
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Settings ─────────────────────────────────────────── */
  function renderSettings() {
    return (
      <div className="db-section-stack" style={{ maxWidth: '600px' }}>
        <div className="db-card">
          <div className="db-card-head">
            <div>
              <div className="db-card-title">Account Settings</div>
              <div className="db-card-intro">Manage your profile and preferences.</div>
            </div>
          </div>
          <div className="db-card-body">
            <div className="db-form-grid" style={{ marginBottom: '16px' }}>
              <div>
                <label className="db-form-label">Full Name</label>
                <input className="db-form-input" type="text" defaultValue="Gaba Workspace" />
              </div>
              <div>
                <label className="db-form-label">Email Address</label>
                <input className="db-form-input" type="email" defaultValue="demo@companydata.local" />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label className="db-form-label">Company</label>
              <input className="db-form-input" type="text" defaultValue="Company Data Customer" />
            </div>
            <button className="db-btn-primary">Save Changes</button>
          </div>
        </div>

        <div className="db-card">
          <div className="db-card-head"><div className="db-card-title">Developer</div></div>
          <div className="db-card-body">
            <div style={{ marginBottom: '10px', fontSize: '13px', color: 'var(--db-muted)' }}>
              API base URL
            </div>
            <code className="db-code-chip">{API_BASE_URL}</code>
            <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--db-muted)', marginBottom: '6px' }}>
              Demo key (seeded)
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <code className="db-code-chip">{maskKey('demo_live_123_abc456')}</code>
              <button className="db-btn-outline" onClick={() => copyText('demo key', 'demo_live_123')}>
                {copied === 'demo key' ? <><Icon.Check /> Copied</> : <><Icon.Copy /> Copy</>}
              </button>
            </div>
            <div style={{ marginTop: '18px' }}>
              <a className="db-btn-outline" href={DOCS_BASE_URL} target="_blank" rel="noreferrer" style={{ display: 'inline-flex' }}>
                Open docs ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Sidebar NavItem ──────────────────────────────────── */
  function NavItem({ item }: { item: NavDef }) {
    const I = Icon[item.icon];
    return (
      <button
        className={`db-nav-item ${route === item.id ? 'active' : ''}`}
        onClick={() => go(item.id)}
        aria-current={route === item.id ? 'page' : undefined}
      >
        <I />
        {item.label}
      </button>
    );
  }

  /* ── Render ───────────────────────────────────────────── */
  return (
    <div className="db-root">
      {/* Sidebar */}
      <aside className="db-sidebar">
        <div className="db-logo">
          <div className="db-logo-mark">CD</div>
          <span className="db-logo-name">CompanyData</span>
        </div>

        <nav className="db-nav" aria-label="Dashboard navigation">
          {mainNav.map(n => <NavItem key={n.id} item={n} />)}
          <div className="db-nav-divider" />
          {workspaceNav.map(n => <NavItem key={n.id} item={n} />)}
        </nav>

        <div className="db-sidebar-footer">
          <div className="db-profile">
            <div className="db-avatar">
              {currentUser ? (currentUser.displayName ?? currentUser.email).slice(0, 2).toUpperCase() : '…'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="db-profile-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser?.displayName ?? currentUser?.email ?? 'Loading…'}
              </div>
              <div className="db-profile-role">{currentUser?.email ?? ''}</div>
            </div>
            <span className="db-profile-icon" style={{ cursor: 'pointer' }} onClick={async () => {
              await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
              window.location.href = `${window.location.protocol}//${window.location.hostname}:3010/login.html`;
            }}><Icon.LogOut /></span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="db-main">
        <header className="db-header">
          <span className="db-header-title">{activeNav.label}</span>
          <div className="db-header-right">
            {metaError ? null : (
              <div className="db-api-pill">
                <span className="db-api-pill-dot" style={{ background: loading ? 'var(--db-warn)' : apiHealth === 'ok' ? 'var(--db-ok)' : '#ef4444' }} />
                API {loading ? 'Checking' : apiHealth}
              </div>
            )}
            <span className="db-header-divider" />
            <button style={{ color: 'var(--db-muted)', padding: '4px' }}>
              <Icon.Bell />
            </button>
          </div>
        </header>

        <div className="db-scroll">
          <div className="db-page">
            {metaError && <div className="db-error">{metaError}</div>}
            {route === 'overview'   && renderOverview()}
            {route === 'api-keys'   && renderApiKeys()}
            {route === 'usage'      && renderUsage()}
            {route === 'billing'    && renderBilling()}
            {route === 'playground' && renderPlayground()}
            {route === 'settings'   && renderSettings()}
          </div>
        </div>
      </main>
    </div>
  );
}
