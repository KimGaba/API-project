/* CompanyData — public site components (React + Tailwind CDN)
   Adapted from the CompanyData Design System UI kit.
   Uses colors_and_type.css tokens via inline styles + CSS vars. */

const { useState } = React;

// ── Lucide icons (subset, stroke 1.75) ──────────────────────────────────────
const Icon = ({ d, size = 18, className = "", stroke = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {Array.isArray(d) ? d.map((el, i) => React.cloneElement(el, { key: i })) : d}
  </svg>
);
const IcDatabase    = (p) => <Icon {...p} d={[<ellipse cx="12" cy="5" rx="9" ry="3"/>,<path d="M3 5v6c0 1.66 4 3 9 3s9-1.34 9-3V5"/>,<path d="M3 11v6c0 1.66 4 3 9 3s9-1.34 9-3v-6"/>]}/>;
const IcSearch      = (p) => <Icon {...p} d={[<circle cx="11" cy="11" r="7"/>,<path d="m21 21-4.3-4.3"/>]}/>;
const IcShield      = (p) => <Icon {...p} d={[<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>]}/>;
const IcGlobe       = (p) => <Icon {...p} d={[<circle cx="12" cy="12" r="10"/>,<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>,<path d="M2 12h20"/>]}/>;
const IcZap         = (p) => <Icon {...p} d={[<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>]}/>;
const IcServer      = (p) => <Icon {...p} d={[<rect x="2" y="2" width="20" height="8" rx="2"/>,<rect x="2" y="14" width="20" height="8" rx="2"/>,<path d="M6 6h.01M6 18h.01"/>]}/>;
const IcCheck       = (p) => <Icon {...p} d={[<polyline points="20 6 9 17 4 12"/>]}/>;
const IcCheckCircle = (p) => <Icon {...p} d={[<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>,<polyline points="22 4 12 14.01 9 11.01"/>]}/>;
const IcArrowRight  = (p) => <Icon {...p} d={[<line x1="5" y1="12" x2="19" y2="12"/>,<polyline points="12 5 19 12 12 19"/>]}/>;
const IcMenu        = (p) => <Icon {...p} d={[<line x1="4" y1="7" x2="20" y2="7"/>,<line x1="4" y1="12" x2="20" y2="12"/>,<line x1="4" y1="17" x2="20" y2="17"/>]}/>;
const IcX           = (p) => <Icon {...p} d={[<path d="M18 6L6 18M6 6l12 12"/>]}/>;
const IcFileJson    = (p) => <Icon {...p} d={[<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>,<path d="M14 2v6h6"/>,<path d="M10 12a1 1 0 0 0-1 1v1a2 2 0 0 1-2 2 2 2 0 0 1 2 2v1a1 1 0 0 0 1 1"/>,<path d="M14 18a1 1 0 0 0 1-1v-1a2 2 0 0 1 2-2 2 2 0 0 1-2-2v-1a1 1 0 0 0-1-1"/>]}/>;

// ── Buttons ─────────────────────────────────────────────────────────────────
function PrimaryButton({ children, href, size = "lg", onClick }) {
  const h = size === "lg" ? "h-12 px-8 text-[15px]" : "h-10 px-5 text-[14px]";
  const cls = `rounded-full font-semibold text-white inline-flex items-center justify-center gap-2 transition-all ${h}`;
  const style = { background: "var(--accent)", boxShadow: "var(--shadow-cta)" };
  if (href) return <a href={href} className={cls} style={style}>{children}</a>;
  return <button className={cls} style={style} onClick={onClick}>{children}</button>;
}
function GhostButton({ children, href, size = "lg" }) {
  const h = size === "lg" ? "h-12 px-8 text-[15px]" : "h-10 px-5 text-[14px]";
  const cls = `rounded-full font-semibold inline-flex items-center justify-center gap-2 transition-colors ${h}`;
  const style = { color: "var(--brand-800)", background: "white", border: "1px solid var(--brand-200)" };
  if (href) return <a href={href} className={cls} style={style}>{children}</a>;
  return <button className={cls} style={style}>{children}</button>;
}

// ── Top nav ──────────────────────────────────────────────────────────────────
function TopNav({ active = "home" }) {
  const [open, setOpen] = useState(false);
  const links = [
    { id: "home",     label: "Home",          href: "./" },
    { id: "product",  label: "Product",       href: "./product.html" },
    { id: "docs",     label: "Docs",          href: "./docs.html" },
    { id: "pricing",  label: "Pricing",       href: "./pricing.html" },
    { id: "coverage", label: "Coverage",      href: "./coverage.html" },
    { id: "demo",     label: "Demo",          href: "./demo.html" },
  ];
  return (
    <>
      <nav className="sticky top-4 z-50 mx-4 md:mx-6 lg:mx-8"
           style={{ borderRadius: 16 }}>
        <div className="rounded-2xl px-5 h-16 flex items-center justify-between"
             style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)", border: "1px solid var(--brand-100)",
                      boxShadow: "0 14px 30px rgba(42,69,98,0.06)" }}>
          {/* Logo */}
          <a href="./" className="flex items-center gap-2.5 flex-shrink-0">
            <span className="w-9 h-9 rounded-[10px] grid place-items-center text-white font-bold text-[13px]"
                  style={{ fontFamily: "var(--font-display)",
                           background: "linear-gradient(180deg, var(--accent), var(--accent-strong))",
                           boxShadow: "0 6px 16px rgba(0,82,204,0.28)" }}>CD</span>
            <span className="font-bold text-[16px]" style={{ fontFamily: "var(--font-display)", color: "var(--brand-900)" }}>
              CompanyData
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1 text-[14px] font-medium" style={{ color: "var(--brand-500)" }}>
            {links.map(l => (
              <a key={l.id} href={l.href}
                 className={`px-3 py-2 rounded-lg transition-colors hover:text-[var(--brand-900)] ${active === l.id ? "text-[var(--brand-900)] bg-[var(--accent-soft)]" : ""}`}>
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <a href="./login.html" className="text-[14px] font-medium transition-colors"
               style={{ color: "var(--brand-500)" }}
               onMouseEnter={e => e.currentTarget.style.color = "var(--brand-900)"}
               onMouseLeave={e => e.currentTarget.style.color = "var(--brand-500)"}>
              Log in
            </a>
            <PrimaryButton href="./signup.html" size="sm">Get API key</PrimaryButton>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg" style={{ color: "var(--brand-600)" }}
                  onClick={() => setOpen(!open)}>
            {open ? <IcX size={20}/> : <IcMenu size={20}/>}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden mt-2 rounded-2xl p-4"
               style={{ background: "white", border: "1px solid var(--brand-100)", boxShadow: "var(--shadow-md)" }}>
            {links.map(l => (
              <a key={l.id} href={l.href}
                 className="flex items-center px-3 py-2.5 rounded-lg text-[15px] font-medium"
                 style={{ color: "var(--brand-700)" }}>
                {l.label}
              </a>
            ))}
            <div className="mt-3 pt-3 flex flex-col gap-2" style={{ borderTop: "1px solid var(--brand-100)" }}>
              <a href="./login.html" className="text-center py-2.5 rounded-lg text-[14px] font-medium"
                 style={{ color: "var(--brand-600)", border: "1px solid var(--brand-200)" }}>Log in</a>
              <PrimaryButton href="./signup.html" size="sm">Get API key</PrimaryButton>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative overflow-hidden pt-14 pb-28" style={{ background: "var(--bg-hero)" }}>
      <img src="./assets/europe-motif.svg" alt=""
           className="absolute right-[-60px] top-[10px] w-[560px] opacity-[0.30] pointer-events-none select-none hidden lg:block"/>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold mb-7"
                style={{ background: "var(--accent-soft)", color: "var(--accent-strong)",
                         border: "1px solid var(--accent-ring)", fontFamily: "var(--font-display)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--success)" }}/>
            Norway · Finland · United Kingdom — live
          </span>
          <h1 className="font-bold leading-[1.05]"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px,6vw,68px)",
                       letterSpacing: "-0.028em", color: "var(--brand-900)" }}>
            Company data for Europe — by API.
          </h1>
          <p className="mt-6 text-[18px] leading-[1.6] max-w-2xl" style={{ color: "var(--brand-500)" }}>
            Search, verify, and enrich company information directly from official national registries.
            One consistent REST API. Predictable responses. Free tier to get started.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <PrimaryButton href="./signup.html">Start building for free</PrimaryButton>
            <GhostButton href="./demo.html">Try live demo</GhostButton>
          </div>

          <div className="mt-14 pt-8 grid grid-cols-2 md:grid-cols-4 gap-8"
               style={{ borderTop: "1px solid var(--brand-100)" }}>
            <Metric value="7.4M+" label="Companies indexed"/>
            <Metric value="3" label="Countries live"/>
            <Metric value="Free" label="100 req/mo, no card"/>
            <Metric value="REST" label="Simple JSON API"/>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }) {
  return (
    <div>
      <div className="text-[30px] font-semibold tracking-tight"
           style={{ fontFamily: "var(--font-display)", color: "var(--brand-900)" }}>{value}</div>
      <div className="text-[13px] mt-1" style={{ color: "var(--brand-500)" }}>{label}</div>
    </div>
  );
}

// ── Trust strip ───────────────────────────────────────────────────────────────
function TrustStrip() {
  return (
    <section className="py-10 border-y" style={{ background: "white", borderColor: "var(--brand-100)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] mb-6"
           style={{ color: "var(--brand-400)" }}>
          Built for technical teams
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-[14px] font-medium"
             style={{ color: "var(--brand-600)" }}>
          <span>Official registry sources</span>
          <span style={{ color: "var(--brand-300)" }}>·</span>
          <span>Predictable response shapes</span>
          <span style={{ color: "var(--brand-300)" }}>·</span>
          <span>Free evaluation tier</span>
          <span style={{ color: "var(--brand-300)" }}>·</span>
          <span>No OAuth complexity</span>
          <span style={{ color: "var(--brand-300)" }}>·</span>
          <span>GDPR compliant</span>
        </div>
      </div>
    </section>
  );
}

// ── API preview (dark) ────────────────────────────────────────────────────────
function ApiPreview() {
  const [tab, setTab] = useState("response");
  return (
    <section className="py-24" style={{ background: "var(--brand-900)" }}>
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <h2 className="text-[34px] font-bold leading-tight text-white"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
            Built for engineers, designed for speed.
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed" style={{ color: "var(--brand-300)" }}>
            Integrate European company search into your application in minutes.
            Our REST API is predictable, documented, and returns clean normalized JSON
            across all supported jurisdictions.
          </p>
          <ul className="mt-8 space-y-3.5">
            {[
              "One API key across all endpoints — no OAuth",
              "Unified data model: Norway, Finland, United Kingdom",
              "Real-time data from official national registries",
              "Free tier — 100 requests/month, no credit card",
            ].map(s => (
              <li key={s} className="flex items-center gap-3 text-[15px]" style={{ color: "var(--brand-200)" }}>
                <IcCheckCircle size={18} style={{ color: "var(--accent)", flexShrink: 0 }} stroke={2}/>
                {s}
              </li>
            ))}
          </ul>
          <a href="./docs.html" className="mt-9 inline-flex items-center gap-2 font-medium text-[14px]"
             style={{ color: "var(--accent)" }}>
            View API reference <IcArrowRight size={16}/>
          </a>
        </div>

        {/* Code panel */}
        <div className="rounded-2xl overflow-hidden"
             style={{ background: "var(--brand-950)", border: "1px solid #1f2933",
                      boxShadow: "0 30px 80px rgba(0,0,0,0.45)" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b"
               style={{ background: "#1a222c", borderColor: "#1f2933" }}>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: "rgba(239,68,68,0.7)" }}/>
              <span className="w-3 h-3 rounded-full" style={{ background: "rgba(234,179,8,0.7)" }}/>
              <span className="w-3 h-3 rounded-full" style={{ background: "rgba(34,197,94,0.7)" }}/>
            </div>
            <div className="flex gap-4 text-[13px]" style={{ fontFamily: "var(--font-mono)" }}>
              {["request", "response"].map(t => (
                <button key={t} onClick={() => setTab(t)}
                        className="transition-colors"
                        style={{ color: tab === t ? "white" : "var(--brand-400)" }}>
                  {t === "request" ? "request.sh" : "response.json"}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6 text-[13px] leading-[1.7] overflow-x-auto"
               style={{ fontFamily: "var(--font-mono)" }}>
            {tab === "request" ? (
              <pre style={{ color: "var(--brand-300)", margin: 0 }}>
{`curl -X GET \\
  https://api.companydata.eu/v1/companies/search \\
  -G -d "q=Equinor&country=NO&limit=3" \\
  -H "x-api-key: YOUR_API_KEY"`}
              </pre>
            ) : (
              <pre style={{ color: "var(--code-fg)", margin: 0 }}>
{`{
  `}<span style={{color:"var(--code-key)"}}>"companies"</span>{`: [
    {
      `}<span style={{color:"var(--code-key)"}}>"registration_number"</span>{`: `}<span style={{color:"var(--code-str)"}}>"986187009"</span>{`,
      `}<span style={{color:"var(--code-key)"}}>"name"</span>{`: `}<span style={{color:"var(--code-str)"}}>"EQUINOR ASA"</span>{`,
      `}<span style={{color:"var(--code-key)"}}>"country"</span>{`: `}<span style={{color:"var(--code-str)"}}>"NO"</span>{`,
      `}<span style={{color:"var(--code-key)"}}>"status"</span>{`: `}<span style={{color:"var(--code-str)"}}>"active"</span>{`,
      `}<span style={{color:"var(--code-key)"}}>"address"</span>{`: {
        `}<span style={{color:"var(--code-key)"}}>"city"</span>{`: `}<span style={{color:"var(--code-str)"}}>"Stavanger"</span>{`
      }
    }
  ],
  `}<span style={{color:"var(--code-key)"}}>"total"</span>{`: `}<span style={{color:"var(--code-num)"}}>1</span>{`,
  `}<span style={{color:"var(--code-key)"}}>"page"</span>{`: `}<span style={{color:"var(--code-num)"}}>1</span>{`
}`}
              </pre>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Feature grid ──────────────────────────────────────────────────────────────
function FeatureGrid() {
  const features = [
    { icon: <IcSearch size={22}/>, title: "Company search", desc: "Search by name or registration number across Norway, Finland, and the UK. Filter by country, paginate results." },
    { icon: <IcShield size={22}/>, title: "Simple auth", desc: "One API key header across all endpoints. No OAuth flows, no token refresh cycles to implement." },
    { icon: <IcGlobe size={22}/>, title: "Live registry data", desc: "Data sourced directly from Brønnøysund (NO), PRH/YTJ (FI), and Companies House (UK) — not scraped." },
    { icon: <IcFileJson size={22}/>, title: "Consistent response shape", desc: "Normalized JSON across all countries. Same field names whether you're looking up a Norwegian AS or a UK Ltd." },
    { icon: <IcZap size={22}/>, title: "Live playground", desc: "Run real requests against the API in-browser. No setup required to evaluate before you integrate." },
    { icon: <IcServer size={22}/>, title: "More countries coming", desc: "Denmark and France are on the roadmap. Coverage status is always explicit — live vs planned, clearly marked." },
  ];
  return (
    <section className="py-24" style={{ background: "var(--brand-50)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-[34px] font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em", color: "var(--brand-900)" }}>
            From search to verified company data in one request
          </h2>
          <p className="mt-4 text-[17px]" style={{ color: "var(--brand-500)" }}>
            A focused API for company search, verification, and enrichment — across official European registries.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {features.map(f => (
            <article key={f.title}
                     className="p-8 bg-white rounded-2xl border transition-all hover:-translate-y-0.5"
                     style={{ borderColor: "var(--brand-100)", boxShadow: "var(--shadow-sm)" }}
                     onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--shadow-md)"}
                     onMouseLeave={e => e.currentTarget.style.boxShadow = "var(--shadow-sm)"}>
              <div className="w-11 h-11 rounded-xl grid place-items-center mb-5"
                   style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                {f.icon}
              </div>
              <h3 className="text-[17px] font-semibold mb-2"
                  style={{ fontFamily: "var(--font-display)", color: "var(--brand-900)" }}>{f.title}</h3>
              <p className="text-[14px] leading-relaxed" style={{ color: "var(--brand-500)" }}>{f.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Coverage ──────────────────────────────────────────────────────────────────
function CoverageSection() {
  const countries = [
    { code: "NO", name: "Norway", count: "1.16M", status: "Live", chip: "./assets/chip-NO.svg" },
    { code: "FI", name: "Finland", count: "618K",  status: "Live", chip: "./assets/chip-NO.svg" },
    { code: "UK", name: "United Kingdom", count: "5.7M", status: "Live", chip: "./assets/chip-UK.svg" },
    { code: "DK", name: "Denmark",  count: "~700K", status: "Roadmap", chip: "./assets/chip-DK.svg" },
    { code: "SE", name: "Sweden",   count: "~1.1M", status: "Roadmap", chip: "./assets/chip-SE.svg" },
    { code: "DE", name: "Germany",  count: "~5M",   status: "Roadmap", chip: "./assets/chip-DE.svg" },
  ];
  const live = { background: "rgba(16,185,129,0.08)", color: "#059669", border: "1px solid rgba(16,185,129,0.22)" };
  const planned = { background: "rgba(210,153,34,0.08)", color: "#b45309", border: "1px solid rgba(210,153,34,0.22)" };
  return (
    <section className="py-24 relative overflow-hidden" style={{ background: "white" }}>
      <img src="./assets/europe-motif.svg" alt=""
           className="absolute right-0 top-0 bottom-0 w-[45%] opacity-[0.18] object-cover object-left pointer-events-none hidden lg:block"/>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-xl">
          <h2 className="text-[34px] font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em", color: "var(--brand-900)" }}>
            European coverage, growing fast
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed" style={{ color: "var(--brand-500)" }}>
            We connect directly to primary national registries. Live means data is synced
            daily from the official source — not scraped, not cached stale.
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {countries.map(c => (
              <div key={c.code} className="flex items-center gap-3 p-4 rounded-xl"
                   style={{ background: "var(--brand-50)", border: "1px solid var(--brand-100)" }}>
                <span className="w-8 h-8 rounded-md grid place-items-center text-[13px] font-bold flex-shrink-0"
                      style={{ background: "var(--brand-900)", color: "white", fontFamily: "var(--font-mono)" }}>
                  {c.code}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold" style={{ color: "var(--brand-900)" }}>{c.name}</div>
                  <div className="text-[12px]" style={{ color: "var(--brand-500)" }}>{c.count} companies</div>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={c.status === "Live" ? live : planned}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <GhostButton href="./coverage.html" size="md">View full coverage map</GhostButton>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────
function PricingSection() {
  const tiers = [
    { name: "Developer", price: "€0", per: "/mo", desc: "Perfect for testing and side projects.", cta: "Start for free", ctaHref: "./signup.html", featured: false,
      perks: ["100 requests / month", "Search + country catalogue", "Norway, Finland, UK", "No credit card required"] },
    { name: "Starter", price: "€49", per: "/mo", desc: "For first live integrations and internal tools.", cta: "Get started", ctaHref: "./signup.html", featured: true,
      perks: ["10,000 requests / month", "All search + lookup endpoints", "All live countries", "Email support"] },
    { name: "Enterprise", price: "Custom", per: "", desc: "For financial institutions and high-volume use.", cta: "Contact us", ctaHref: "./signup.html", featured: false,
      perks: ["Unlimited requests", "Custom rate limits", "SLA & dedicated support", "Bulk data access"] },
  ];
  return (
    <section className="py-24" style={{ background: "var(--brand-50)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-[34px] font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em", color: "var(--brand-900)" }}>
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-[17px]" style={{ color: "var(--brand-500)" }}>
            Start free, no card required. Exact pricing not yet published — <a href="./signup.html" style={{ color: "var(--accent)" }}>sign up</a> to be notified at launch.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {tiers.map(t => (
            <div key={t.name}
                 className="p-8 bg-white rounded-2xl relative flex flex-col"
                 style={{
                   border: t.featured ? "1px solid var(--accent)" : "1px solid var(--brand-100)",
                   boxShadow: t.featured ? "var(--shadow-lg)" : "var(--shadow-sm)",
                   transform: t.featured ? "scale(1.03)" : "none",
                 }}>
              {t.featured && (
                <div className="absolute top-0 inset-x-0 h-1 rounded-t-2xl" style={{ background: "var(--accent)" }}/>
              )}
              <h3 className="text-[16px] font-semibold mb-1"
                  style={{ fontFamily: "var(--font-display)", color: "var(--brand-900)" }}>{t.name}</h3>
              <div className="text-[36px] font-bold tracking-tight"
                   style={{ fontFamily: "var(--font-display)", color: "var(--brand-900)" }}>
                {t.price}<span className="text-[15px] font-normal" style={{ color: "var(--brand-400)" }}>{t.per}</span>
              </div>
              <p className="text-[13px] mt-1 mb-6" style={{ color: "var(--brand-500)" }}>{t.desc}</p>
              <ul className="space-y-3 flex-1 mb-7 text-[14px]" style={{ color: "var(--brand-600)" }}>
                {t.perks.map(p => (
                  <li key={p} className="flex gap-3 items-center">
                    <IcCheck size={16} style={{ color: t.featured ? "var(--accent)" : "var(--success)", flexShrink: 0 }} stroke={2.5}/>
                    {p}
                  </li>
                ))}
              </ul>
              {t.featured
                ? <PrimaryButton href={t.ctaHref} size="sm">{t.cta}</PrimaryButton>
                : <GhostButton href={t.ctaHref} size="sm">{t.cta}</GhostButton>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA closer ────────────────────────────────────────────────────────────────
function CtaCloser() {
  return (
    <section className="py-24 text-center px-6" style={{ background: "var(--bg-cta-dark)" }}>
      <h2 className="text-[40px] font-bold mb-5 text-white"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
        Ready to build?
      </h2>
      <p className="text-[17px] mb-9 max-w-xl mx-auto" style={{ color: "var(--brand-300)" }}>
        Create a free account, get your API key, and run a real request against live registry data.
        From signup to first response in minutes.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <a href="./signup.html"
           className="rounded-full px-8 h-12 font-semibold text-[15px] inline-flex items-center justify-center"
           style={{ background: "white", color: "var(--brand-900)" }}>
          Create free account
        </a>
        <a href="./demo.html"
           className="rounded-full px-8 h-12 font-semibold text-[15px] inline-flex items-center justify-center"
           style={{ color: "white", border: "1px solid var(--brand-700)" }}>
          Try demo first
        </a>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    { h: "Product",  items: [["Docs", "./docs.html"], ["Coverage", "./coverage.html"], ["Pricing", "./pricing.html"], ["Demo", "./demo.html"]] },
    { h: "Platform", items: [["API Reference", "./docs.html"], ["Product", "./product.html"], ["Sign up", "./signup.html"], ["Log in", "./login.html"]] },
    { h: "Legal",    items: [["Terms of Service", "#"], ["Privacy Policy", "#"], ["GDPR", "#"]] },
  ];
  return (
    <footer className="py-12 border-t bg-white" style={{ borderColor: "var(--brand-100)" }}>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-lg grid place-items-center text-white text-[11px] font-bold"
                  style={{ background: "linear-gradient(180deg, var(--accent), var(--accent-strong))" }}>CD</span>
            <span className="font-semibold text-[15px]" style={{ color: "var(--brand-900)", fontFamily: "var(--font-display)" }}>CompanyData</span>
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: "var(--brand-500)" }}>
            Official European company registry data — by API.
          </p>
        </div>
        {cols.map(g => (
          <div key={g.h}>
            <div className="font-semibold text-[13px] mb-3" style={{ color: "var(--brand-900)" }}>{g.h}</div>
            <ul className="space-y-2">
              {g.items.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="text-[13px] transition-colors"
                     style={{ color: "var(--brand-500)" }}
                     onMouseEnter={e => e.currentTarget.style.color = "var(--brand-900)"}
                     onMouseLeave={e => e.currentTarget.style.color = "var(--brand-500)"}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3 pt-6"
           style={{ borderTop: "1px solid var(--brand-100)", color: "var(--brand-400)", fontSize: 13 }}>
        <p>© 2026 CompanyData API. All rights reserved.</p>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--success)" }}/>
          All systems operational
        </span>
      </div>
    </footer>
  );
}
