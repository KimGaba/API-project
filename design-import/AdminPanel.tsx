import React, { useState } from 'react';
import './_admin-panel.css';
import { 
  Users, CreditCard, Activity, Database, Server, FileText, 
  Settings, Search, Plus, MoreVertical, CheckCircle2, 
  XCircle, AlertCircle, RefreshCw, ChevronRight, BarChart3,
  Terminal
} from 'lucide-react';

const USERS_DATA = [
  { id: 'u_1', name: 'Lars Thomsen', company: 'Nordic Shipping A/S', email: 'lars@nordicshipping.dk', plan: 'Enterprise', calls: '2.4M', status: 'Active', joined: '2023-01-12' },
  { id: 'u_2', name: 'Sofia Lindberg', company: 'Svenska Tech AB', email: 'sofia.l@svenskatech.se', plan: 'Growth', calls: '845K', status: 'Active', joined: '2023-03-24' },
  { id: 'u_3', name: 'Jan de Vries', company: 'Tulip Logistics', email: 'jan@tuliplogistics.nl', plan: 'Enterprise', calls: '1.2M', status: 'Active', joined: '2022-11-05' },
  { id: 'u_4', name: 'Klaus Müller', company: 'Berlin Finance GmbH', email: 'k.mueller@berlinfinance.de', plan: 'Free', calls: '9,500', status: 'Active', joined: '2024-02-18' },
  { id: 'u_5', name: 'Emma Nielsen', company: 'Copenhagen Retail', email: 'emma@cphretail.dk', plan: 'Growth', calls: '420K', status: 'Warning', joined: '2023-08-30' },
  { id: 'u_6', name: 'Johan Eriksson', company: 'Stockholm AI', email: 'johan@sthlmai.se', plan: 'Enterprise', calls: '5.1M', status: 'Active', joined: '2021-06-14' },
  { id: 'u_7', name: 'Maaike Jansen', company: 'Dutch Data Co', email: 'm.jansen@dutchdata.nl', plan: 'Free', calls: '12K', status: 'Suspended', joined: '2024-01-02' },
  { id: 'u_8', name: 'Lukas Schmidt', company: 'Munich Analytics', email: 'lukas@munichanalytics.de', plan: 'Growth', calls: '650K', status: 'Active', joined: '2023-09-11' },
];

const TRANSACTIONS = [
  { id: 'tx_1', user: 'Nordic Shipping A/S', plan: 'Enterprise', amount: '€2,400', date: '2024-05-01', status: 'Paid' },
  { id: 'tx_2', user: 'Svenska Tech AB', plan: 'Growth', amount: '€499', date: '2024-05-01', status: 'Paid' },
  { id: 'tx_3', user: 'Tulip Logistics', plan: 'Enterprise', amount: '€1,800', date: '2024-04-28', status: 'Paid' },
  { id: 'tx_4', user: 'Copenhagen Retail', plan: 'Growth', amount: '€499', date: '2024-04-25', status: 'Failed' },
  { id: 'tx_5', user: 'Stockholm AI', plan: 'Enterprise', amount: '€4,200', date: '2024-04-22', status: 'Paid' },
];

const SOURCES = [
  { id: 'src_1', name: 'CVR', country: 'Denmark', status: 'Active', updated: '2 mins ago', records: '924K' },
  { id: 'src_2', name: 'Bolagsverket', country: 'Sweden', status: 'Active', updated: '15 mins ago', records: '1.2M' },
  { id: 'src_3', name: 'KVK', country: 'Netherlands', status: 'Syncing', updated: 'Syncing (45%)', records: '2.1M' },
  { id: 'src_4', name: 'Handelsregister', country: 'Germany', status: 'Error', updated: '4 hours ago', records: '3.8M' },
  { id: 'src_5', name: 'Companies House', country: 'UK', status: 'Active', updated: '1 min ago', records: '5.2M' },
];

const INGESTION_RUNS = [
  { id: 'run_1', source: 'KVK (NL)', started: '10:15 AM', duration: 'In Progress', records: '145,000', status: 'Syncing' },
  { id: 'run_2', source: 'CVR (DK)', started: '09:00 AM', duration: '14m 22s', records: '12,450', status: 'Completed' },
  { id: 'run_3', source: 'Companies House (UK)', started: '08:30 AM', duration: '45m 10s', records: '84,200', status: 'Completed' },
  { id: 'run_4', source: 'Handelsregister (DE)', started: '06:00 AM', duration: '2m 14s', records: '0', status: 'Failed' },
];

const LOGS = [
  { id: 'log_1', time: '10:45:21', level: 'ERROR', service: 'ingestion-worker-de', message: 'Connection timeout to Handelsregister API (retry 3/3)' },
  { id: 'log_2', time: '10:42:15', level: 'WARN', service: 'api-gateway', message: 'Rate limit exceeded for user u_5 (Copenhagen Retail)' },
  { id: 'log_3', time: '10:30:00', level: 'INFO', service: 'billing-cron', message: 'Successfully generated 142 invoices for May 2024' },
  { id: 'log_4', time: '10:15:02', level: 'INFO', service: 'ingestion-coordinator', message: 'Started full sync for KVK (Netherlands)' },
  { id: 'log_5', time: '09:55:12', level: 'ERROR', service: 'db-cluster-primary', message: 'Slow query detected (>5000ms) on index idx_companies_name' },
];

const NavItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
    active ? 'bg-[var(--admin-border)] text-white font-medium' : 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-border)] hover:text-white'
  }`}>
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

const Card = ({ children, className = '', title, action }: { children: React.ReactNode, className?: string, title?: string, action?: React.ReactNode }) => (
  <div className={`bg-[var(--admin-panel)] border border-[var(--admin-border)] rounded-lg overflow-hidden flex flex-col ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--admin-border)]">
        <h3 className="font-semibold text-sm text-white">{title}</h3>
        {action}
      </div>
    )}
    <div className="flex-1 overflow-auto custom-scrollbar">
      {children}
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  let color = 'text-[var(--admin-text-muted)] border-[var(--admin-border)]';
  if (status === 'Active' || status === 'Paid' || status === 'Completed') color = 'text-[var(--admin-success)] border-[var(--admin-success)] bg-[var(--admin-success)] bg-opacity-10';
  if (status === 'Warning' || status === 'Syncing' || status === 'In Progress') color = 'text-[var(--admin-warning)] border-[var(--admin-warning)] bg-[var(--admin-warning)] bg-opacity-10';
  if (status === 'Suspended' || status === 'Failed' || status === 'Error') color = 'text-[var(--admin-danger)] border-[var(--admin-danger)] bg-[var(--admin-danger)] bg-opacity-10';
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
      {status}
    </span>
  );
};

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="nordic-admin flex h-screen overflow-hidden text-sm">
      {/* Sidebar */}
      <div className="w-64 border-r border-[var(--admin-border)] bg-[var(--admin-bg)] flex flex-col">
        <div className="p-4 border-b border-[var(--admin-border)] flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[var(--admin-accent)] flex items-center justify-center">
            <Database className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">CompanyData Ops</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          <div className="text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-2 mt-4 px-3">Dashboards</div>
          <NavItem icon={Activity} label="Overview" active={activeTab === 'Overview'} />
          <NavItem icon={Users} label="Customers & API" />
          <NavItem icon={CreditCard} label="Billing & MRR" />
          
          <div className="text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-2 mt-6 px-3">Infrastructure</div>
          <NavItem icon={Database} label="Data Sources" />
          <NavItem icon={RefreshCw} label="Ingestion Runs" />
          <NavItem icon={Server} label="System Health" />
          <NavItem icon={Terminal} label="Live Logs" />
          
          <div className="text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-2 mt-6 px-3">Settings</div>
          <NavItem icon={Settings} label="Platform Config" />
        </div>
        
        <div className="p-4 border-t border-[var(--admin-border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--admin-border)] flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">Admin User</div>
              <div className="text-xs text-[var(--admin-text-muted)] truncate">System Operator</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[var(--admin-bg)]">
        {/* Header */}
        <header className="h-14 border-b border-[var(--admin-border)] flex items-center justify-between px-6 bg-[var(--admin-bg)] shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--admin-text-muted)]">Dashboards</span>
            <ChevronRight className="w-4 h-4 text-[var(--admin-text-muted)]" />
            <span className="font-medium text-white">Mission Control</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)] border border-[var(--admin-border)] rounded px-2 py-1 bg-[var(--admin-panel)]">
              <span className="w-2 h-2 rounded-full bg-[var(--admin-success)]"></span>
              All Systems Operational
            </div>
            <span className="text-xs text-[var(--admin-text-muted)] mono">UTC: 10:48:22</span>
          </div>
        </header>

        {/* Dashboard Grid */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">
            
            {/* Top KPIs */}
            <div className="col-span-12 grid grid-cols-4 gap-6">
              <Card className="p-4">
                <div className="text-[var(--admin-text-muted)] text-xs font-medium mb-1">Total MRR</div>
                <div className="text-2xl font-bold text-white mono">€142,500</div>
                <div className="text-xs text-[var(--admin-success)] mt-2 flex items-center gap-1">+4.2% from last month</div>
              </Card>
              <Card className="p-4">
                <div className="text-[var(--admin-text-muted)] text-xs font-medium mb-1">API Calls (30d)</div>
                <div className="text-2xl font-bold text-white mono">148.2M</div>
                <div className="text-xs text-[var(--admin-success)] mt-2 flex items-center gap-1">+12.5% from last month</div>
              </Card>
              <Card className="p-4">
                <div className="text-[var(--admin-text-muted)] text-xs font-medium mb-1">Active Customers</div>
                <div className="text-2xl font-bold text-white mono">1,204</div>
                <div className="text-xs text-[var(--admin-success)] mt-2 flex items-center gap-1">+18 new this week</div>
              </Card>
              <Card className="p-4">
                <div className="text-[var(--admin-text-muted)] text-xs font-medium mb-1">Total Records</div>
                <div className="text-2xl font-bold text-white mono">13.2M</div>
                <div className="text-xs text-[var(--admin-text-muted)] mt-2 flex items-center gap-1">Across 5 registries</div>
              </Card>
            </div>

            {/* Customers Table */}
            <Card className="col-span-12" title="Customer Overview" action={
              <button className="flex items-center gap-2 bg-[var(--admin-border)] hover:bg-[var(--admin-text-muted)] hover:text-white transition-colors text-xs px-3 py-1.5 rounded text-white">
                <Plus className="w-3 h-3" /> New Customer
              </button>
            }>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--admin-border)] text-xs text-[var(--admin-text-muted)] uppercase tracking-wider">
                    <th className="px-4 py-3 font-medium">Customer / Company</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">API Calls (30d)</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--admin-border)]">
                  {USERS_DATA.map(user => (
                    <tr key={user.id} className="hover:bg-[var(--admin-table-hover)] group">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{user.company}</div>
                        <div className="text-xs text-[var(--admin-text-muted)]">{user.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs border border-[var(--admin-border)] rounded px-2 py-0.5 bg-[var(--admin-bg)] text-[var(--admin-text)]">
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 mono text-xs">{user.calls}</td>
                      <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                      <td className="px-4 py-3 text-xs text-[var(--admin-text-muted)] mono">{user.joined}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-[var(--admin-text-muted)] hover:text-white p-1">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* Ingestion & Sources */}
            <div className="col-span-7 flex flex-col gap-6">
              <Card title="Data Sources & Integrations">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--admin-border)] text-xs text-[var(--admin-text-muted)] uppercase tracking-wider">
                      <th className="px-4 py-3 font-medium">Registry</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Last Updated</th>
                      <th className="px-4 py-3 font-medium">Records</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--admin-border)]">
                    {SOURCES.map(src => (
                      <tr key={src.id} className="hover:bg-[var(--admin-table-hover)]">
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">{src.name}</div>
                          <div className="text-xs text-[var(--admin-text-muted)]">{src.country}</div>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={src.status} /></td>
                        <td className="px-4 py-3 text-xs text-[var(--admin-text-muted)] mono">{src.updated}</td>
                        <td className="px-4 py-3 text-xs mono">{src.records}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <Card title="Recent Ingestion Runs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--admin-border)] text-xs text-[var(--admin-text-muted)] uppercase tracking-wider">
                      <th className="px-4 py-3 font-medium">Source</th>
                      <th className="px-4 py-3 font-medium">Started</th>
                      <th className="px-4 py-3 font-medium">Duration</th>
                      <th className="px-4 py-3 font-medium">Records</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--admin-border)]">
                    {INGESTION_RUNS.map(run => (
                      <tr key={run.id} className="hover:bg-[var(--admin-table-hover)]">
                        <td className="px-4 py-3 text-sm text-white">{run.source}</td>
                        <td className="px-4 py-3 text-xs text-[var(--admin-text-muted)] mono">{run.started}</td>
                        <td className="px-4 py-3 text-xs mono">{run.duration}</td>
                        <td className="px-4 py-3 text-xs mono">{run.records}</td>
                        <td className="px-4 py-3"><StatusBadge status={run.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>

            {/* System Status & Logs & Billing */}
            <div className="col-span-5 flex flex-col gap-6">
              <Card title="System Health">
                <div className="p-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--admin-text)]">API Gateway</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs mono text-[var(--admin-text-muted)]">p95: 42ms</span>
                      <CheckCircle2 className="w-4 h-4 text-[var(--admin-success)]" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--admin-text)]">Database (Primary)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs mono text-[var(--admin-text-muted)]">load: 45%</span>
                      <CheckCircle2 className="w-4 h-4 text-[var(--admin-success)]" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--admin-text)]">Ingestion Workers</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs mono text-[var(--admin-warning)]">queue: 1.2k</span>
                      <AlertCircle className="w-4 h-4 text-[var(--admin-warning)]" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--admin-text)]">Handelsregister API</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs mono text-[var(--admin-danger)]">timeout</span>
                      <XCircle className="w-4 h-4 text-[var(--admin-danger)]" />
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Live Logs" action={<Terminal className="w-4 h-4 text-[var(--admin-text-muted)]" />}>
                <div className="p-0">
                  {LOGS.map(log => (
                    <div key={log.id} className="px-4 py-2 text-xs border-b border-[var(--admin-border)] last:border-0 hover:bg-[var(--admin-table-hover)] flex gap-3 font-mono">
                      <span className="text-[var(--admin-text-muted)] shrink-0">{log.time}</span>
                      <span className={`shrink-0 w-12 ${
                        log.level === 'ERROR' ? 'text-[var(--admin-danger)]' :
                        log.level === 'WARN' ? 'text-[var(--admin-warning)]' :
                        'text-[var(--admin-accent)]'
                      }`}>{log.level}</span>
                      <span className="text-[var(--admin-text)] truncate" title={log.message}>
                        <span className="text-[var(--admin-text-muted)] mr-2">[{log.service}]</span>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
              
              <Card title="Recent Transactions">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-[var(--admin-border)]">
                    {TRANSACTIONS.slice(0, 4).map(tx => (
                      <tr key={tx.id} className="hover:bg-[var(--admin-table-hover)]">
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-white text-xs">{tx.user}</div>
                          <div className="text-[10px] text-[var(--admin-text-muted)]">{tx.plan}</div>
                        </td>
                        <td className="px-4 py-2.5 text-xs mono text-right">{tx.amount}</td>
                        <td className="px-4 py-2.5 text-right"><StatusBadge status={tx.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
