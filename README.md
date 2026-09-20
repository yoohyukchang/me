# Yoohyuk's personal website.

## Net Worth storage

Net Worth uses the `FinancialHoldingsNetWorth` DynamoDB table defined in
`infra/lib/financial-holdings-stack.ts`. It starts empty, persists current sources,
and stores immutable snapshots with local calendar dates and each source's exchange
rate. Existing financial history remains separate. The existing financial login
middleware protects the Net Worth API.

Before releasing the app changes, provision the updated CDK stack. The app defaults
to the CDK table name; this optional server-side variable overrides it:

```text
FINANCIAL_HOLDINGS_NET_WORTH_TABLE=FinancialHoldingsNetWorth
```

The existing `FINANCIAL_HOLDINGS_AWS_REGION`, access key, and secret key settings
are reused. The stack updates the existing app user's table permissions, retains
the table on removal, and enables point-in-time recovery. No data is seeded.
An unavailable or unprovisioned table shows a retryable storage error.

Source edits use version checks to prevent stale writes. Recording saves the
server's current sources atomically; historical exchange rates do not change.
Up to 100 sources are supported per snapshot to stay within DynamoDB item limits.

Run `node --test tests/net-worth.test.cjs` from the repository root for validation,
storage behavior, and local CDK synthesis checks (no AWS access needed).

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
