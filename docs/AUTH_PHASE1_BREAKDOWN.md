# Auth Phase 1 Breakdown

## Purpose

This document turns the auth implementation plan into a practical Phase 1 delivery package.

Phase 1 scope is intentionally limited to the foundation needed to support:

- email/password signup
- email/password login
- logout
- current-user session lookup
- future Google/GitHub OAuth integration without schema rewrite

This phase does **not** fully implement Google/GitHub login yet, but it prepares the backend and frontend to add them cleanly in Phase 2 and 3.

---

## Phase 1 Goal

Deliver a working first-party auth base that lets a user:

1. sign up with email/password
2. log in with email/password
3. stay logged in with a secure session cookie
4. log out
5. load current user state from the backend

And lets the codebase support future:

- Google OAuth
- GitHub OAuth
- email verification
- password reset
- account linking

---

## Deliverables

Phase 1 should produce:

- database schema + migrations
- auth services in `apps/api`
- auth routes in `apps/api`
- current-user/session middleware
- frontend login/signup pages
- route guard/bootstrap behavior
- environment contract
- provider setup checklist stub for later phases

---

## 1. Database Schema Plan

Create a new migration set for auth.

### Tables to add

#### `users`

Fields:

- `id` text/uuid primary key
- `email` text not null unique
- `email_normalized` text not null unique
- `email_verified_at` timestamptz null
- `password_hash` text null
- `display_name` text null
- `avatar_url` text null
- `status` text not null default `active`
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()
- `last_login_at` timestamptz null

Why:

- `email_normalized` avoids case-sensitivity chaos
- `password_hash` is nullable for future social-only accounts

#### `auth_identities`

Fields:

- `id` text/uuid primary key
- `user_id` FK not null -> `users.id`
- `provider` text not null
- `provider_user_id` text null
- `provider_email` text null
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

Indexes / constraints:

- unique `(provider, provider_user_id)` where `provider_user_id` is not null
- index on `user_id`

In Phase 1:

- provider `email` entries should be created for local accounts

#### `user_sessions`

Fields:

- `id` text/uuid primary key
- `user_id` FK not null -> `users.id`
- `session_token_hash` text not null unique
- `expires_at` timestamptz not null
- `created_at` timestamptz not null default now()
- `last_seen_at` timestamptz not null default now()
- `ip_address` text null
- `user_agent` text null

Why:

- server session invalidation becomes possible
- avoids raw token storage

### Deferred tables (can be included now or in Phase 4)

If we want cleaner future rollout, we can add them already:

- `email_verification_tokens`
- `password_reset_tokens`

If Phase 1 should stay lean, defer both to Phase 4.

### Suggested migration names

- `0004_auth_users.sql`
- `0005_auth_sessions.sql`

---

## 2. Backend Route Contract

All routes under `apps/api/src/routes/auth.ts` or an auth route folder.

### Required Phase 1 endpoints

#### `POST /auth/signup`

Request:

```json
{
  "email": "user@example.com",
  "password": "strong-password",
  "displayName": "Kim"
}
```

Behavior:

- validate fields
- normalize email
- reject duplicate email
- hash password with Argon2id
- create user
- create `auth_identities` record with provider `email`
- create session
- set secure cookie
- return safe user payload

Response:

```json
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "displayName": "Kim",
    "emailVerified": false
  }
}
```

#### `POST /auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "strong-password"
}
```

Behavior:

- normalize email
- find user
- verify password hash
- create session
- set cookie
- return safe user payload

#### `POST /auth/logout`

Behavior:

- remove/invalidate current session
- clear cookie
- return `{ ok: true }`

#### `GET /auth/me`

Behavior:

- resolve session cookie
- return authenticated user if valid
- return `401` or `{ user: null }` by design decision

Recommendation:

- return `200 { user: null }` for smoother frontend bootstrapping

---

## 3. Backend Service Breakdown

Create focused services rather than one giant file.

### Suggested files

Under `apps/api/src/services/`:

- `auth-service.ts`
- `session-service.ts`
- `password-service.ts`
- `user-service.ts`

Under `apps/api/src/lib/` or `config/`:

- cookie helpers
- email normalization helper
- auth constants

### Responsibilities

#### `password-service.ts`

- hash password with Argon2id
- verify password

#### `session-service.ts`

- generate raw session token
- hash token before DB storage
- persist session row
- validate session cookie
- revoke session
- clear expired sessions later

#### `auth-service.ts`

- signup orchestration
- login orchestration
- duplicate-email handling
- safe user serialization

#### `user-service.ts`

- get by id
- get by normalized email
- create user
- update last login

---

## 4. Middleware / Request Context

Add current-user resolution middleware in API.

### Goal

For authenticated requests, downstream routes should have access to:

- `request.currentUser`
- `request.session`

### Work needed

- extend Fastify types
- parse cookie
- validate session token
- attach user/session to request

### Suggested files

- `apps/api/src/middleware/auth-session.ts`
- `apps/api/src/types/fastify.ts`

---

## 5. Cookie / Session Design

### Recommended cookie name

- `cdp_session`

### Cookie settings

Local dev:

- `httpOnly: true`
- `secure: false`
- `sameSite: 'lax'`
- `path: '/'`

Production:

- `httpOnly: true`
- `secure: true`
- `sameSite: 'lax'`
- `path: '/'`

### Session TTL

Recommended MVP:

- 14 days absolute max
- refresh `last_seen_at` on use

### Session storage pattern

- raw token only in cookie
- hashed token in DB

---

## 6. Validation Rules

### Email

- trim
- lowercase for normalized field
- validate shape

### Password

Recommended MVP rules:

- min 8 chars
- max 128 chars
- no overly strict complexity theatre

### Display name

- optional
- trim
- length limit

### Duplicate account handling

- reject if normalized email already exists
- message should be user-safe, not leaky

---

## 7. Frontend Phase 1 Pages

Public flow should start from `3010` frontpage.

### Pages to create

- `/login`
- `/signup`

Optional placeholder pages now:

- `/forgot-password`
- `/verify-email`

### Login page requirements

- email input
- password input
- submit button
- link to signup
- placeholders/buttons for future:
  - Continue with Google
  - Continue with GitHub

### Signup page requirements

- display name input optional
- email input
- password input
- submit button
- link to login
- future social CTA placeholders

### UX note

Even if OAuth is not live in Phase 1, it is smart to structure the layout so Google/GitHub buttons can drop in later without redesign.

---

## 8. Frontend App Bootstrap

Authenticated surfaces must be able to know whether the user is signed in.

### Needed behavior

On page/app load:

1. call `GET /auth/me`
2. if user exists -> hydrate app state
3. if user missing -> show public/anonymous state or redirect

### Route guarding

For customer-only surfaces later:

- anonymous users redirected to `/login`

Phase 1 can keep guarding lightweight if customer-only routes are not fully built yet.

---

## 9. API / Frontend Integration Tasks

### Backend

1. Add auth tables migration
2. Add auth services
3. Add session middleware
4. Add `/auth/signup`
5. Add `/auth/login`
6. Add `/auth/logout`
7. Add `/auth/me`
8. Register cookie parsing if not already present

### Frontend

1. Add login page
2. Add signup page
3. Add form submission wiring
4. Add current user bootstrap
5. Add logout action stub
6. Add top-level CTA links from public site

---

## 10. Environment Variables

Phase 1 env contract:

- `SESSION_SECRET`
- `APP_BASE_URL`
- `COOKIE_DOMAIN` (optional for local, useful later)
- `AUTH_SESSION_TTL_DAYS` (optional)

Already relevant existing vars:

- `DATABASE_URL`
- `NODE_ENV`

### Add to `.env.example`

Suggested additions:

```env
SESSION_SECRET=replace_me
APP_BASE_URL=http://localhost:3010
AUTH_SESSION_TTL_DAYS=14
```

If frontend and API run on separate origins in production later, we may also need:

```env
COOKIE_DOMAIN=
APP_PUBLIC_URL=
API_PUBLIC_URL=
```

---

## 11. Google / GitHub Setup Checklist

Not implemented in Phase 1, but we should prepare this checklist now.

### Google OAuth checklist

- create Google Cloud project
- configure OAuth consent screen
- create Web OAuth client
- add redirect URIs:
  - local dev callback
  - production callback
- capture:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`

### GitHub OAuth checklist

- create GitHub OAuth app
- set homepage URL
- set callback URL(s)
- capture:
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`

### Future env additions

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

---

## 12. Security Checklist for Phase 1

Must-have before calling Phase 1 done:

- Argon2id hashing
- session token hashing
- httpOnly cookies
- duplicate email protection
- basic request validation
- basic rate limiting on signup/login
- no password hashes in responses
- no user enumeration in login messages

Recommended if fast to add:

- login attempt throttling per IP/email
- audit-style logging for signup/login/logout

---

## 13. Suggested File Map

### Backend

- `apps/api/src/routes/auth.ts`
- `apps/api/src/services/auth-service.ts`
- `apps/api/src/services/session-service.ts`
- `apps/api/src/services/password-service.ts`
- `apps/api/src/services/user-service.ts`
- `apps/api/src/middleware/auth-session.ts`
- `apps/api/src/types/fastify.ts`
- `packages/db/migrations/0004_auth_users.sql`
- `packages/db/migrations/0005_auth_sessions.sql`

### Frontend / public site

Depending on current structure:

- login page component
- signup page component
- auth API client helper
- session bootstrap hook/store

If the current public site is still mostly static, we may need to decide whether auth pages live in:

- `site/` as enhanced static pages
- `apps/project/`
- `apps/dashboard/`

Recommendation:

- keep auth in the primary customer-facing app surface, not as a detached static hack

---

## 14. Acceptance Criteria for Phase 1

Phase 1 is complete when:

1. A user can sign up with email/password
2. A user can log in with email/password
3. A valid session cookie is created and reused
4. `/auth/me` returns the current user when logged in
5. Logout invalidates session and clears cookie
6. Passwords are hashed securely
7. Schema supports future Google/GitHub auth identities
8. Frontend has working login/signup entry points

---

## 15. Recommended Build Order

1. add DB migrations
2. add password + session services
3. add auth routes
4. add request auth middleware
5. test signup/login/logout/me in API only
6. build login/signup frontend pages
7. wire frontend to backend
8. add rate limiting / polish

---

## 16. Immediate Next Tasks

The next concrete implementation tasks after this document should be:

### Task 1 — Schema

- author migration SQL for `users`, `auth_identities`, `user_sessions`

### Task 2 — API foundation

- implement password hashing + session helpers

### Task 3 — Auth routes

- implement signup/login/logout/me

### Task 4 — Frontend auth entry

- add login/signup pages and CTA wiring from frontpage

### Task 5 — Provider prep

- add env placeholders and callback planning for Google/GitHub
