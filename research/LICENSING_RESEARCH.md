# Licensing Research: Building and Selling an API from European Company Registry Data

> **Not legal advice.** This is a practical product/compliance memo for screening sources before ingesting registry data into a commercial API.

## Executive summary

If you want to build a paid API on top of European company registry data, the biggest mistake is assuming that **"publicly accessible" means "freely reusable and resellable."** It often does not.

The main risk buckets are:

1. **Source-specific contract / terms of use**
   - Many registries allow viewing/searching but restrict bulk download, redistribution, resale, automated collection, or API mirroring.

2. **EU copyright + sui generis database right**
   - Even where individual facts about companies are not protected, the **database as a whole** may be protected against extraction/re-utilisation of substantial parts.

3. **Public-sector/open-data rules are helpful but not universal**
   - Some public data is reusable for commercial purposes, and the EU Open Data framework pushes in that direction.
   - But implementation varies by country, by dataset, and by delivery channel.
   - A registry website can still have operational restrictions even if some underlying data is open.

4. **Personal data / privacy**
   - Company records often include directors, beneficial owners, sole traders, addresses, dates of birth fragments, signatures, filing contacts, etc.
   - A source licence can permit reuse while privacy law still limits what you should expose, retain, combine, or republish.

5. **Scraping risk**
   - Scraping an official website is much riskier than using an official bulk file or official API with explicit reuse terms.
   - The legal problem is usually not "facts are copyrighted"; it is contract, database right, anti-circumvention, access restrictions, and operational abuse.

My opinionated default:

- **Green**: only sources with explicit commercial reuse rights, clear redistribution posture, and no meaningful scraping ambiguity.
- **Yellow**: sources with partial clarity (view access, internal-use rights, unclear resale, or personal-data complications).
- **Red**: scraping-only sources with restrictive terms, login/paywall/captcha barriers, anti-bot language, or unclear reseller rights.

---

## Core legal concepts to keep in mind

### 1) Facts vs databases

Basic company facts (name, number, incorporation date, status) are usually not protected as standalone facts. But the **selection, arrangement, structure, and especially the investment in obtaining/verifying/presenting the data** may still be protected.

### 2) EU sui generis database right

Under the EU database regime, the maker of a database may prevent **extraction and/or re-utilisation of all or a substantial part** of the database when there has been substantial investment in obtaining, verifying, or presenting the contents.

Practical consequence:

- You may be fine copying isolated records.
- You may be in trouble if you ingest large volumes, regularly sync, or recreate a commercially useful subset from a protected source.
- Repeated extraction of insubstantial parts can also become risky if it effectively substitutes for taking a substantial part over time.

### 3) Copyright is usually secondary, but not irrelevant

Most registry data products are not risky because each company row is creative. The bigger issue is usually database right and contract. Still, some surrounding materials can be copyrighted:

- filing document images/PDFs
- registry text summaries
- site content, schema docs, annotations
- logos/seals/branding

### 4) Open-data / PSI rules can help, but check the exact implementation

The EU Open Data / PSI framework supports commercial reuse of public-sector information and pushes governments toward open formats, APIs, and high-value datasets. It is favorable in spirit.

But for a product team, the only safe rule is:

> **Treat each jurisdiction and each dataset as a separate licensing decision.**

Do not assume that because one country publishes company data openly, another does too.

### 5) Privacy still matters even for official records

Public availability is not the same as unlimited downstream use.

Particularly sensitive fields:

- full birth dates or birth month/year
- residential addresses
- director/officer identities
- sole proprietor details
- beneficial ownership / UBO data
- historic filings that contain signatures, emails, phone numbers, passport-like identifiers, or free-text disclosures

For a paid API, ask not only **"may we ingest this?"** but also **"should we expose this field externally?"**

---

## What to track for every source

Create a source register. For each source, track the following fields.

## Source intake template

### A. Identity and provenance

- Source name
- Country / jurisdiction
- Operator (government registry, court, ministry, public undertaking, private vendor, chamber, aggregator)
- Official URL(s)
- Access channel
  - website search
  - official API
  - official bulk dump
  - paid data feed
  - third-party reseller
- Whether it is the **system of record** or an intermediary

### B. Rights / licensing

- Exact licence / terms URL
- Date reviewed
- Version number or page snapshot reference
- Is commercial use explicitly allowed?
- Is redistribution allowed?
- Is sublicensing allowed?
- Is resale or "value-added service" explicitly allowed?
- Are bulk download and local caching allowed?
- Are derivative databases allowed?
- Are there restrictions on copying only via certain channels (API allowed, website scraping forbidden)?
- Termination clause / right to revoke
- Governing law / venue

### C. Attribution / notice requirements

- Required attribution statement
- Link-back requirement
- Requirement to mention last update date
- Requirement to indicate modifications
- Requirement not to imply endorsement
- Whether multiple-provider attribution can be consolidated in a notices page

### D. Operational restrictions

- Robots.txt status
- Anti-scraping / no automated access clause
- API rate limits / quotas
- Need for account, key, paid contract, or manual approval
- CAPTCHAs, session controls, IP restrictions
- Whether technical controls would need to be bypassed
- Whether the source forbids mirror services or competitive use

### E. Data protection / field risk

- Does the dataset contain personal data?
- Which specific fields are personal?
- Any special-category data? (usually should be none; if yes, stop)
- Any minors / vulnerable-person exposure risk?
- Any publication caveats from the source?
- Retention expectations
- Need for field suppression or tiered access

### F. Quality / compliance evidence

- Screenshot or archived copy of the terms reviewed
- Sample payload retained
- Notes on data freshness
- Confidence score on rights clarity
- Reviewer / approver name
- Next review date

---

## Common redistribution risks

These are the patterns that most often break a commercial registry-data product.

### 1) "Search allowed" is not "API resale allowed"

A registry may allow manual search by the public while prohibiting:

- bulk extraction
- systematic harvesting
- republication of substantial parts
- commercial redistribution
- creating a competing database/API

### 2) Official API access does not automatically include resale rights

An API may be official, documented, and stable while still limiting use to:

- internal business purposes
- compliance workflows
- non-redistributable outputs
- attribution-bound use only

Always separate:

- **access right**
- **reuse right**
- **redistribution right**
- **resale right**

### 3) Paid access is not the same as a licence to resell

If you pay for records, that often buys:

- access
- download rights for your organization
- maybe internal operational use

It often **does not** buy:

- sublicensing
- white-label API redistribution
- resale of raw or near-raw records

### 4) Database-right exposure from rebuilding a national register mirror

Even if you pull one record at a time, a product that reconstructs a meaningful share of a registry can look like extraction/re-utilisation of a substantial part.

Risk goes up when you:

- sync the full population
- store historic snapshots
- expose search across the copied corpus
- provide bulk export
- offer the same core fields the registry offers, at scale

### 5) Personal data republishing is often the hidden blocker

A source may permit reuse generally but not solve GDPR posture for downstream publication.

Common issue: a field is lawful to view for a specific transparency purpose, but exposing it in a frictionless commercial API increases privacy risk beyond the original context.

### 6) Third-party rights inside official records

Official sources can contain embedded third-party material:

- scanned filings
- financial statements prepared by companies
- logos
- attachments
- documents submitted by notaries or agents

You may have stronger rights over structured metadata than over full document images/PDFs.

### 7) Mixed-licence contamination

Combining sources without clear lineage creates downstream problems:

- one source requires attribution
- another forbids redistribution
- another allows commercial use but excludes personal data
- a reseller contract forbids combining with competitor sources

If lineage is lost, your output becomes hard to defend.

---

## Attribution issues to watch

Attribution sounds minor until it becomes operationally annoying. Track it from day one.

### Typical attribution obligations

- credit the source/operator
- link to the licence
- preserve source notices
- mark that you modified / normalized / enriched data
- avoid implying official endorsement

### Product design recommendations

- Keep a **machine-readable attribution registry** per field/source.
- Add a public **Data Sources & Notices** page.
- For API responses, include optional metadata fields such as:
  - `source_name`
  - `source_url`
  - `source_licence`
  - `retrieved_at`
  - `transformed_by_us`
- If one source requires record-level attribution, do not rely only on a generic footer.

### Important edge case

Some open-government licences are permissive but exclude:

- personal data
- logos/crests
- third-party rights
- endorsement

So "openly licensed" does **not** mean every field or attached document is safe to redistribute.

---

## Scraping concerns

If the product plan relies on scraping official registry websites, assume elevated risk until proven otherwise.

### Red flags

- Terms prohibit automated collection, scraping, robots, spiders, or systematic retrieval
- Login required / paid account / contractual portal
- CAPTCHA, anti-bot, session hardening, rate throttles
- Site offers an official API or paid feed instead
- Terms prohibit copying substantial parts or creating competing services
- The site exposes data only page-by-page while bulk/data-feed rights are sold separately

### Why scraping is worse than using an official feed

Because your exposure is cumulative:

- breach of website terms
- database-right claim
- possible access/circumvention arguments
- IP blocks or service disruption
- poor evidence trail for permissions
- weak position in enterprise diligence or M&A diligence

### Practical scraping rule

Use scraping only when all of the below are true:

1. No better official channel exists.
2. Terms do not prohibit the automation you plan.
3. Rights to commercial reuse and redistribution are still clear.
4. No technical controls are bypassed.
5. You can throttle respectfully and preserve logs.

If any of those fail, classify as **yellow** or **red**, not green.

---

## Green / Yellow / Red source approval framework

## GREEN — Approved for ingestion into a commercial API

Use when **all or nearly all** of the following are true:

- Explicit licence or law clearly permits commercial reuse.
- Redistribution/resale is expressly allowed, or clearly unavoidable from the licence text.
- Bulk/API access is officially provided.
- No anti-scraping issue because you are using the permitted channel.
- Attribution obligations are manageable.
- Personal-data exposure is low or can be cleanly filtered.
- There is no meaningful ambiguity about whether you may build a downstream paid API.

Typical green examples:

- Official open-data dataset with explicit commercial reuse rights
- Official API under a permissive government licence with workable attribution
- Official bulk release designated for reuse

### Green approval notes to record

- licence URL and snapshot
- exact fields approved
- whether raw redistribution is allowed or only transformed output
- required attribution text
- privacy suppressions applied
- review date

## YELLOW — Limited/conditional approval

Use when the source is valuable but one or more issues remain unresolved.

Typical yellow scenarios:

- commercial use appears allowed, but redistribution/resale is unclear
- API terms are silent on sublicensing
- public-sector source exists, but national implementation is unclear
- structured metadata seems reusable, but attached filings/docs are not
- personal-data fields need product/legal review before exposure
- website access is public, but automated collection rules are ambiguous
- a paid contract may solve the issue, but you do not have that contract yet

### Yellow handling rules

- Do not expose raw source records externally yet.
- Ingest only into a quarantined/internal dataset if necessary.
- Suppress sensitive fields by default.
- Seek written clarification or commercial terms.
- Prefer switching to a licensed reseller or official data feed.

## RED — Do not use for commercial API output

Use when any of the below are true:

- terms prohibit redistribution, resale, mirroring, or automated extraction
- access depends on bypassing technical controls or CAPTCHAs
- only manual search access is granted
- source licence is absent and operator intent is clearly restrictive
- the source is a paid portal selling per-record access with no resale rights
- there is major database-right risk from reconstructing the corpus
- personal-data risk is high and core product value depends on republishing it
- source lineage is too messy to prove rights

### Red handling rules

- Do not scrape into production.
- Do not ship fields from this source in the paid API.
- Replace with a licensed source or explicit partner agreement.

---

## Decision tree for each source

1. **What is the channel?**
   - Official open dataset / official API / official bulk / website only / third-party vendor

2. **Do we have explicit commercial reuse rights?**
   - If no -> yellow or red

3. **Do we have explicit redistribution or resale rights?**
   - If no -> yellow by default, red if terms point the other way

4. **Are we relying on scraping?**
   - If yes, check anti-automation terms and technical barriers
   - If prohibited or blocked -> red

5. **Could our use recreate a substantial part of a protected database?**
   - If yes and no explicit licence covers it -> red

6. **Does the data include personal data?**
   - If yes, define field-level publication rules before launch

7. **Can we satisfy attribution and notices at scale?**
   - If no -> yellow until fixed

8. **Can we prove lineage later?**
   - If no -> yellow/red, depending on risk

---

## Field-level policy recommendations

Do not treat a source as all-or-nothing. Approve by field category.

### Usually lower risk

- company number
- registered name
- legal form
- incorporation date
- status
- registered office city/country
- filing dates
- registry identifiers

### Medium risk

- full registered address
- industry codes where source-specific rights may apply
- ownership chains aggregated across multiple sources
- historical changes and event timelines

### Higher risk

- directors/officers as API-searchable people index
- beneficial owners / UBO information
- dates of birth fragments
- residential addresses
- document images/PDFs
- full-text filings
- extracted signatures/emails/phone numbers

My recommendation: keep **document images and person-centric search** on a separate approval track. They create disproportionate legal and reputational risk compared with plain entity facts.

---

## Practical operating model for a startup/team

### 1) Maintain source lineage at record and field level

Every normalized record should be able to answer:

- which source(s) contributed this field?
- under what licence/terms?
- when was it fetched?
- via what channel?
- what transformation did we apply?

Without lineage, you cannot confidently satisfy attribution, delete a risky source, or answer diligence questions.

### 2) Separate raw, normalized, and public layers

- **Raw layer**: access-controlled, stores source payloads and licence evidence
- **Normalized layer**: structured internal representation
- **Public API layer**: only fields approved for external redistribution

This separation makes it easier to quarantine yellow/red sources.

### 3) Require written approval for yellow sources

A useful internal standard:

- Green: product/compliance approval
- Yellow: legal/commercial review required before external release
- Red: blocked absent new licence or partnership

### 4) Prefer explicit licences over clever arguments

Yes, there are arguments about public facts, insubstantial extraction, and public-interest transparency. Those arguments are weak substitutes for a clean licence when you want to sell an API at scale.

Enterprise buyers and acquirers care about the paper trail.

---

## Examples of how to think about sources

## Example A: Official open-data API with explicit commercial reuse licence

Classification: **Green**

If the source says, in substance:

- commercial reuse allowed
- copying/adapting allowed
- attribution required
- no endorsement
- some exclusions for personal data / logos / third-party rights

Then the remaining work is mostly:

- field filtering
- attribution implementation
- documenting exclusions

## Example B: Official registry website with search pages, no clear API resale rights, anti-bot terms

Classification: **Red**

Even if the underlying facts are public, scraping and republishing at scale is a bad foundation for a paid API.

## Example C: Official paid bulk feed or reseller contract that allows internal use but is silent on sublicensing

Classification: **Yellow**

Good candidate for commercial negotiation. Do not assume silence equals permission.

## Example D: Official company metadata open, but filings/PDFs unclear

Classification: **Green for structured metadata / Yellow or Red for documents**

Split approval by asset type.

---

## Notes from the sources reviewed

### EU database protection

The EU framework recognizes protection for databases through:

- **copyright in the structure** where there is original intellectual creation; and/or
- **sui generis database right** where there has been substantial investment in obtaining, verifying, or presenting the contents.

Operational takeaway: a registry mirror or large-scale sync can create extraction/re-utilisation risk even if individual company facts are not themselves protected.

### EU Open Data / PSI direction

The EU Open Data framework is pro-reuse and commercially favorable in principle. It promotes reusable public-sector information, open/machine-readable formats, APIs, and high-value datasets. Importantly for this project, "companies and company ownership" is within the high-value-dataset policy area.

Operational takeaway: this supports a strategy of preferring official open-data channels where available, but it does **not** remove the need to verify the exact national implementation and terms for each source.

### UK Open Government Licence example

The UK Open Government Licence v3.0 is a good example of a genuinely workable public licence for commercial reuse. It permits copying, publishing, distributing, adapting, and exploiting the information commercially, subject mainly to attribution and non-endorsement. But it explicitly does **not** cover personal data, logos/crests, or third-party rights the provider cannot license.

Operational takeaway: even a permissive government licence still needs field-level filtering and notices.

---

## Recommended approval checklist before any source goes live

- [ ] Terms/licence page saved and linked
- [ ] Commercial reuse confirmed
- [ ] Redistribution/resale confirmed
- [ ] Approved access channel identified
- [ ] No prohibited scraping or circumvention
- [ ] Database-right exposure assessed
- [ ] Personal-data fields reviewed
- [ ] Document/PDF rights reviewed separately
- [ ] Attribution text implemented
- [ ] Lineage capture implemented
- [ ] Review owner assigned
- [ ] Next review date set

---

## Bottom line

If the goal is a business that sells an API, optimize for **defensible rights** rather than maximum theoretical access.

Best path:

1. Prefer official APIs, bulk files, or explicit open-data licences.
2. Track rights per source and per field.
3. Treat redistribution/resale as a separate permission that must be proven.
4. Keep personal-data exposure narrow.
5. Avoid scraping registry websites unless the terms and rights are unusually clear.

The product can survive incomplete coverage. It does not survive a core-data strategy built on sources you cannot legally resell.

---

## References reviewed

- European Union / Your Europe: **Database protection in the EU**  
  https://europa.eu/youreurope/business/running-business/intellectual-property/database-protection/index_en.htm

- EUR-Lex summary: **Directive (EU) 2019/1024 on open data and the re-use of public-sector information**  
  https://eur-lex.europa.eu/EN/legal-content/summary/open-data-and-the-reuse-of-public-sector-information.html

- European Commission: **European legislation on open data**  
  https://digital-strategy.ec.europa.eu/en/policies/legislation-open-data

- UK National Archives: **Open Government Licence v3.0**  
  https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/

- Companies House developer overview (useful as an example of official API channel; rights still must be checked separately in implementation docs/licence context)  
  https://developer.company-information.service.gov.uk/overview/
