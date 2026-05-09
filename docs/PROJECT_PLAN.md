# European Company Data Platform

## Vision
Build a licensable European company data platform that aggregates business records from multiple public and semi-open sources across Europe, normalizes them into a unified schema, and sells access via API with Stripe-based billing.

## Step 1 — MVP countries
Recommended first countries:
1. Denmark
2. United Kingdom
3. Norway
4. Finland
5. France (phase 1.5 if source handling is acceptable)

Why these first:
- relatively strong registry/data access patterns
- useful spread across Nordic + major European market
- enough variance to validate the normalization model
- realistic for a first commercial API

## Step 2 — Source map approach
For every country we need a source registry with:
- source name
- legal owner
- access method (API, dump, CSV, scrape, manual)
- license terms
- commercial reuse allowed?
- redistribution allowed?
- attribution required?
- update cadence
- field coverage
- quality score

## Step 3 — Core data model
Core entities:
- companies
- company_identifiers
- company_addresses
- company_activities
- company_officers
- source_records
- change_log
- api_customers
- api_keys
- subscriptions
- usage_events

## Step 4 — API product
Initial API endpoints:
- GET /companies/search
- GET /companies/:id
- GET /companies/by-registration/:country/:registrationNumber
- GET /companies/by-vat/:vatNumber
- GET /companies/:id/changes
- GET /countries
- GET /health

## Step 5 — Commercial model
Free:
- 100 requests/month
- basic fields only
- low rate limit
- no bulk

Starter:
- 10,000 requests/month
- moderate rate limit
- basic enrichment

Growth:
- 100,000 requests/month
- changes feed
- batch enrichment

Enterprise:
- custom pricing
- bulk access
- SLA
- dedicated support

## Step 6 — Build plan
Phase 1:
- source registry
- schema
- ingestion for 2 countries
- auth + API keys
- Stripe integration
- usage metering
- docs portal

Phase 2:
- 4–6 countries
- better deduplication
- change tracking
- alerting

Phase 3:
- 10+ countries
- bulk exports
- enterprise features
