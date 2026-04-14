# Multi-tenant SaaS Foundation

Monorepo base for FMOs, General Agencies, Agencies, and Agents services.

## Stack

- Turborepo + pnpm workspaces
- Next.js App Router (`apps/web`)
- Clerk for authentication
- Tenant resolution by subdomain/custom domain in proxy
- GitHub Actions for CI/security/deploy

## Workspace layout

- `apps/web`: main SaaS app
- `packages/tenant-core`: tenant resolution/context/data-guard utilities
- `packages/types`: domain contracts
- `packages/ui`: shared UI components
- `packages/config`: shared eslint/typescript/prettier configuration

## Local setup

1. Install dependencies:
   - `pnpm install`
2. Copy env:
   - `cp apps/web/.env.example apps/web/.env.local`
3. Run:
   - `pnpm dev`

Set `ROOT_DOMAIN` according to your local routing strategy.
For local subdomain testing, use a DNS/proxy setup (for example with `*.localhost` capable tooling).

## Multi-tenant request flow

1. Request enters `apps/web/proxy.ts`
2. Host is resolved by custom domain mapping first, then subdomain
3. Tenant context is added as internal headers
4. App routes and APIs consume tenant context from headers
5. Data access helpers enforce tenant scope and deny cross-tenant access

## Phase 2 custom domains

Domain lifecycle endpoints are available in `apps/web/app/api/domains`:

- `GET /api/domains`: list mapped tenant domains
- `POST /api/domains`: create a domain mapping and attempt Vercel project domain add
- `POST /api/domains/{domain}/verify`: verify domain ownership/certificate status
- `DELETE /api/domains/{domain}`: remove mapping and project domain

If Vercel credentials are not configured, APIs still manage local domain mappings to unblock development.

## Git governance defaults

- Protected `main` branch + mandatory PR checks
- Conventional Commits via commitlint
- Changesets for internal package versioning
- CODEOWNERS + PR template

## Vercel + GitHub requirements

Create these repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID` or `VERCEL_TEAM_ID`
- `VERCEL_PROJECT_ID`

Then connect the repository in Vercel and configure wildcard domain for subdomain routing.
