# Yoohyuk's personal website

A Next.js 15 (App Router, React 19, Tailwind v4) site deployed on Vercel.
It has two halves that share nothing but the framework:

- **Public site** — `/` (hero, about, skills, projects preview) and
  `/projects`. Static content in `src/app/page.tsx`, `src/app/projects/`,
  and `src/components/home/`, `src/components/projects/`.
- **Financial Management** — `/financial-management`, a password-gated
  personal finance dashboard backed by Plaid (Fidelity, Chase, Bank of
  America), DynamoDB, and a scheduled AWS Lambda. Full architecture, data
  model, runbook, and current data state:
  [`docs/financial-management.md`](docs/financial-management.md).

## Layout

```
src/app/                         routes (pages + API route handlers)
  financial-management/          dashboard page + login page
  api/financial-management/      JSON API used by the dashboard + Plaid webhook
src/components/                  React components (home/, projects/, financial-management/)
src/lib/financial-management/    all financial-management logic (types, providers, integrator, store)
src/middleware.ts                session-cookie gate for /financial-management and its API
infra/                           AWS CDK app: DynamoDB tables, KMS key, sync Lambda, schedules
tests/                           node:test unit tests for the pure financial-management functions
docs/                            design docs
```

## Commands

| What | Command |
|---|---|
| Dev server | `npm run dev` → http://localhost:3000 |
| Type-check app | `npx tsc --noEmit -p .` |
| Lint | `npm run lint` |
| Unit tests (no AWS needed) | `node --test tests/*.test.cjs` |
| Validate infra | `cd infra && set -a && source <(grep '^PLAID_' ../.env.local) && set +a && AWS_PROFILE=portfolio-dev npx cdk synth` |
| Deploy app | push to `main` (Vercel Git integration builds production) |
| Deploy infra | same as validate, with `cdk deploy FinancialManagementStack` |

`cd infra && npx tsc --noEmit -p .` reports two errors in
`src/lib/financial-management/fx.ts` (Next.js-only `fetch` typing). They're
known and harmless: the Lambda is bundled by esbuild, which doesn't type-check.

## Environment

Local values live in `.env.local` (git-ignored); production values are
Vercel env vars (`vercel env ls`). The Lambda gets its own copies at CDK
deploy time.

| Var | Used by |
|---|---|
| `FINANCIAL_MANAGEMENT_PASSWORD` | login page |
| `FINANCIAL_MANAGEMENT_SESSION_SECRET` | HMAC for the `fm_session` cookie (30-day) |
| `FINANCIAL_MANAGEMENT_AWS_REGION` / `_AWS_ACCESS_KEY_ID` / `_AWS_SECRET_ACCESS_KEY` | app → DynamoDB (scoped IAM user `financial-management-app`); the Lambda uses its execution role instead |
| `FINANCIAL_MANAGEMENT_PLAID_WEBHOOK_URL` | webhook URL registered on Plaid Link tokens |
| `PLAID_CLIENT_ID` / `PLAID_SECRET` / `PLAID_ENV` | Plaid (`production`) |
| `FINANCIAL_MANAGEMENT_*_TABLE` | optional table-name overrides (defaults are the real names) |

AWS: account `149536467459`, region `us-west-2`, CLI profile `portfolio-dev`.
