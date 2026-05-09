import { useMemo, useState } from 'react';

type BoardColumn = 'backlog' | 'in-progress' | 'review' | 'deployed' | 'done';
type ControlView = 'overview' | 'operations' | 'customers' | 'platform' | 'planning';

type CardArea = 'public' | 'dashboard' | 'admin' | 'api' | 'data' | 'auth' | 'billing' | 'project';
type CardPriority = 'P0' | 'P1' | 'P2';
type HealthTone = 'healthy' | 'watch' | 'risk';

type BoardCard = {
  title: string;
  description: string;
  area: CardArea;
  priority: CardPriority;
  owner?: string;
  blockers?: string;
  notes?: string;
  source?: string;
};

type ColumnDefinition = {
  id: BoardColumn;
  label: string;
  hint: string;
};

type ControlMetric = {
  label: string;
  value: string;
  note: string;
  tone: HealthTone;
};

type WorkQueueItem = {
  title: string;
  note: string;
  tone: HealthTone;
};

type DomainCard = {
  title: string;
  owner: string;
  summary: string;
  status: string;
  tone: HealthTone;
  bullets: string[];
};

const columns: ColumnDefinition[] = [
  { id: 'backlog', label: 'Backlog', hint: 'Defined internal work that is not started yet.' },
  { id: 'in-progress', label: 'In Progress', hint: 'Active implementation work happening now.' },
  { id: 'review', label: 'Review', hint: 'Ready for validation, unblock, or decision.' },
  { id: 'deployed', label: 'Deployed', hint: 'Available in the local stack right now.' },
  { id: 'done', label: 'Done', hint: 'Closed for the current MVP scope.' }
];

const board: Record<BoardColumn, BoardCard[]> = {
  backlog: [
    {
      title: 'B-04 Wire dashboard shell to real API data',
      description: 'Replace dashboard placeholders with live local usage, key, and overview data once core data paths are stable.',
      area: 'dashboard',
      priority: 'P2',
      source: 'docs/PROJECT_SURFACE.md'
    },
    {
      title: 'B-05 Build internal operations surface beyond basic status',
      description: 'Expand 3014 into the long-term operator console with ingestion, customer, platform, and billing visibility in one place.',
      area: 'admin',
      priority: 'P2',
      source: 'docs/PROJECT_SURFACE.md'
    },
    {
      title: 'B-06 Stripe billing skeleton expansion',
      description: 'Complete checkout/session flow, webhook event storage hardening, and subscription state sync in dev mode.',
      area: 'billing',
      priority: 'P2',
      source: 'docs/PROJECT_SURFACE.md'
    },
    {
      title: 'B-07 Auth implementation after direction doc',
      description: 'Move from auth direction to a realistic local auth path for protected surfaces when the MVP timing makes sense.',
      area: 'auth',
      priority: 'P2',
      source: 'docs/PROJECT_SURFACE.md'
    },
    {
      title: 'B-08 Denmark source intake and connector planning',
      description: 'Do legal/source validation, connector planning, and normalization mapping for Denmark as the next geography step.',
      area: 'data',
      priority: 'P2',
      source: 'docs/PROJECT_SURFACE.md'
    },
    {
      title: 'Lightweight planning persistence for internal control surface',
      description: 'If planning remains useful inside 3014, add simple storage and editing rather than keeping it as hand-seeded data only.',
      area: 'project',
      priority: 'P2',
      owner: 'Internal',
      notes: 'Planning stays visible, but it is now secondary to platform control.'
    }
  ],
  'in-progress': [
    {
      title: 'IP-01 Public site cleanup and cohesion pass',
      description: 'Tighten structure, copy, CTA hierarchy, and docs/demo flow so the public surface reads as one coherent product surface.',
      area: 'public',
      priority: 'P1',
      owner: 'Internal',
      source: 'docs/PROJECT_SURFACE.md'
    },
    {
      title: 'IP-02 Norway live ingest to DB and search visibility',
      description: 'Keep reducing Norway-only ingest debt while making live ingested data reliably visible through API search.',
      area: 'data',
      priority: 'P1',
      source: 'docs/PROJECT_SURFACE.md'
    },
    {
      title: 'B-01 Shared country-ingest framework',
      description: 'Generalize source definitions, ingestion bookkeeping, contract validation, and DB ingest beyond Norway-specific code.',
      area: 'data',
      priority: 'P1',
      notes: 'Core platform work. More important than adding surface polish elsewhere.',
      source: 'docs/PROJECT_SURFACE.md'
    },
    {
      title: 'B-02 Search quality pass',
      description: 'Improve ranking, exact registration lookup, and result depth now that live rows are flowing into the MVP.',
      area: 'api',
      priority: 'P1',
      source: 'docs/PROJECT_SURFACE.md'
    }
  ],
  review: [
    {
      title: 'R-01 UK live authenticated sample test',
      description: 'Run one successful raw and normalized Companies House sample as soon as a real API key is available.',
      area: 'data',
      priority: 'P1',
      blockers: 'Needs a real COMPANIES_HOUSE_API_KEY.',
      source: 'docs/PROJECT_SURFACE.md'
    },
    {
      title: 'R-02 API key + usage groundwork verification',
      description: 'Confirm middleware coverage, usage writes, and the default DB-backed flow before relying on it more widely.',
      area: 'api',
      priority: 'P1',
      source: 'docs/PROJECT_SURFACE.md'
    },
    {
      title: 'R-03 Dashboard shell review',
      description: 'Decide whether the customer dashboard shell is ready for data hookup instead of more layout work.',
      area: 'dashboard',
      priority: 'P2',
      source: 'docs/PROJECT_SURFACE.md'
    },
    {
      title: 'R-04 Internal control surface review',
      description: 'Confirm 3014 is now the canonical internal destination and keep operator workflows centered here instead of split across legacy admin/project shells.',
      area: 'admin',
      priority: 'P2',
      source: 'docs/PROJECT_SURFACE.md'
    }
  ],
  deployed: [
    {
      title: 'D-01 Local API MVP surface',
      description: 'Health, country metadata, and company search endpoints are running locally and verified.',
      area: 'api',
      priority: 'P1',
      source: 'docs/PROJECT_SURFACE.md'
    },
    {
      title: 'D-02 Public docs/demo site',
      description: 'Static landing/docs/demo surface is live locally with a safer product-style playground experience.',
      area: 'public',
      priority: 'P1',
      source: 'docs/PROJECT_SURFACE.md'
    },
    {
      title: 'D-03 Admin status endpoint and static admin page',
      description: 'Operator status route and basic internal admin surface exist locally for health/status visibility.',
      area: 'admin',
      priority: 'P2',
      source: 'docs/PROJECT_SURFACE.md'
    },
    {
      title: 'D-04 Billing scaffold endpoints',
      description: 'Plans endpoint and Stripe webhook scaffold exist locally without live secrets or external writes.',
      area: 'billing',
      priority: 'P2',
      source: 'docs/PROJECT_SURFACE.md'
    }
  ],
  done: [
    {
      title: 'DN-01 MVP direction chosen',
      description: 'Norway is first, UK second, Denmark later, Finland later.',
      area: 'project',
      priority: 'P1',
      source: 'docs/PROJECT_SURFACE.md'
    },
    {
      title: 'DN-04 Norway DB ingest path implemented',
      description: 'The ingest-db flow upserts core company, address, activity, and source records with a validated sample.',
      area: 'data',
      priority: 'P1',
      source: 'docs/PROJECT_SURFACE.md'
    },
    {
      title: 'DN-06 API key and usage groundwork added',
      description: 'DB-backed key validation and usage counters/events groundwork exists with seeded local demo data.',
      area: 'api',
      priority: 'P1',
      source: 'docs/PROJECT_SURFACE.md'
    },
    {
      title: 'DN-07 Dashboard shell scaffolded',
      description: 'The signed-in customer shell exists and is ready for follow-up integration work.',
      area: 'dashboard',
      priority: 'P2',
      source: 'docs/PROJECT_SURFACE.md'
    },
    {
      title: 'DN-09 UK live test path documented',
      description: 'Runbook plus helper tooling are in place; the remaining blocker is credential supply, not board ambiguity.',
      area: 'data',
      priority: 'P1',
      source: 'docs/PROJECT_SURFACE.md'
    }
  ]
};

const areaLabels: Record<CardArea, string> = {
  public: 'Public',
  dashboard: 'Dashboard',
  admin: 'Internal',
  api: 'API',
  data: 'Data',
  auth: 'Auth',
  billing: 'Billing',
  project: 'Planning'
};

const areaClassName: Record<CardArea, string> = {
  public: 'public',
  dashboard: 'dashboard',
  admin: 'admin',
  api: 'api',
  data: 'data',
  auth: 'auth',
  billing: 'billing',
  project: 'project'
};

const priorityTone: Record<CardPriority, string> = {
  P0: 'critical',
  P1: 'important',
  P2: 'normal'
};

const controlMetrics: ControlMetric[] = [
  {
    label: 'Internal port',
    value: '3014',
    note: 'Canonical internal admin/backend/control surface.',
    tone: 'healthy'
  },
  {
    label: 'Legacy admin port',
    value: '3013',
    note: 'Deprecated. Keep references moving toward 3014.',
    tone: 'watch'
  },
  {
    label: 'Top platform pressure',
    value: 'Data ingest + search quality',
    note: 'Core reliability still matters more than extra UI polish.',
    tone: 'risk'
  },
  {
    label: 'Customer/admin split',
    value: 'Kept clean',
    note: '3012 stays customer self-service; 3014 stays internal only.',
    tone: 'healthy'
  }
];

const workQueues: WorkQueueItem[] = [
  {
    title: 'Review auth + usage groundwork before widening access',
    note: 'Protect admin and dashboard expansion behind realistic local auth and reliable usage accounting.',
    tone: 'watch'
  },
  {
    title: 'Unify source health, ingestion, and platform status in one operator flow',
    note: 'This is the main reason 3014 should exist as a long-term internal surface.',
    tone: 'healthy'
  },
  {
    title: 'Do not let planning swallow the product',
    note: 'Keep execution visibility, but subordinate it to operating the platform.',
    tone: 'risk'
  }
];

const customerOps: DomainCard[] = [
  {
    title: 'Customers and access posture',
    owner: 'Internal ops',
    summary: 'Account state, plan posture, API key footprint, and support context should be reachable from one internal view.',
    status: 'Ready for deeper detail routes later',
    tone: 'healthy',
    bullets: ['Customer list + status belongs here, not in the dashboard.', 'Billing and key posture should roll up without turning 3012 into an admin clone.', 'Keep room for customer detail drill-downs once auth and billing are more real.']
  },
  {
    title: 'Billing control and mismatch review',
    owner: 'Internal ops',
    summary: 'Operators need subscription, plan, and webhook state visibility without mixing it into marketing or customer self-service copy.',
    status: 'Scaffold present, operational follow-through pending',
    tone: 'watch',
    bullets: ['Track checkout/webhook state and customer mismatches.', 'Prefer issue-first summaries over a generic Stripe settings page.', 'Use 3014 as the place to inspect account-level billing problems.']
  }
];

const platformOps: DomainCard[] = [
  {
    title: 'Sources and ingestion control',
    owner: 'Data platform',
    summary: 'Source registry health, latest sync posture, ingest failures, and run summaries should form the center of the internal surface.',
    status: 'Important next operator domain',
    tone: 'risk',
    bullets: ['Show source freshness, latest run outcome, and current blockers.', 'Link failures to the runbook-style next actions operators actually need.', 'This domain should be denser than the customer dashboard by design.']
  },
  {
    title: 'System, database, and platform visibility',
    owner: 'Platform',
    summary: 'Service health, database shape, usage posture, and alert summaries belong in 3014 as one operations console.',
    status: 'Foundational surface direction confirmed',
    tone: 'healthy',
    bullets: ['Keep overview summary-light and actionable.', 'Push dense diagnostics into dedicated internal sections.', 'Avoid public/demo language anywhere in this flow.']
  }
];

const controlViews: Array<{ id: ControlView; label: string; hint: string }> = [
  { id: 'overview', label: 'Overview', hint: 'What needs attention now' },
  { id: 'operations', label: 'Operations', hint: 'Runs, sources, alerts' },
  { id: 'customers', label: 'Customers & billing', hint: 'Accounts, plans, keys' },
  { id: 'platform', label: 'Platform', hint: 'API, DB, status' },
  { id: 'planning', label: 'Planning', hint: 'Roadmap visibility, not the center' }
];

const roleRules = [
  { title: 'Public · 3010', note: 'Prospect-facing product story, pricing, docs entry, and safe demo.' },
  { title: 'Dashboard · 3012', note: 'Signed-in customer self-service: keys, usage, billing, settings.' },
  { title: 'Internal control · 3014', note: 'Canonical operator/admin/backend surface for customers, ingestion, billing, and platform health.' },
  { title: 'Legacy admin · 3013', note: 'Deprecated intermediate state. Do not treat it as the long-term destination.' }
];

const intakeSources = ['docs/INTERNAL_SURFACE_MIGRATION.md', 'docs/ROLE_CLEANUP_PLAN.md', 'docs/PROJECT_SURFACE.md', 'verified local MVP progress'];

export default function App() {
  const [activeView, setActiveView] = useState<ControlView>('overview');

  const totalCards = useMemo(() => Object.values(board).reduce((sum, cards) => sum + cards.length, 0), []);
  const activeCards = board['in-progress'].length + board.review.length;
  const shippedCards = board.deployed.length + board.done.length;
  const controlAttentionCount = board.review.length + board.backlog.filter((card) => card.area === 'admin' || card.area === 'billing').length;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-section">
          <div className="brand-row">
            <div>
              <div className="brand">Company Data</div>
              <p className="brand-subtitle">Internal admin/backend/control surface on 3014, with planning retained as a secondary internal layer.</p>
            </div>
            <span className="surface-badge">Internal only</span>
          </div>
        </div>

        <div className="sidebar-section workspace-card">
          <div className="eyebrow">Surface direction</div>
          <strong>3014 is the canonical internal console</strong>
          <p>Use this surface to operate the platform first: customers, billing posture, ingestion, source health, and system visibility. Planning still lives here, but it no longer defines the whole app.</p>
        </div>

        <section className="sidebar-section">
          <div className="eyebrow">Internal views</div>
          <div className="surface-list nav-list">
            {controlViews.map((view) => (
              <button
                key={view.id}
                type="button"
                className={`surface-link nav-card ${activeView === view.id ? 'active' : ''}`}
                onClick={() => setActiveView(view.id)}
              >
                <strong>{view.label}</strong>
                <p>{view.hint}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="sidebar-section">
          <div className="eyebrow">Role boundaries</div>
          <div className="surface-list role-list">
            {roleRules.map((rule) => (
              <div key={rule.title} className="surface-link role-card">
                <strong>{rule.title}</strong>
                <p>{rule.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="sidebar-section">
          <div className="eyebrow">Source inputs</div>
          <div className="surface-list">
            {intakeSources.map((source) => (
              <div key={source} className="surface-link source-card">
                <strong>{source}</strong>
              </div>
            ))}
          </div>
        </section>

        <div className="sidebar-footer card subtle">
          <div className="eyebrow">Rule</div>
          <strong>Operate first, plan second.</strong>
          <p>Keep customer self-service on 3012, public narrative on 3010, and use 3014 for internal platform control with pragmatic planning visibility.</p>
        </div>
      </aside>

      <main className="content">
        <header className="topbar card hero-card">
          <div>
            <div className="eyebrow">Internal control surface</div>
            <h1>Platform operations, with planning attached</h1>
            <p className="section-intro">
              This app now frames 3014 as the long-term internal destination. Overview and operator domains come first; delivery planning remains visible, but it no longer acts like the whole product.
            </p>
          </div>
          <div className="hero-badges">
            <span>{totalCards} planning cards</span>
            <span>{controlAttentionCount} internal control items</span>
            <span>{activeCards} active / review</span>
            <span>{shippedCards} shipped / done</span>
          </div>
        </header>

        <section className="stats-grid">
          {controlMetrics.map((metric) => (
            <article key={metric.label} className={`card stat-card tone-${metric.tone}`}>
              <div className="eyebrow">{metric.label}</div>
              <strong>{metric.value}</strong>
              <p>{metric.note}</p>
            </article>
          ))}
        </section>

        <section className="tab-panel card">
          <div className="panel-header">
            <div>
              <div className="eyebrow">Current view</div>
              <h2>{controlViews.find((view) => view.id === activeView)?.label}</h2>
            </div>
            <span className="pill">{controlViews.find((view) => view.id === activeView)?.hint}</span>
          </div>

          {activeView === 'overview' ? (
            <div className="panel-stack">
              <section className="queue-grid">
                {workQueues.map((item) => (
                  <article key={item.title} className={`card queue-card tone-${item.tone}`}>
                    <div className="eyebrow">Attention</div>
                    <h3>{item.title}</h3>
                    <p>{item.note}</p>
                  </article>
                ))}
              </section>

              <section className="domain-grid">
                {[...customerOps, ...platformOps].map((domain) => (
                  <article key={domain.title} className={`card domain-card tone-${domain.tone}`}>
                    <div className="task-topline">
                      <span className={`priority-badge ${domain.tone === 'risk' ? 'critical' : domain.tone === 'watch' ? 'important' : 'normal'}`}>{domain.status}</span>
                      <span className="area-badge admin">Internal</span>
                    </div>
                    <h3>{domain.title}</h3>
                    <p>{domain.summary}</p>
                    <div className="meta-row">
                      <span>Owner: {domain.owner}</span>
                    </div>
                    <ul className="bullet-list">
                      {domain.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </section>
            </div>
          ) : null}

          {activeView === 'operations' ? (
            <div className="panel-stack">
              <section className="domain-grid two-up">
                {platformOps.map((domain) => (
                  <article key={domain.title} className={`card domain-card tone-${domain.tone}`}>
                    <div className="eyebrow">Operator domain</div>
                    <h3>{domain.title}</h3>
                    <p>{domain.summary}</p>
                    <div className="status-line">{domain.status}</div>
                    <ul className="bullet-list">
                      {domain.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </section>
            </div>
          ) : null}

          {activeView === 'customers' ? (
            <div className="panel-stack">
              <section className="domain-grid two-up">
                {customerOps.map((domain) => (
                  <article key={domain.title} className={`card domain-card tone-${domain.tone}`}>
                    <div className="eyebrow">Operator domain</div>
                    <h3>{domain.title}</h3>
                    <p>{domain.summary}</p>
                    <div className="status-line">{domain.status}</div>
                    <ul className="bullet-list">
                      {domain.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </section>
            </div>
          ) : null}

          {activeView === 'platform' ? (
            <div className="panel-stack">
              <section className="queue-grid compact-grid">
                {controlMetrics.map((metric) => (
                  <article key={metric.label} className={`card queue-card tone-${metric.tone}`}>
                    <div className="eyebrow">Platform signal</div>
                    <h3>{metric.value}</h3>
                    <p>{metric.label}</p>
                    <div className="status-line">{metric.note}</div>
                  </article>
                ))}
              </section>
            </div>
          ) : null}

          {activeView === 'planning' ? (
            <div className="panel-stack">
              <div className="planning-note card subtle">
                <div className="eyebrow">Planning visibility</div>
                <strong>Still useful, no longer the center of gravity.</strong>
                <p>Keep roadmap and delivery status accessible for internal coordination, but use the rest of this app to operate the real platform.</p>
              </div>

              <section className="board-grid" aria-label="Planning board">
                {columns.map((column) => (
                  <article key={column.id} className="board-column card">
                    <div className="column-header">
                      <div>
                        <div className="eyebrow">{column.label}</div>
                        <h2>{board[column.id].length} items</h2>
                      </div>
                      <span className="pill">{column.hint}</span>
                    </div>

                    <div className="column-stack">
                      {board[column.id].map((card) => (
                        <section key={`${column.id}-${card.title}`} className="task-card">
                          <div className="task-topline">
                            <span className={`priority-badge ${priorityTone[card.priority]}`}>{card.priority}</span>
                            <span className={`area-badge ${areaClassName[card.area]}`}>{areaLabels[card.area]}</span>
                          </div>
                          <h3>{card.title}</h3>
                          <p>{card.description}</p>
                          <dl className="meta-list">
                            <div>
                              <dt>Priority</dt>
                              <dd>{card.priority}</dd>
                            </div>
                            <div>
                              <dt>Area</dt>
                              <dd>{areaLabels[card.area]}</dd>
                            </div>
                            {card.owner ? (
                              <div>
                                <dt>Owner</dt>
                                <dd>{card.owner}</dd>
                              </div>
                            ) : null}
                            {card.blockers ? (
                              <div>
                                <dt>Blocker</dt>
                                <dd>{card.blockers}</dd>
                              </div>
                            ) : null}
                          </dl>
                          {card.notes ? <div className="task-note">{card.notes}</div> : null}
                          {card.source ? <div className="task-source">Source: {card.source}</div> : null}
                        </section>
                      ))}
                    </div>
                  </article>
                ))}
              </section>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
