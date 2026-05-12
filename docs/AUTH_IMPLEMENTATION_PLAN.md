# Auth Implementation Plan

## Goal

Add customer authentication to the public product surface (`3010`) and shared app stack with support for:

- Google sign-up / login
- GitHub sign-up / login
- Email + password sign-up / login
- Session-based authentication for the web app
- Future-safe account linking across multiple login methods

This plan is intentionally scoped for an MVP that is secure, deployable, and compatible with the current monorepo structure.

---

## Product Requirements

Users must be able to:

1. Create an account with Google
2. Create an account with GitHub
3. Create an account with email/password
4. Log in again with the same method later
5. Stay signed in across the product web experience
6. Log out safely
7. Reset password for email-based accounts
8. Verify email for email/password sign-up

Not required for MVP:

- MFA / 2FA
- SAML / enterprise SSO
- team invites / org ownership
- advanced RBAC
- billing entitlements coupled to auth at launch
- polished account linking UI

---

## Recommended Architecture

Use first-party auth in the API/backend.

### Why

This project already has:

- a dedicated API app
- PostgreSQL
- a monorepo with admin/dashboard/public surfaces
- deployment under our own control

That makes first-party auth the cleanest option.

### Authentication model

- **OAuth 2.0 / OIDC** for Google and GitHub
- **Email/password** for classic signup/login
- **HTTP-only secure session cookies** for browser auth
- Internal `user.id` as the true identity key

Do **not** use frontend-only social login.

---

## Data Model

### 1. `users`

Core customer account.

Suggested fields:

- `id` UUID / text primary key
- `email` text unique nullable initially, but strongly preferred
- `email_verified_at` timestamp nullable
- `password_hash` text nullable
- `display_name` text nullable
- `avatar_url` text nullable
- `status` text default `active`
- `created_at` timestamp
- `updated_at` timestamp
- `last_login_at` timestamp nullable

Notes:

- `password_hash` is nullable because Google/GitHub-only users may not have one.
- `email` should be unique once normalized.

### 2. `auth_identities`

Tracks login providers connected to a user.

Suggested fields:

- `id` UUID / text primary key
- `user_id` FK -> `users.id`
- `provider` text (`email`, `google`, `github`)
- `provider_user_id` text nullable for email, required for social
- `provider_email` text nullable
- `created_at` timestamp
- `updated_at` timestamp

Constraints:

- unique `(provider, provider_user_id)`
- index on `user_id`

Purpose:

- one user can have several identities
- future account linking becomes possible without schema rewrite

### 3. `user_sessions`

Server-managed login sessions.

Suggested fields:

- `id` UUID / text primary key
- `user_id` FK -> `users.id`
- `session_token_hash` text unique
- `expires_at` timestamp
- `last_seen_at` timestamp
- `created_at` timestamp
- `ip_address` text nullable
- `user_agent` text nullable

Notes:

- store only a hashed session token in DB
- send raw session token only as secure cookie

### 4. `email_verification_tokens`

Suggested fields:

- `id`
- `user_id`
- `token_hash`
- `expires_at`
- `created_at`
- `used_at`

### 5. `password_reset_tokens`

Suggested fields:

- `id`
- `user_id`
- `token_hash`
- `expires_at`
- `created_at`
- `used_at`

---

## API Surface

All auth routes should live under `/auth`.

### Session / profile

- `GET /auth/me`
- `POST /auth/logout`

### Email auth

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/verify-email/request`
- `POST /auth/verify-email/confirm`
- `POST /auth/password/forgot`
- `POST /auth/password/reset`

### Google OAuth

- `GET /auth/google/start`
- `GET /auth/google/callback`

### GitHub OAuth

- `GET /auth/github/start`
- `GET /auth/github/callback`

### Optional future routes

- `POST /auth/link/google`
- `POST /auth/link/github`
- `DELETE /auth/identities/:provider`

---

## Login / Signup Flows

### Email signup

1. User submits email + password
2. Backend validates input
3. Password hashed with Argon2id
4. Create `users` row
5. Create `auth_identities` row with provider `email`
6. Generate email verification token
7. Send verification email
8. Option A: create session immediately but gate sensitive actions until verified
9. Option B: require verification before session

Recommendation:

- allow session after signup
- mark account as unverified
- prompt for verification before high-trust actions

### Email login

1. User submits email + password
2. Backend looks up user by normalized email
3. Verify password hash
4. Create session
5. Set secure HTTP-only cookie

### Google signup/login

1. User clicks “Continue with Google”
2. Backend redirects to Google OAuth consent
3. Google returns to callback
4. Backend verifies response and fetches user identity
5. If matching identity exists -> log user in
6. Else if verified email matches existing local user -> carefully link identity
7. Else create new user + identity
8. Create session cookie
9. Redirect to app/dashboard/onboarding

### GitHub signup/login

Same flow as Google.

Important note:

- GitHub email can sometimes be missing or private
- fallback handling is required if email is unavailable

---

## Account Linking Rules

For MVP, support linking in backend logic even if UI is minimal.

Recommended rules:

1. If provider identity already exists -> login that user
2. If provider returns a verified email and an existing user already owns that email:
   - link provider to existing user
3. If provider email is missing or unverified:
   - create a constrained onboarding step to collect/verify email

Do not blindly merge accounts without trust checks.

---

## Security Requirements

### Passwords

- Use **Argon2id**
- Never store plain passwords
- Enforce minimum password rules

### Sessions

- HTTP-only cookies
- `Secure=true` in production
- `SameSite=Lax` minimum
- short-to-medium session TTL, renewable on activity
- store hashed session token in DB

### OAuth

- validate `state`
- use PKCE where supported / appropriate
- whitelist redirect URIs
- never trust frontend callbacks alone

### Abuse protection

- rate-limit signup/login/password reset
- generic errors for bad login attempts
- log suspicious auth activity

### Email flows

- email verification required for email/password accounts
- password reset tokens must be single-use and expiring

### Secrets

Add to env, never hardcode:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `SESSION_SECRET`
- `APP_BASE_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

---

## Frontend / UX Requirements

Public entrypoint is the frontpage on `3010`.

### Public site

Add clear CTAs:

- Continue with Google
- Continue with GitHub
- Sign up with email
- Log in

### Dedicated auth screens

Create:

- `/signup`
- `/login`
- `/verify-email`
- `/forgot-password`
- `/reset-password`

### UX principles

- social login first, because it reduces friction
- email login still available and obvious
- minimal fields at signup
- clean success/error states
- redirect back into product after login

---

## App Integration

### Public site (`site/` / product surface)

- add CTA buttons and auth entry points
- connect hero/marketing actions to signup/login

### API app (`apps/api`)

- own all auth logic
- handle cookie issuing and session validation
- provide `/auth/me` for frontend bootstrapping

### Dashboard / app surfaces

- consume `/auth/me`
- gate authenticated pages
- redirect anonymous users to `/login`

### Admin surface

Eventually show:

- user list
- auth provider(s)
- verification state
- created at / last login

Admin integration can be phase 2.

---

## Delivery Plan

## Phase 1 — Auth Foundation

Scope:

- DB migrations for users, identities, sessions, verification, reset tokens
- password hashing utility
- cookie/session utility
- `/auth/signup`
- `/auth/login`
- `/auth/logout`
- `/auth/me`

Deliverable:

- users can create email accounts and sign in

## Phase 2 — Google OAuth

Scope:

- Google OAuth app configuration
- backend start + callback routes
- account creation/linking logic
- frontend CTA

Deliverable:

- users can sign in/up with Google

## Phase 3 — GitHub OAuth

Scope:

- GitHub OAuth app configuration
- backend start + callback routes
- email edge-case handling
- frontend CTA

Deliverable:

- users can sign in/up with GitHub

## Phase 4 — Email Verification + Password Reset

Scope:

- email verification request/confirm
- forgot password/reset password
- SMTP integration or transactional provider

Deliverable:

- production-safe lifecycle for email accounts

## Phase 5 — Polish + Hardening

Scope:

- route guards
- better auth UI
- audit logging
- throttling/rate limiting
- account settings stub

Deliverable:

- stable MVP auth experience ready for customers

---

## Technical Tasks Breakdown

### Backend tasks

1. Add auth-related DB schema + migrations
2. Add password hashing service
3. Add session management service
4. Add auth routes
5. Add OAuth provider integration services
6. Add email verification + reset token services
7. Add middleware to resolve current user from session cookie
8. Add auth rate limiting

### Frontend tasks

1. Add login/signup entry points on public site
2. Build login page
3. Build signup page
4. Build forgot/reset password pages
5. Handle OAuth start buttons
6. Add authenticated app bootstrap using `/auth/me`
7. Add logout UX

### DevOps / config tasks

1. Add provider credentials to env files
2. Configure Google OAuth redirect URIs
3. Configure GitHub OAuth redirect URIs
4. Add SMTP or email provider config
5. Verify cookie settings for local vs production domains

---

## Risks

1. **GitHub private email edge cases**
   - user may not expose email
   - needs fallback onboarding path

2. **Account collision / linking mistakes**
   - wrong auto-linking can merge users incorrectly

3. **Cookie/domain misconfiguration in production**
   - especially if public site and app use different subdomains later

4. **Email delivery setup delay**
   - verification/reset flows depend on SMTP or transactional email

5. **Public surface ambiguity**
   - need to decide whether login lands users in dashboard, product workspace, or onboarding

---

## Open Decisions

These need confirmation before implementation starts:

1. Should email/password users be allowed in immediately before email verification?
2. What is the post-login destination?
   - dashboard
   - onboarding
   - product workspace
3. Do we want one shared customer app shell after login, or separate product areas?
4. Which email provider should be used?
   - SMTP
   - Resend
   - Postmark
   - SendGrid
5. Should we support account linking UI in MVP, or backend-only linking for now?

---

## Recommended Default Decisions

If no further product decision is made, use these defaults:

1. Allow login immediately after email signup, but mark account unverified
2. Redirect successful login to dashboard/onboarding
3. Use HTTP-only session cookies
4. Use Argon2id for passwords
5. Use Google + GitHub + email/password in MVP
6. Keep account linking backend-capable, UI-later
7. Add email verification and password reset before calling auth production-ready

---

## Suggested Next Step

Create an implementation branch and start with **Phase 1: Auth Foundation**.

Immediate next deliverables:

1. schema migration plan
2. auth route contract
3. env contract
4. page map for `/login`, `/signup`, `/forgot-password`, `/reset-password`
5. provider setup checklist for Google and GitHub
