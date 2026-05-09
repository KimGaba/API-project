# Google sign-in auth direction (MVP)

This project already has:
- static public site in `site/`
- Vite React customer dashboard in `apps/dashboard`
- Fastify API in `apps/api`
- PostgreSQL as the system of record
- API-key based product auth for customer requests

That stack matters.

## Recommendation

**Use Google OAuth handled by the Fastify API, with Postgres-backed app sessions and first-class local user/account tables.**

For this project's current shape, that is the most pragmatic MVP path.

### Why this is the best fit now

- **Local-first**: no mandatory hosted auth dependency just to sign in locally.
- **Fits the existing backend**: Fastify already owns API auth-ish concerns, usage logging, billing scaffolding, and customer records.
- **Avoids a premature framework rewrite**: Auth.js/NextAuth is strongest in Next.js. This project is not a Next.js app.
- **Keeps customer identity and API ownership in one DB**: useful for later billing, team access, audit logs, and API key management.
- **Leaves room to swap later**: if the product later consolidates into Next.js, Auth.js becomes a more attractive migration.

---

## Decision on providers/libraries

### 1. Recommended now: **custom Google OAuth on Fastify**

Use:
- Google OAuth 2.0 / OpenID Connect
- Fastify callback endpoints
- signed, `httpOnly` session cookie
- session table in Postgres
- customer/user/account membership tables in Postgres

Suggested building blocks:
- `@fastify/cookie`
- `@fastify/oauth2` or direct OAuth/OIDC flow with a small wrapper
- Node `crypto` for session token hashing

This is the cleanest fit for the current repo.

### 2. Auth.js / NextAuth

**Not my recommendation for this exact stack today.**

Why:
- best fit is Next.js App Router / Pages Router
- this repo currently uses Vite React + Fastify, not Next.js
- using Auth.js here would likely mean either:
  - adding a separate auth server surface, or
  - partially replatforming the dashboard/public site

When it becomes a good idea:
- if `site/` and `apps/dashboard` move into one Next.js app
- if SSR, middleware-protected routes, and unified app routing become a priority

### 3. Clerk

Good product, but **not my recommendation for the MVP here**.

Why not now:
- hosted dependency for a problem you can solve locally with your existing backend
- adds cost and product coupling early
- overkill before team/org management is real

Use Clerk later only if you decide you want:
- polished hosted auth UI
- org/team management quickly
- less backend auth ownership

### 4. Supabase Auth

Reasonable, but still **not the best fit here**.

Why:
- your source of truth is already plain Postgres with a custom API
- Supabase Auth is nicest when you are also leaning into more of Supabase's stack
- it introduces another auth model alongside your existing `customers` / `subscriptions` / `api_keys` model

Use it only if you want a broader shift toward Supabase-managed auth and related services.

### 5. Another fit?

If you really want a library-heavy self-hosted auth layer later, **Better Auth** would be more relevant to this stack than Auth.js, because it is not tied to Next.js in the same way.

But for MVP, I would still keep it simpler:
**plain Google OAuth + your own session tables**.

---

## MVP auth model

Separate these concepts clearly:

1. **customer** = billing/account container
2. **user** = a human who can sign in
3. **membership** = user belongs to customer account/workspace
4. **oauth account** = Google identity linked to a user
5. **session** = browser login state for dashboard/public account flows
6. **api key** = machine credential for API requests

That keeps browser auth and API auth separate, which is correct for this product.

---

## Required schema changes

Current schema has `customers` but no real human login model.

Add these tables.

### `users`
One row per human.

Suggested columns:
- `id UUID PK`
- `email CITEXT NOT NULL UNIQUE`
- `name TEXT`
- `avatar_url TEXT`
- `email_verified_at TIMESTAMPTZ`
- `status TEXT NOT NULL DEFAULT 'active'`
- `last_login_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### `oauth_accounts`
Links a local user to Google.

Suggested columns:
- `id UUID PK`
- `user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- `provider TEXT NOT NULL` (`google` first)
- `provider_account_id TEXT NOT NULL` (Google `sub`)
- `email CITEXT`
- `access_token_encrypted TEXT` or omit for MVP
- `refresh_token_encrypted TEXT` or omit for MVP
- `token_expires_at TIMESTAMPTZ` or omit for MVP
- `id_token_encrypted TEXT` or omit for MVP
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- unique `(provider, provider_account_id)`

### `customer_memberships`
Maps users to customer accounts/workspaces.

Suggested columns:
- `id UUID PK`
- `customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE`
- `user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- `role TEXT NOT NULL DEFAULT 'owner'`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- unique `(customer_id, user_id)`

Role values for MVP:
- `owner`
- `admin`
- `member`

### `app_sessions`
Browser sessions for dashboard auth.

Suggested columns:
- `id UUID PK`
- `user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- `customer_id UUID REFERENCES customers(id) ON DELETE CASCADE`
- `session_token_hash TEXT NOT NULL UNIQUE`
- `ip_address INET`
- `user_agent TEXT`
- `expires_at TIMESTAMPTZ NOT NULL`
- `last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `revoked_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### Customer table updates
Keep `customers` as account/workspace owner of billing and API keys.

Small additions worth making:
- `owner_user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL`
- maybe `slug TEXT UNIQUE` later for nicer URLs

Do **not** collapse `customers` and `users` into one table. That becomes painful once teams/invites/billing appear.

---

## Suggested signup/signin rules

### First login
When a person signs in with Google for the first time:

1. validate Google callback
2. read stable Google subject (`sub`), email, name, avatar
3. find existing `oauth_accounts(provider='google', provider_account_id=sub)`
4. else try to find `users.email = google email`
5. if no user exists:
   - create `users` row
   - create `customers` row for a default workspace/account
   - create `customer_memberships` row as `owner`
   - optionally set `customers.owner_user_id`
6. create/update `oauth_accounts`
7. create app session
8. redirect to dashboard

### Returning login
1. resolve Google account
2. update `users.last_login_at`
3. create fresh session
4. redirect to dashboard

### Account linking rule
For MVP:
- allow only one Google account link per user
- if a user exists by email but no linked Google account, auto-link on verified email match

That keeps the UX simple.

---

## Callback and session handling

## OAuth endpoints
Add API-owned auth routes such as:
- `GET /v1/auth/google/start`
- `GET /v1/auth/google/callback`
- `POST /v1/auth/logout`
- `GET /v1/auth/session`

Optional later:
- `POST /v1/auth/switch-customer`

## Session cookie shape
Use a signed cookie like:
- name: `company_data_session`
- flags:
  - `HttpOnly`
  - `Secure` in production
  - `SameSite=Lax`
  - `Path=/`

Store only an opaque random token in the cookie.
Never store raw user/customer claims in the cookie.

In DB:
- store **hash** of the session token, not raw token
- keep expiry short-ish, for example 30 days rolling
- refresh `last_seen_at` on use, but not on every single request if you want to reduce writes

## Session lookup flow
For dashboard-authenticated endpoints:
1. read cookie
2. hash token
3. load `app_sessions` + `users` + `customer_memberships`
4. reject revoked/expired sessions
5. attach `request.appAuth = { userId, customerId, role }`

## CSRF
Because this is cookie auth, protect state-changing dashboard routes.

MVP-safe approach:
- keep sign-in callback on GET from Google
- require `Origin` / `Referer` checks for POST actions
- add CSRF tokens later if forms/actions grow

For local MVP, `SameSite=Lax` + origin checks is a fine start.

---

## Public site and dashboard integration points

## Public site (`site/`)
Today this is static.

For MVP, add simple links/buttons only:
- `Continue with Google`
- points to API auth start route, e.g. `http://localhost:3011/v1/auth/google/start`
- after success, redirect to dashboard URL

Optional public behaviors:
- if a valid session exists and user hits the public site, show `Open dashboard` instead of `Login`
- this can be deferred since the site is static today

## Dashboard (`apps/dashboard`)
Current dashboard assumes a fake logged-in state.

Replace that assumption with a minimal bootstrap flow:

1. on app load, call `GET /v1/auth/session` with `credentials: 'include'`
2. if session exists:
   - render dashboard
   - show workspace name, user name, role
3. if no session:
   - show a clean signed-out state with `Continue with Google`
   - or redirect to public site login

Important Vite/frontend note:
- cross-origin cookie requests require `credentials: 'include'`
- API CORS can no longer stay at `*` for authenticated browser flows
- set explicit allowed origins for dashboard/public URLs

## API routes
Keep two auth modes separate:

### Browser/dashboard routes
Use cookie session auth for routes like:
- `/v1/auth/session`
- `/v1/me`
- `/v1/dashboard/api-keys`
- `/v1/dashboard/usage`
- `/v1/dashboard/billing`

### Product API routes
Keep API-key auth for routes like:
- `/v1/companies/search`
- future customer-facing API endpoints

Do **not** replace API keys with Google sessions for product API access.
Users log in to manage keys; machines call the API with keys.

---

## Security notes

1. **Use OpenID Connect identity data, not just email**
   - the durable Google identifier is `sub`
   - email alone is not enough as the primary identity key

2. **Hash session tokens in DB**
   - same reason you hash API keys

3. **Store OAuth secrets in env only**
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`
   - `SESSION_COOKIE_SECRET`

4. **Tighten CORS before browser auth goes live**
   - `Access-Control-Allow-Origin` cannot be `*` with credentialed requests
   - use explicit origins for `site` and `dashboard`

5. **Use state parameter in OAuth flow**
   - store transient state server-side or signed in a short-lived cookie
   - reject callback if invalid or missing

6. **Validate email_verified from Google**
   - for MVP, only auto-create accounts when Google says the email is verified

7. **Secure cookie settings in prod**
   - `Secure=true`
   - consider domain strategy if public site/dashboard/API split across subdomains

8. **Session revocation**
   - support logout by revoking current session row
   - later support “log out all sessions” from account settings

9. **Do not store Google access/refresh tokens unless needed**
   - for sign-in only, you likely do not need long-term Google API access
   - simplest MVP: keep only the account link and identity metadata

10. **Auditability**
   - log auth events: sign-in success/failure, session creation, logout
   - useful once billing and admin tooling grow

---

## Local-first implementation plan

### Phase 1 — groundwork
- add auth tables
- add cookie plugin
- add session helper module
- add env vars for Google OAuth and cookie secret
- tighten CORS to explicit origins

### Phase 2 — Google sign-in
- implement `/v1/auth/google/start`
- implement `/v1/auth/google/callback`
- create/find user + customer + membership
- issue session cookie
- redirect to dashboard

### Phase 3 — dashboard awareness
- add `/v1/auth/session`
- dashboard bootstraps current session
- signed-out state instead of fake logged-in shell

### Phase 4 — account-backed dashboard data
- add `/v1/me`
- add customer-scoped API key list/create/revoke endpoints
- wire dashboard sections to real customer/user data

### Phase 5 — polish
- logout
- invite teammate flow
- role checks
- session list / revoke-all

---

## Small but important implementation details

### CORS change required
Current API config allows `CORS_ORIGIN=*`.
That works for public unauthenticated requests, but not for cookie-authenticated browser requests.

Before browser auth lands, switch to something like:
- `http://localhost:3012` for dashboard
- public site origin if it becomes JS-driven
- production frontend origin(s)

And enable `credentials: true` in Fastify CORS config.

### Route partitioning
Keep auth concerns explicit:
- `middleware/api-key.ts` stays for machine/API requests
- add separate session middleware for browser/dashboard requests

### Session write frequency
Avoid updating `last_seen_at` on every request.
A simple rule like "update if older than 15 minutes" is enough for MVP.

### Workspace selection
If a user belongs to one customer only, bind that customer into the session.
If multi-workspace appears later, add explicit switch flow.

---

## What I would not do yet

- no password auth
- no magic links
- no SAML/enterprise SSO
- no full RBAC matrix
- no complicated org model
- no replacing API keys with session tokens
- no fake frontend-only Google button with no backend ownership

---

## Bottom line

**Best next step:** implement Google OAuth directly in the Fastify API with Postgres-backed `users`, `oauth_accounts`, `customer_memberships`, and `app_sessions`.

That is the most sensible MVP because it:
- matches the current stack
- preserves local-first development
- keeps billing/customer/API-key ownership coherent
- avoids premature vendor or framework lock-in

If the app later consolidates into Next.js, then re-evaluate **Auth.js**. Today, I would not force that move just to get Google sign-in.
