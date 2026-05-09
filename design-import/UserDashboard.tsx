import React, { useState } from "react";
import { 
  LayoutDashboard, Key, BarChart3, CreditCard, Search, Settings, 
  Copy, Trash2, Plus, Bell, User, LogOut, Activity, Database, Check,
  ChevronRight, Building2, MapPin, Briefcase, Download, ArrowUpRight, CheckCircle2
} from "lucide-react";

export function UserDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] text-[#1a1c23] font-sans antialiased overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        
        .nordic-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .nordic-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .nordic-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e2e4e9;
          border-radius: 10px;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
      `}} />

      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-white border-r border-[#e9ebf0] z-10 shrink-0">
        <div className="p-6 pb-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0f172a] flex items-center justify-center text-white font-bold text-sm">
            CD
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-[#0f172a]">CompanyData</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto nordic-scrollbar">
          <NavItem icon={LayoutDashboard} label="Overview" isActive={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <NavItem icon={Key} label="API Keys" isActive={activeTab === "keys"} onClick={() => setActiveTab("keys")} />
          <NavItem icon={BarChart3} label="Usage" isActive={activeTab === "usage"} onClick={() => setActiveTab("usage")} />
          <NavItem icon={Search} label="Playground" isActive={activeTab === "playground"} onClick={() => setActiveTab("playground")} />
          <NavItem icon={CreditCard} label="Billing" isActive={activeTab === "billing"} onClick={() => setActiveTab("billing")} />
          <div className="pt-4 mt-4 border-t border-[#f0f2f5]">
            <NavItem icon={Settings} label="Settings" isActive={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
          </div>
        </nav>

        <div className="p-4 border-t border-[#e9ebf0]">
          <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#f8f9fa] transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-[#f1f3f5] flex items-center justify-center text-[#4b5563] font-medium text-sm">
              LE
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#111827] truncate">Lars Eriksen</p>
              <p className="text-xs text-[#6b7280] truncate">BuildCo ApS</p>
            </div>
            <LogOut className="w-4 h-4 text-[#9ca3af]" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#fbfbfa] relative">
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#eef2f6] to-transparent opacity-50 pointer-events-none" />
        
        <header className="h-16 flex items-center px-8 shrink-0 z-10">
          <h1 className="text-xl font-semibold text-[#111827] capitalize">
            {activeTab === 'keys' ? 'API Keys' : activeTab}
          </h1>
          <div className="ml-auto flex items-center gap-4">
            <button className="text-[#6b7280] hover:text-[#111827] transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-5 w-px bg-[#e5e7eb]"></div>
            <span className="text-sm font-medium text-[#4b5563] bg-white px-3 py-1.5 rounded-full border border-[#e5e7eb] shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
              API Operational
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 pb-12 z-10 nordic-scrollbar">
          <div className="max-w-5xl mx-auto mt-6">
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "keys" && <ApiKeysTab />}
            {activeTab === "usage" && <UsageTab />}
            {activeTab === "playground" && <PlaygroundTab />}
            {activeTab === "billing" && <BillingTab />}
            {activeTab === "settings" && <SettingsTab />}
          </div>
        </div>
      </main>
    </div>
  );
}

// -- Components --

function NavItem({ icon: Icon, label, isActive, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
        isActive 
          ? "bg-[#0f172a] text-white shadow-sm" 
          : "text-[#4b5563] hover:bg-[#f1f3f5] hover:text-[#111827]"
      }`}
    >
      <Icon className={`w-4 h-4 ${isActive ? "text-[#94a3b8]" : "text-[#6b7280]"}`} />
      {label}
    </button>
  );
}

// -- Tabs --

function OverviewTab() {
  const recentSearches = [
    { id: 1, name: "Novo Nordisk A/S", country: "DK", time: "10 mins ago", status: "Success" },
    { id: 2, name: "Spotify AB", country: "SE", time: "1 hour ago", status: "Success" },
    { id: 3, name: "Klarna Bank AB", country: "SE", time: "3 hours ago", status: "Success" },
    { id: 4, name: "Zalando SE", country: "DE", time: "Yesterday", status: "Success" },
    { id: 5, name: "Maersk Line A/S", country: "DK", time: "Yesterday", status: "Success" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#e5e7eb] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-[#6b7280]">API Usage</h3>
            <Activity className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-[#111827]">42,501</span>
            <span className="text-sm text-[#6b7280]">/ 100k calls</span>
          </div>
          <div className="mt-4 h-2 bg-[#f1f3f5] rounded-full overflow-hidden">
            <div className="h-full bg-[#3b82f6] rounded-full" style={{ width: '42.5%' }}></div>
          </div>
          <p className="mt-3 text-xs text-[#6b7280]">Resets in 12 days</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#e5e7eb] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-[#6b7280]">Current Plan</h3>
            <span className="inline-flex items-center rounded-full bg-[#eff6ff] px-2 py-1 text-xs font-medium text-[#2563eb] ring-1 ring-inset ring-[#bfdbfe]">
              Growth Tier
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-[#111827]">€299</span>
            <span className="text-sm text-[#6b7280]">/ month</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-[#10b981]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Active and in good standing</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#e5e7eb] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-[#6b7280]">Database Updates</h3>
            <Database className="w-4 h-4 text-[#8b5cf6]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-[#111827]">14.2M</span>
            <span className="text-sm text-[#6b7280]">companies</span>
          </div>
          <p className="mt-4 text-sm text-[#4b5563]">Nordic region synced 2 hours ago.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#e5e7eb] flex justify-between items-center">
          <h3 className="text-base font-semibold text-[#111827]">Recent Activity</h3>
          <button className="text-sm text-[#3b82f6] hover:text-[#2563eb] font-medium">View all logs</button>
        </div>
        <div className="divide-y divide-[#f3f4f6]">
          {recentSearches.map((search) => (
            <div key={search.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#f8f9fa] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded bg-[#f1f3f5] flex items-center justify-center text-xs font-medium text-[#4b5563]">
                  {search.country}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#111827]">{search.name}</p>
                  <p className="text-xs text-[#6b7280] mt-0.5">GET /v2/companies/search</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-xs text-[#6b7280]">{search.time}</span>
                <span className="inline-flex items-center rounded-full bg-[#ecfdf5] px-2 py-1 text-xs font-medium text-[#059669]">
                  200 OK
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ApiKeysTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-medium text-[#111827]">Active API Keys</h2>
          <p className="text-sm text-[#6b7280] mt-1">Manage your keys for authenticating API requests.</p>
        </div>
        <button className="bg-[#0f172a] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#1e293b] transition-colors shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Key
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f8f9fa] border-b border-[#e5e7eb] text-[#4b5563]">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Token Prefix</th>
              <th className="px-6 py-3 font-medium">Created</th>
              <th className="px-6 py-3 font-medium">Last Used</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {[
              { name: "Production - Main App", prefix: "ck_live_4xP...", date: "Oct 12, 2023", lastUsed: "2 mins ago" },
              { name: "Staging Environment", prefix: "ck_test_9mQ...", date: "Nov 05, 2023", lastUsed: "4 hours ago" },
              { name: "Developer Sandbox (Lars)", prefix: "ck_test_2vW...", date: "Jan 18, 2024", lastUsed: "3 days ago" },
            ].map((key, i) => (
              <tr key={i} className="hover:bg-[#f8f9fa] transition-colors group">
                <td className="px-6 py-4 font-medium text-[#111827]">{key.name}</td>
                <td className="px-6 py-4">
                  <code className="bg-[#f1f3f5] px-2 py-1 rounded text-[#4b5563] text-xs font-mono">{key.prefix}</code>
                </td>
                <td className="px-6 py-4 text-[#6b7280]">{key.date}</td>
                <td className="px-6 py-4 text-[#6b7280]">{key.lastUsed}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-[#6b7280] hover:text-[#111827] p-1" title="Copy Key">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="text-[#6b7280] hover:text-[#ef4444] p-1" title="Revoke Key">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 mt-6 flex gap-4">
        <div className="mt-0.5 text-[#3b82f6]">
          <Key className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-[#0f172a]">Keep your keys secure</h4>
          <p className="text-sm text-[#64748b] mt-1 leading-relaxed">
            Do not share your API keys in publicly accessible areas such as GitHub, client-side code, and so forth. 
            All API requests must be made over HTTPS.
          </p>
        </div>
      </div>
    </div>
  );
}

function UsageTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
        <h3 className="text-base font-semibold text-[#111827] mb-6">API Calls (Last 30 Days)</h3>
        
        {/* Mock Chart */}
        <div className="h-64 flex items-end gap-2 mt-4 pt-4 border-b border-[#e5e7eb]">
          {[40, 55, 30, 45, 60, 80, 65, 50, 70, 85, 90, 75, 60, 40, 55, 30, 45, 60, 80, 65, 50, 70, 85, 90, 75, 60, 85, 95, 100, 85].map((val, i) => (
            <div key={i} className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] rounded-t-sm transition-colors relative group" style={{ height: `${val}%` }}>
              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0f172a] text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10 transition-opacity">
                {Math.floor(val * 123)} calls
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 text-xs text-[#6b7280]">
          <span>Sep 1</span>
          <span>Sep 15</span>
          <span>Sep 30</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
          <h3 className="text-base font-semibold text-[#111827] mb-4">Usage by Endpoint</h3>
          <div className="space-y-4">
            {[
              { name: "/v2/companies/search", count: "28,450", pct: 67 },
              { name: "/v2/companies/{id}", count: "10,201", pct: 24 },
              { name: "/v2/officers/search", count: "2,850", pct: 7 },
              { name: "/v2/financials/{id}", count: "1,000", pct: 2 },
            ].map((endpoint, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-mono text-[#4b5563]">{endpoint.name}</span>
                  <span className="font-medium text-[#111827]">{endpoint.count}</span>
                </div>
                <div className="h-1.5 bg-[#f1f3f5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#10b981] rounded-full" style={{ width: `${endpoint.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
          <h3 className="text-base font-semibold text-[#111827] mb-4">Error Rates</h3>
          <div className="flex items-center justify-center h-32 flex-col gap-2">
            <span className="text-4xl font-bold text-[#10b981]">0.04%</span>
            <span className="text-sm text-[#6b7280]">Average error rate this month</span>
          </div>
          <div className="mt-4 p-3 bg-[#f8f9fa] rounded-lg text-sm text-[#4b5563] flex items-start gap-3 border border-[#e9ebf0]">
            <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0" />
            <p>Your API integration is exceptionally stable. No significant outages or rate-limiting events recorded.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-[#111827]">Growth Plan</h3>
            <p className="text-sm text-[#6b7280] mt-1">Billed €299 monthly. Renews on Nov 1, 2024.</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-[#ecfdf5] px-2.5 py-1 text-xs font-medium text-[#059669]">
            Active
          </span>
        </div>

        <div className="mt-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-[#111827]">Monthly Request Limit</span>
            <span className="text-[#6b7280]">42,501 / 100,000</span>
          </div>
          <div className="h-2 bg-[#f1f3f5] rounded-full overflow-hidden">
            <div className="h-full bg-[#3b82f6] rounded-full" style={{ width: '42.5%' }}></div>
          </div>
          <p className="mt-2 text-xs text-[#6b7280]">Overage is billed at €0.005 per request.</p>
        </div>

        <div className="mt-8 pt-6 border-t border-[#f0f2f5] flex gap-3">
          <button className="px-4 py-2 bg-white border border-[#d1d5db] rounded-md text-sm font-medium text-[#374151] hover:bg-[#f9fafb] transition-colors">
            Manage Billing Info
          </button>
          <button className="px-4 py-2 bg-[#0f172a] rounded-md text-sm font-medium text-white hover:bg-[#1e293b] transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#e5e7eb]">
          <h3 className="text-base font-semibold text-[#111827]">Billing History</h3>
        </div>
        <table className="w-full text-left text-sm">
          <tbody className="divide-y divide-[#f3f4f6]">
            {[
              { date: "Oct 1, 2024", amount: "€299.00", status: "Paid", invoice: "INV-2024-10" },
              { date: "Sep 1, 2024", amount: "€299.00", status: "Paid", invoice: "INV-2024-09" },
              { date: "Aug 1, 2024", amount: "€299.00", status: "Paid", invoice: "INV-2024-08" },
            ].map((bill, i) => (
              <tr key={i} className="hover:bg-[#f8f9fa] transition-colors">
                <td className="px-6 py-4 text-[#4b5563]">{bill.date}</td>
                <td className="px-6 py-4 font-medium text-[#111827]">{bill.amount}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center text-xs font-medium text-[#059669]">
                    <Check className="w-3 h-3 mr-1" /> {bill.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[#3b82f6] hover:text-[#2563eb] font-medium inline-flex items-center gap-1">
                    <Download className="w-4 h-4" /> PDF
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

function PlaygroundTab() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
        <h2 className="text-lg font-semibold text-[#111827] mb-2">API Playground</h2>
        <p className="text-sm text-[#6b7280] mb-6">Test the company search endpoint without writing code.</p>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Search by company name, VAT number, or reg no..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9fa] border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all"
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching}
            className="px-6 py-2.5 bg-[#0f172a] text-white rounded-lg text-sm font-medium hover:bg-[#1e293b] transition-colors disabled:opacity-70 min-w-[100px] flex justify-center"
          >
            {isSearching ? <span className="animate-pulse">Searching...</span> : "Search"}
          </button>
        </form>

        <div className="mt-4 flex gap-2">
          <span className="text-xs text-[#6b7280] font-medium">Try:</span>
          {["Novo Nordisk", "Spotify", "SE556756117701"].map((term) => (
            <button 
              key={term}
              type="button"
              onClick={() => { setQuery(term); handleSearch({ preventDefault: () => {} } as any); }}
              className="text-xs text-[#3b82f6] hover:underline"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {hasSearched && !isSearching && (
        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="px-6 py-4 bg-[#f8f9fa] border-b border-[#e5e7eb] flex justify-between items-center">
            <span className="text-sm font-medium text-[#111827]">Result: 1 match found</span>
            <span className="text-xs text-[#6b7280] font-mono">GET /v2/companies/search?q={encodeURIComponent(query)}</span>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-[#111827]">Novo Nordisk A/S</h3>
                  <span className="inline-flex items-center rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[10px] font-bold text-[#059669] uppercase tracking-wider">
                    Active
                  </span>
                </div>
                <p className="text-sm text-[#6b7280]">Pharmaceutical manufacturing</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <Building2 className="w-4 h-4 text-[#9ca3af] mt-0.5" />
                  <div>
                    <p className="text-[#6b7280] text-xs uppercase tracking-wider font-semibold mb-0.5">Registration Number</p>
                    <p className="font-mono text-[#111827]">24256790</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Briefcase className="w-4 h-4 text-[#9ca3af] mt-0.5" />
                  <div>
                    <p className="text-[#6b7280] text-xs uppercase tracking-wider font-semibold mb-0.5">VAT Number</p>
                    <p className="font-mono text-[#111827]">DK24256790</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-[#9ca3af] mt-0.5" />
                  <div>
                    <p className="text-[#6b7280] text-xs uppercase tracking-wider font-semibold mb-0.5">Registered Address</p>
                    <p className="text-[#111827]">Novo Allé 1<br/>2880 Bagsværd<br/>Denmark</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1e1e1e] rounded-lg p-4 font-mono text-xs text-[#d4d4d4] overflow-x-auto">
              <pre>
{`{
  "id": "comp_dk_24256790",
  "name": "Novo Nordisk A/S",
  "status": "active",
  "country_code": "DK",
  "registration_number": "24256790",
  "vat_number": "DK24256790",
  "company_type": "A/S",
  "incorporation_date": "1989-11-28",
  "address": {
    "street": "Novo Allé 1",
    "city": "Bagsværd",
    "postal_code": "2880",
    "country": "Denmark"
  },
  "industry_codes": [
    {
      "code": "212000",
      "system": "NACE_REV2",
      "description": "Manufacture of pharmaceutical preparations"
    }
  ]
}`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[#111827] mb-1">Account Settings</h2>
        <p className="text-sm text-[#6b7280] mb-6">Manage your profile and preferences.</p>
        
        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Full Name</label>
              <input type="text" defaultValue="Lars Eriksen" className="w-full px-3 py-2 bg-[#f8f9fa] border border-[#d1d5db] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:bg-white transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Email Address</label>
              <input type="email" defaultValue="lars@buildco.dk" className="w-full px-3 py-2 bg-[#f8f9fa] border border-[#d1d5db] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:bg-white transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">Company</label>
            <input type="text" defaultValue="BuildCo ApS" className="w-full px-3 py-2 bg-[#f8f9fa] border border-[#d1d5db] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:bg-white transition-all" />
          </div>
          
          <div className="pt-2">
            <button className="bg-[#0f172a] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#1e293b] transition-colors shadow-sm">
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-[#111827] mb-4">Security</h3>
        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#f0f2f5]">
            <div>
              <p className="text-sm font-medium text-[#111827]">Password</p>
              <p className="text-xs text-[#6b7280] mt-0.5">Last changed 3 months ago</p>
            </div>
            <button className="px-3 py-1.5 bg-white border border-[#d1d5db] rounded-md text-sm font-medium text-[#374151] hover:bg-[#f9fafb] transition-colors">
              Change Password
            </button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-[#111827]">Two-Factor Authentication</p>
              <p className="text-xs text-[#6b7280] mt-0.5">Add an extra layer of security to your account</p>
            </div>
            <button className="px-3 py-1.5 bg-white border border-[#d1d5db] rounded-md text-sm font-medium text-[#374151] hover:bg-[#f9fafb] transition-colors">
              Enable 2FA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
