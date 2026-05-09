import React, { useState } from 'react';
import { Search, Database, Shield, Zap, CheckCircle2, Server, Globe2, FileJson, ArrowRight, Code2, Terminal, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import './_group.css';

export function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('DK12345678');
  const [activeTab, setActiveTab] = useState('response');

  return (
    <div className="min-h-screen bg-white font-sans text-brand-900 selection:bg-brand-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-accent" />
            <span className="font-semibold tracking-tight text-lg">CompanyData</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-500">
            <a href="#products" className="hover:text-brand-900 transition-colors">Products</a>
            <a href="#coverage" className="hover:text-brand-900 transition-colors">Coverage</a>
            <a href="#pricing" className="hover:text-brand-900 transition-colors">Pricing</a>
            <a href="#docs" className="hover:text-brand-900 transition-colors">Documentation</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="#login" className="text-sm font-medium text-brand-500 hover:text-brand-900 hidden md:block">Log in</a>
            <Button className="bg-brand-900 text-white hover:bg-brand-800 rounded-full px-6">
              Get API Key
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden hero-gradient">
        <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none">
           <img src="/__mockup/images/hero-bg.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-sm font-medium text-brand-600 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
              API v2.0 is now live
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-brand-900">
              The authoritative API for European company data.
            </h1>
            <p className="text-xl text-brand-500 mb-10 leading-relaxed max-w-2xl">
              Access real-time registry data, financials, and ownership structures for over 40 million European companies. Built for developers, trusted by financial institutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-accent text-white hover:bg-blue-700 rounded-full px-8 h-12 text-base">
                Start building for free
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base border-brand-200 text-brand-700 hover:bg-brand-50">
                Explore Documentation
              </Button>
            </div>
            
            <div className="mt-16 pt-8 border-t border-brand-100 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-semibold mb-1">40M+</div>
                <div className="text-sm text-brand-500">Companies indexed</div>
              </div>
              <div>
                <div className="text-3xl font-semibold mb-1">32</div>
                <div className="text-sm text-brand-500">Countries covered</div>
              </div>
              <div>
                <div className="text-3xl font-semibold mb-1">99.99%</div>
                <div className="text-sm text-brand-500">Uptime SLA</div>
              </div>
              <div>
                <div className="text-3xl font-semibold mb-1">&lt;50ms</div>
                <div className="text-sm text-brand-500">Average latency</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-12 border-y border-brand-100 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-medium text-brand-400 mb-8 uppercase tracking-widest">Trusted by engineering teams at</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Minimal typographic logos */}
            <span className="text-xl font-bold tracking-tighter">FINTECH<span className="font-light">OS</span></span>
            <span className="text-xl font-black italic">Pleo</span>
            <span className="text-xl font-medium tracking-widest">LUNAR</span>
            <span className="text-xl font-bold font-serif">Danske Bank</span>
            <span className="text-xl font-bold text-accent">Klarna.</span>
          </div>
        </div>
      </section>

      {/* API Playground Section */}
      <section className="py-24 bg-brand-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Built for engineers, designed for speed.</h2>
              <p className="text-brand-300 text-lg mb-8 leading-relaxed">
                Integrate European company search into your application in minutes. Our REST API is predictable, deeply documented, and returns clean, normalized JSON across all supported jurisdictions.
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  'Unified data model across 32 countries',
                  'Real-time VAT validation (VIES integration)',
                  'Webhooks for company state changes',
                  'SDKs for Node, Python, and Go'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-brand-200">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              
              <a href="#" className="inline-flex items-center gap-2 text-accent hover:text-blue-400 font-medium transition-colors">
                View API Reference <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            
            <div className="bg-brand-950 rounded-2xl border border-brand-800 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-brand-800 bg-[#1a222c]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="flex gap-4 text-sm text-brand-400 font-mono">
                  <button 
                    className={`hover:text-white transition-colors ${activeTab === 'request' ? 'text-white' : ''}`}
                    onClick={() => setActiveTab('request')}
                  >
                    request.sh
                  </button>
                  <button 
                    className={`hover:text-white transition-colors ${activeTab === 'response' ? 'text-white' : ''}`}
                    onClick={() => setActiveTab('response')}
                  >
                    response.json
                  </button>
                </div>
              </div>
              <div className="p-6 font-mono text-sm overflow-x-auto">
                {activeTab === 'request' ? (
                  <pre className="text-brand-300">
                    <span className="text-pink-400">curl</span> -X GET \<br/>
                    {'  '}https://api.companydata.eu/v2/companies/DK/32651514 \<br/>
                    {'  '}-H <span className="text-yellow-300">"Authorization: Bearer sk_live_..."</span>
                  </pre>
                ) : (
                  <pre className="code-block leading-relaxed">
{`{
  `}
  <span className="code-key">"id"</span>: <span className="code-string">"cmp_123abc"</span>,
  <span className="code-key">"country"</span>: <span className="code-string">"DK"</span>,
  <span className="code-key">"registration_number"</span>: <span className="code-string">"32651514"</span>,
  <span className="code-key">"vat_number"</span>: <span className="code-string">"DK32651514"</span>,
  <span className="code-key">"name"</span>: <span className="code-string">"Novo Nordisk A/S"</span>,
  <span className="code-key">"status"</span>: <span className="code-string">"active"</span>,
  <span className="code-key">"type"</span>: <span className="code-string">"A/S"</span>,
  <span className="code-key">"address"</span>: {`{
    `}
    <span className="code-key">"street"</span>: <span className="code-string">"Novo Allé 1"</span>,
    <span className="code-key">"postal_code"</span>: <span className="code-string">"2880"</span>,
    <span className="code-key">"city"</span>: <span className="code-string">"Bagsværd"</span>,
    <span className="code-key">"country"</span>: <span className="code-string">"Denmark"</span>
  {`}`},
  <span className="code-key">"incorporation_date"</span>: <span className="code-string">"1931-11-28"</span>,
  <span className="code-key">"industry_codes"</span>: [
    {`{ `}<span className="code-key">"code"</span>: <span className="code-string">"212000"</span>, <span className="code-key">"description"</span>: <span className="code-string">"Manufacture of pharmaceutical preparations"</span> {`}`}
  ]
{`}`}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="products" className="py-24 bg-brand-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to verify business entities</h2>
            <p className="text-brand-500 text-lg">A modular suite of APIs designed for onboarding, compliance, and enrichment.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Search className="w-6 h-6 text-accent" />,
                title: "Company Search & Lookup",
                desc: "Search by name, address, or registration number across all jurisdictions with fuzzy matching and instant results."
              },
              {
                icon: <Shield className="w-6 h-6 text-accent" />,
                title: "VAT & KYC Validation",
                desc: "Real-time validation against VIES and local registries. Automate your B2B onboarding and compliance checks."
              },
              {
                icon: <Globe2 className="w-6 h-6 text-accent" />,
                title: "UBO & Ownership Structure",
                desc: "Traverse complex corporate structures to identify Ultimate Beneficial Owners (UBOs) automatically."
              },
              {
                icon: <FileJson className="w-6 h-6 text-accent" />,
                title: "Financial Statements",
                desc: "Access structured financial data, balance sheets, and income statements extracted from annual reports."
              },
              {
                icon: <Zap className="w-6 h-6 text-accent" />,
                title: "Webhooks & Monitoring",
                desc: "Get notified instantly when a company changes status, directors, or files new documents."
              },
              {
                icon: <Server className="w-6 h-6 text-accent" />,
                title: "Bulk Data & Dumps",
                desc: "Download complete national registry datasets for machine learning, market analysis, or internal syncing."
              }
            ].map((feature, i) => (
              <Card key={i} className="p-8 border-brand-100 hover:border-brand-200 transition-all shadow-sm hover:shadow-md bg-white">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-brand-500 leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Section */}
      <section id="coverage" className="py-24 relative bg-white overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 pointer-events-none">
          <img src="/__mockup/images/europe-map.png" alt="Europe Map" className="w-full h-full object-cover object-left" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold mb-6">Comprehensive European Coverage</h2>
            <p className="text-brand-500 text-lg mb-8 leading-relaxed">
              We connect directly to primary national registries, ensuring data is always fresh, accurate, and legally binding. No scraped data, no stale caches.
            </p>
            
            <div className="space-y-6 mb-8">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold">Nordics</span>
                  <span className="text-brand-500">100% real-time</span>
                </div>
                <div className="h-2 bg-brand-100 rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold">Western Europe</span>
                  <span className="text-brand-500">100% real-time</span>
                </div>
                <div className="h-2 bg-brand-100 rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold">Eastern Europe</span>
                  <span className="text-brand-500">92% real-time</span>
                </div>
                <div className="h-2 bg-brand-100 rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-[92%]"></div>
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="rounded-full">View detailed coverage map</Button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-brand-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-brand-500 text-lg">Start for free, scale when you need to. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <Card className="p-8 border-brand-100 bg-white flex flex-col">
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Developer</h3>
                <div className="text-4xl font-bold mb-2">€0<span className="text-base font-normal text-brand-400">/mo</span></div>
                <p className="text-sm text-brand-500">Perfect for testing and side projects.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-sm text-brand-600">
                <li className="flex gap-3"><Check className="w-5 h-5 text-green-500 shrink-0" /> 1,000 API calls / month</li>
                <li className="flex gap-3"><Check className="w-5 h-5 text-green-500 shrink-0" /> Basic company endpoints</li>
                <li className="flex gap-3"><Check className="w-5 h-5 text-green-500 shrink-0" /> 5 countries included</li>
                <li className="flex gap-3"><Check className="w-5 h-5 text-green-500 shrink-0" /> Community support</li>
              </ul>
              <Button variant="outline" className="w-full rounded-full border-brand-200">Start for free</Button>
            </Card>

            {/* Growth */}
            <Card className="p-8 border-accent shadow-xl bg-white relative flex flex-col scale-105 z-10">
              <div className="absolute top-0 inset-x-0 h-1 bg-accent"></div>
              <div className="mb-8">
                <div className="inline-block px-3 py-1 bg-blue-50 text-accent text-xs font-bold uppercase tracking-wider rounded-full mb-4">Most Popular</div>
                <h3 className="text-lg font-semibold mb-2">Growth</h3>
                <div className="text-4xl font-bold mb-2">€299<span className="text-base font-normal text-brand-400">/mo</span></div>
                <p className="text-sm text-brand-500">For scaling SaaS and marketplaces.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-sm text-brand-600">
                <li className="flex gap-3"><Check className="w-5 h-5 text-accent shrink-0" /> 50,000 API calls / month</li>
                <li className="flex gap-3"><Check className="w-5 h-5 text-accent shrink-0" /> All endpoints & webhooks</li>
                <li className="flex gap-3"><Check className="w-5 h-5 text-accent shrink-0" /> Full European coverage (32)</li>
                <li className="flex gap-3"><Check className="w-5 h-5 text-accent shrink-0" /> Priority email support</li>
                <li className="flex gap-3"><Check className="w-5 h-5 text-accent shrink-0" /> Financials & UBO data</li>
              </ul>
              <Button className="w-full rounded-full bg-accent hover:bg-blue-700 text-white">Start 14-day trial</Button>
            </Card>

            {/* Enterprise */}
            <Card className="p-8 border-brand-100 bg-white flex flex-col">
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Enterprise</h3>
                <div className="text-4xl font-bold mb-2">Custom</div>
                <p className="text-sm text-brand-500">For financial institutions and high-volume use.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-sm text-brand-600">
                <li className="flex gap-3"><Check className="w-5 h-5 text-brand-400 shrink-0" /> Unlimited API calls</li>
                <li className="flex gap-3"><Check className="w-5 h-5 text-brand-400 shrink-0" /> Custom rate limits</li>
                <li className="flex gap-3"><Check className="w-5 h-5 text-brand-400 shrink-0" /> Dedicated account manager</li>
                <li className="flex gap-3"><Check className="w-5 h-5 text-brand-400 shrink-0" /> SLA (99.99% uptime)</li>
                <li className="flex gap-3"><Check className="w-5 h-5 text-brand-400 shrink-0" /> Bulk data extracts</li>
              </ul>
              <Button variant="outline" className="w-full rounded-full border-brand-200">Contact Sales</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust & Certifications */}
      <section className="py-20 border-t border-brand-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex items-center gap-8 text-brand-400 text-sm font-medium">
              <div className="flex items-center gap-2"><Shield className="w-5 h-5" /> GDPR Compliant</div>
              <div className="flex items-center gap-2"><Shield className="w-5 h-5" /> ISO 27001</div>
              <div className="flex items-center gap-2"><Shield className="w-5 h-5" /> SOC 2 Type II</div>
            </div>
            <div className="text-brand-500 text-sm">
              Servers hosted in Frankfurt, EU. Data never leaves Europe.
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-brand-900 text-center px-6">
        <h2 className="text-4xl font-bold text-white mb-6">Ready to build?</h2>
        <p className="text-brand-300 text-lg mb-10 max-w-2xl mx-auto">
          Join thousands of developers building the next generation of European B2B software. Get your API keys in seconds.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" className="bg-white text-brand-900 hover:bg-brand-50 rounded-full px-8 h-12 text-base font-semibold">
            Create free account
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base text-white border-brand-700 hover:bg-brand-800">
            Read Documentation
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-brand-100 text-sm text-brand-500">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="font-semibold text-brand-900 mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-accent" /> CompanyData
            </div>
            <p>The institutional-grade API for European company registry data.</p>
          </div>
          <div>
            <div className="font-semibold text-brand-900 mb-4">Product</div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-brand-900">API Reference</a></li>
              <li><a href="#" className="hover:text-brand-900">Coverage</a></li>
              <li><a href="#" className="hover:text-brand-900">Pricing</a></li>
              <li><a href="#" className="hover:text-brand-900">Changelog</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-brand-900 mb-4">Company</div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-brand-900">About us</a></li>
              <li><a href="#" className="hover:text-brand-900">Careers</a></li>
              <li><a href="#" className="hover:text-brand-900">Blog</a></li>
              <li><a href="#" className="hover:text-brand-900">Contact</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-brand-900 mb-4">Legal</div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-brand-900">Terms of Service</a></li>
              <li><a href="#" className="hover:text-brand-900">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-900">DPA</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center pt-8 border-t border-brand-100">
          <p>© {new Date().getFullYear()} CompanyData API. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
