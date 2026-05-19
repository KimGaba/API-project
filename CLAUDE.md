# Company Data API — CLAUDE.md

European company data platform. Ingests official government registries and exposes them via a unified REST API.

## Services og porte

| Service | Port | Beskrivelse |
|---|---|---|
| Public site (nginx) | 3010 | Marketing site — `site/` |
| API (Fastify) | 3011 | REST API — `apps/api/` |
| Dashboard (React) | 3012 | Bruger-dashboard — `apps/dashboard/` |
| Admin (React) | 3013 | Ops-panel — `apps/admin/` |
| Adminer (DB browser) | 3014 | Direkte database-adgang |
| PostgreSQL | 55432 | Primær database |
| Redis | 56379 | Cache/sessions |

## Hurtige kommandoer

```bash
# Start alt
docker compose up -d

# Fuld Norge sync (kører automatisk hverdage kl. 06:00 DK-tid)
docker compose run --rm worker-no \
  sh -lc "pip install -r requirements.txt -e . -q 2>/dev/null && \
  PYTHONPATH=src python -m company_data_workers.ingest_norway.cli ingest-bulk --batch-size 500"

# Lille Norge test (200 records via paging)
docker compose run --rm -e NORWAY_SOURCE_MODE=live worker-no \
  sh -lc "pip install -r requirements.txt -e . -q 2>/dev/null && \
  PYTHONPATH=src python -m company_data_workers.ingest_norway.cli ingest-db --limit 200"

# Migrations
docker compose run --rm migrate

# Logs
tail -f logs/norway-sync.log
```

## Database

- PostgreSQL 16, database: `company_data_dev`
- User: `company_data` / `company_data_dev`
- Migrations: `packages/db/migrations/` (kørte via `migrate`-service)
- Vigtige tabeller: `companies`, `source_registry`, `ingestion_runs`, `source_records`, `company_addresses`, `company_activities`

## Ingest-arkitektur

Alle workers følger samme mønster:
1. `source.py` — henter data fra officiel kilde
2. `normalize.py` — mapper til `NormalizedCompany`
3. `db_ingest.py` — upsert til Postgres + logger til `ingestion_runs`
4. `cli.py` — CLI-kommandoer: `fetch`, `normalize`, `ingest-db`, `ingest-bulk`

## Norge (NO) — Brønnøysundregistrene ✅ LIVE

- **API:** `https://data.brreg.no/enhetsregisteret/api/enheter`
- **Bulk download:** `https://data.brreg.no/enhetsregisteret/api/enheter/lastned` (197MB gzip, ~1,16M virksomheder)
- **Licens:** NLOD 2.0 — fri kommerciel genbrug ✅
- **Auth:** Ingen
- **Cron:** Hverdage kl. 06:00 DK-tid
- **Worker:** `workers/src/company_data_workers/ingest_norway/`

---

## Roadmap: EU-lande

### Fase 1 — Ingen auth, klar til implementation

#### Danmark (DK) — CVR
- **Antal:** ~700.000 aktive virksomheder
- **API:** Elasticsearch på `http://distribution.virk.dk` (kræver gratis registrering på virk.dk)
- **Alternativ:** `https://cvrapi.dk` (rate-limited men ingen registrering)
- **Bulk:** XML-dump tilgængeligt efter registrering
- **Licens:** Dansk åbn data-licens, fri genbrug ✅
- **Sværhedsgrad:** ⭐⭐ (let — registrering + samme mønster som NO)

#### Finland (FI) — PRH/YTJ
- **Antal:** ~818.000 virksomheder
- **API:** `https://avoindata.prh.fi/opendata-ytj-api/v3/companies` — åben, ingen auth
- **Bulk:** Pagineret API (ingen enkelt bulk-fil, men simpelt at loope)
- **Licens:** CC BY 4.0 ✅
- **Sværhedsgrad:** ⭐ (nemmest efter Norge — ingen auth, fungerende API)

#### Frankrig (FR) — INSEE Sirene
- **Antal:** ~12 millioner virksomheder (størst i EU)
- **API:** `https://recherche-entreprises.api.gouv.fr` — åben, ingen auth
- **Bulk download:** `https://www.data.gouv.fr/fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/` (CSV, ~3GB)
- **Licens:** Etalab open licence ✅
- **Sværhedsgrad:** ⭐⭐ (stor dataset, men API er simpel)

### Fase 2 — Kræver gratis registrering/API-nøgle

#### Belgien (BE) — CBE Open Data
- **Antal:** ~1,5 millioner virksomheder
- **Download:** Månedlige CSV-dumps på `economie.fgov.be`
- **Auth:** Gratis registrering
- **Licens:** Open data ✅
- **Sværhedsgrad:** ⭐⭐⭐ (CSV-format, kræver login)

#### Holland (NL) — KVK
- **Antal:** ~2,4 millioner virksomheder
- **API:** REST API med gratis API-nøgle fra `kvk.nl`
- **Licens:** Åben men med betingelser
- **Sværhedsgrad:** ⭐⭐⭐ (API-nøgle, rate limits)

#### Sverige (SE) — Bolagsverket
- **Antal:** ~1,1 millioner virksomheder
- **API:** Kræver registrering, delvist gratis
- **Sværhedsgrad:** ⭐⭐⭐

#### Irland (IE) — CRO
- **Antal:** ~300.000 virksomheder
- **API:** `https://api.cro.ie` — gratis registrering
- **Sværhedsgrad:** ⭐⭐⭐

### Fase 3 — Kompleks eller betaling

#### Tyskland (DE) — Handelsregister
- **Antal:** ~5 millioner virksomheder
- **Status:** Delvist åbnet i 2023 (`handelsregister.de`), men API er umodent
- **Sværhedsgrad:** ⭐⭐⭐⭐⭐

#### Spanien (ES), Italien (IT)
- Meget begrænsede/dyre offentlige APIs
- Kræver typisk tredjeparts-aggregatorer

---

## Foreslået implementeringsrækkefølge

1. **Finland** — 1-2 dage, ingen auth, ~818K virksomheder
2. **Danmark** — 2-3 dage, gratis registrering, ~700K virksomheder
3. **Frankrig** — 3-4 dage, ingen auth, 12M virksomheder (stort men vigtigt)
4. **Belgien + Holland** — 3-4 dage per land
5. **Sverige + Irland** — 3-4 dage per land
6. **Tyskland** — separat projekt, kompleks

Fase 1 alene giver dækning af **~14 millioner europæiske virksomheder**.
