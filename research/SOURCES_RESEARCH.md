# Company data sources research: Denmark, UK, Norway, Finland

_Last reviewed: 2026-05-04_

## Bottom line

If the goal is a **legally sellable API product** built from official/public registry data, the best MVP order is:

1. **Norway (Brønnøysund / Enhetsregisteret)**
2. **UK (Companies House)**
3. **Denmark (CVR via Datafordeler)**
4. **Finland (PRH/YTJ)**

Why:
- **Norway** is the cleanest combination of official API + full downloads + explicit open licence (**NLOD**) + incremental update endpoints.
- **UK** has very strong coverage and well-documented APIs/streams, but you must be more careful about **personal data carve-outs** and attribution / non-endorsement under OGL.
- **Denmark** looks commercially usable and surprisingly rich, but operational access is more annoying: API keys, some protected entities, older REST paths being phased out, and some anti-bot friction on public docs.
- **Finland** is the weakest for a broad commercial registry API because the public PRH/YTJ offering is more limited in scope, explicit bulk access is not obvious, and some deeper registry documents remain paid.

---

## Country-by-country

### 1) Norway — Brønnøysund Register Centre / Enhetsregisteret

**Official source**
- Enhetsregisteret open data API docs: `https://data.brreg.no/enhetsregisteret/api/dokumentasjon/no/index.html`

**Access methods**
- Public REST API
- Search/list endpoints
- Per-org lookup
- Bulk download endpoints for entities and sub-entities
- Bulk role download
- Incremental update endpoints

**API / bulk availability**
- Yes, clearly documented.
- Notable endpoints in the official docs:
  - `/api/enheter` search entities
  - `/api/enheter/{orgnr}` single entity
  - `/api/enheter/lastned` JSON bulk download
  - `/api/enheter/lastned/csv` CSV bulk download
  - `/api/underenheter/lastned` / `.../csv`
  - `/api/oppdateringer/enheter`
  - `/api/oppdateringer/underenheter`
  - `/api/oppdateringer/roller`
  - `/api/roller/totalbestand`

**Field coverage**
- Strong for core business-identity use cases:
  - organisation number
  - legal entity / sub-entity structure
  - organisation form
  - addresses / municipality linkage
  - industry codes
  - roles / representatives
  - status and related register metadata
- The docs explicitly describe entities, sub-entities, roles, organisation forms, municipalities, etc.

**Update cadence**
- Best of the four for sync design.
- Official docs expose dedicated **update endpoints** (`oppdateringer`), so you can do:
  - initial full load
  - then rolling incremental sync

**Commercial reuse / redistribution**
- Official docs state licence: **Norsk lisens for offentlige data (NLOD)**.
- This is generally friendly for commercial reuse and redistribution, subject to attribution / non-endorsement style conditions.
- Watch-out: there are also **authorised endpoints with national ID numbers** (`inklusive fødselsnummer`) — do **not** build your commercial product around personal identifiers unless you have a separate lawful basis and access grant.

**Practical verdict**
- **Best first country.**
- Strong legal clarity, bulk + delta sync, and solid coverage.

---

### 2) United Kingdom — Companies House

**Official sources**
- Developer hub: `https://developer.company-information.service.gov.uk/`
- API specs: `https://developer-specs.company-information.service.gov.uk/`
- OGL v3.0 text: `https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/`

**Access methods**
- Public REST APIs
- Streaming API
- Document API
- Live and sandbox environments

**API / bulk availability**
- Official hub says the public API returns **live, real-time** company data.
- Strongly documented API surface, including:
  - company profile
  - search
  - filing history
  - officers
  - registers
  - UK establishments
- Official streaming API exists with endpoints for:
  - `/companies`
  - `/filings`
  - `/insolvency-cases`
  - `/charges`
  - `/officers`
  - `/persons-with-significant-control`
  - `/disqualified-officers`
  - `/company-exemptions`
  - `/persons-with-significant-control-statements`
- I did **not** find a clearly surfaced free bulk snapshot page in the fetched sources, so for MVP planning I would assume:
  - full crawl / pagination to seed
  - then **streaming API** for ongoing updates

**Field coverage**
- Excellent.
- Official company profile spec includes rich fields such as:
  - company number / name
  - status / status detail
  - creation / cessation dates
  - confirmation statement status
  - accounts metadata
  - foreign company details
  - annotations
  - filing links and related references
- Combined with other endpoints, UK coverage is one of the broadest.

**Update cadence**
- Very good.
- Official developer hub says the data is **live and real-time**.
- Streaming API makes near-real-time ingestion practical.

**Commercial reuse / redistribution**
- OGL v3.0 is generally commercial-friendly:
  - you may copy, publish, distribute, adapt, and **exploit commercially**
  - you must attribute the source
  - you must avoid implying endorsement
- Important carve-outs in OGL:
  - **personal data is not covered** by the licence
  - logos / crests are excluded
  - third-party rights may be excluded
- For a sellable API, this means Companies House is viable, but your product and downstream terms should clearly distinguish:
  - open company/public register data
  - any personal-data fields that may require extra care, suppression, or separate legal analysis

**Practical verdict**
- **Very strong second country.**
- Great product value, but slightly more legal/policy work than Norway because of personal-data boundaries.

---

### 3) Denmark — CVR via Datafordeler / Erhvervsstyrelsen

**Official sources**
- Data portal: `https://datafordeler.dk/`
- CVR data overview pages under Datafordeler
- CVR usage terms page: `https://datafordeler.dk/vejledning/brugervilkaar/det-centrale-virksomhedsregister-cvr/`

**Access methods**
- Datafordeler access with user + IT system + API key / OAuth-style setup
- GraphQL
- HTTPS pre-generated file downloads
- Legacy REST services
- Event access via GraphQL entity

**API / bulk availability**
- Yes.
- Official Datafordeler CVR pages expose:
  - **CVR Fildownload** (JSON, CSV)
  - **CVR GraphQL**
  - **CVR GraphQL schema**
  - **HentCVRData** (REST, marked as phasing out by end of 2026)
  - event access via **`CVR_Events`** entity in GraphQL
- Coverage examples listed on the official page include entities such as:
  - addresses
  - industry
  - unit (`Enhed`)
  - company (`Virksomhed`)
  - production unit (`Produktionsenhed`)
  - names
  - phone / fax / email
  - participation / responsible participant relations
  - advertising protection
  - employment data
  - credit information

**Field coverage**
- Rich and business-useful.
- Better than Finland, likely comparable to Norway for core registry + establishment structure use cases.
- Especially attractive if you want company + establishment + contact-ish metadata in one country source.

**Update cadence**
- Good, but less neatly documented than Norway.
- Official pages explicitly mention **events** via `CVR_Events`, which is promising for incremental sync.
- Also supports pre-generated bulk files.

**Commercial reuse / redistribution**
- Official CVR user-terms page says: **CC BY 4.0 applies to free basic data**.
- That is commercially friendly: you may fetch, share, and adapt the data, with attribution.
- Official wording says you must credit **Det Centrale Virksomhedsregister (CVR)** appropriately.
- Important limitation: some data is **fortrolig** / protected. Official page notes the **Person** entity is confidential and requires additional request / stronger authentication.

**Operational cautions**
- More moving parts than Norway/UK.
- Access setup is more platform-ish than simple public API signup.
- Public docs had some anti-bot friction during research.
- REST paths are being phased out; prefer GraphQL + file downloads + events for anything new.

**Practical verdict**
- **Good third country.**
- Legally usable and data-rich, but a bit more operationally awkward.

---

### 4) Finland — PRH / YTJ open data

**Official source**
- Open data portal: `https://avoindata.prh.fi/en.html`

**Access methods**
- Public API portal with Swagger UIs for:
  - YTJ basics
  - registered notices
  - digital financial statement data
- Public documentation pages available on the PRH open-data portal

**API / bulk availability**
- API: yes.
- Bulk download: **not clearly advertised** in the fetched official material.
- The public portal presents API families, but not a clearly obvious full-country bulk dump equivalent to Norway or Denmark.

**Field coverage**
- More limited / segmented than the others.
- Official portal says the public APIs cover:
  - **YTJ basic company/community data** for entities entered in the Trade Register
  - information on which Tax Administration registers the company is entered in
  - **registered notices** in the Trade Register (from **7 Nov 2014** onward)
  - **digital financial statement data** only where filed in **iXBRL**
- It also explicitly says other financial statements can be bought from **Virre**, which is a sign the free public layer is not the whole registry product.

**Update cadence**
- Not clearly stated in the fetched source.
- Because notices and filings are registry-based, freshness may be decent, but I would not assume high-quality incremental sync until tested.

**Commercial reuse / redistribution**
- Official portal says when using the data, **mention the original source**.
- It also says you may **not use PRH or YTJ logos** or make your service look confusingly like PRH’s own services.
- The fetched official source did **not** surface a broad open licence text as clearly as Norway/UK/Denmark do.
- This does not mean reuse is forbidden, but it does mean I would want a tighter legal read before making Finland a launch market.

**Practical verdict**
- **Weakest MVP country** of the four.
- Fine as a later add-on, not my first launch source.

---

## Recommended MVP launch order

### Best first wave: Norway + UK

This is the best balance of:
- official source quality
- commercial reuse clarity
- sync architecture
- customer value

**Why Norway first**
- Explicit open licence
- Clear bulk + delta mechanics
- Low legal ambiguity
- Easy to explain to customers

**Why UK second**
- Huge market value and recognition
- Excellent breadth of company data
- Real-time + streaming
- Only real downside is careful handling of personal-data edges

### Second wave: Denmark

Add once your ingestion framework already supports:
- API key / account-based registry access
- bulk files
- event-based updates
- licence attribution handling per source

### Third wave: Finland

Add later if:
- customers specifically ask for it
- your value prop can work with more limited free coverage
- you are willing to supplement with paid sources for deeper filings / documents

---

## What I would actually build

### Start with these official sources
- **Norway:** Enhetsregisteret open data API + bulk + update endpoints
- **UK:** Companies House public REST API + Streaming API
- **Denmark:** CVR GraphQL + CVR Fildownload + CVR_Events

### Defer / be cautious with
- **Finland** as a core MVP geography
- any **personal identifier** fields in Norway/Denmark protected endpoints
- UK fields that could fall under **personal data** limits rather than the general OGL layer

---

## Practical legal/product rules for a sellable API

Across all four, the safe commercial pattern is:
- store raw-source provenance per record/field
- expose clear attribution in docs / API terms
- do not use agency logos or imply endorsement
- exclude or separately govern protected personal identifiers
- keep per-country licensing notes in your schema/catalog
- build source-level deletion/suppression handling where required

Suggested attribution examples:
- **Norway:** “Contains data from Brønnøysundregistrene, licensed under NLOD.”
- **UK:** “Contains public sector information licensed under the Open Government Licence v3.0.”
- **Denmark:** “Contains CVR data from Erhvervsstyrelsen / Datafordeler, licensed under CC BY 4.0.”
- **Finland:** cite PRH/YTJ as source and avoid PRH/YTJ branding confusion.

---

## Final recommendation

If you want the **fastest path to a legally defensible commercial API**, do this:

1. **Launch Norway first**
2. **Add UK immediately after**
3. **Add Denmark once ingestion/auth/event handling is mature**
4. **Treat Finland as optional / later-phase**

If you only pick **two** countries for MVP, pick:
- **Norway**
- **UK**

If you pick **three**, add:
- **Denmark**

That is the best tradeoff between marketability, legal clarity, and engineering effort.

---

## Source notes used

- Norway Enhetsregisteret API docs explicitly list open-data endpoints, total downloads, update endpoints, and licence = **NLOD**.
- UK Companies House developer hub states the API data is **live and real-time**; official specs show broad endpoint coverage; streaming API is officially documented; OGL v3.0 permits commercial reuse with attribution and excludes personal data.
- Denmark Datafordeler CVR pages show **Fildownload**, **GraphQL**, **GraphQL schema**, legacy REST, and **CVR_Events**; CVR user terms page says **CC BY 4.0** for free basic data with attribution.
- Finland PRH open-data portal says public APIs provide YTJ basic data, registered notices from **2014-11-07**, and digital financial statements only for **iXBRL** filings; source attribution is required and PRH/YTJ branding must not be used in a misleading way.
