# MapleRecord — External Request Form

A **standalone, self-contained** one-page *Access / Correction Request* (Freedom of
Information) form, branded for MapleRecord. Built as its own React + TypeScript
(Vite) app with **no dependency on the parent project**, so it can be lifted out
and deployed on a public domain with minimal effort.

On the Payment step the form redirects to **Stripe Checkout**; the backend creates
the request in the Request Module **only after the payment is verified** (never
before). File upload and email remain future phases.

## Run it

```bash
npm install
npm run dev        # starts Vite on http://localhost:5180
```

## Backend connection & Stripe

`VITE_API_BASE_URL` (defaults to `http://localhost:8000`) points the form at the
backend. Set it when hosting the form on a different origin (e.g. in a `.env`):

```
VITE_API_BASE_URL=https://api.maplerecord.com
```

The payment flow uses these public (unauthenticated), rate-limited endpoints:

```
POST {VITE_API_BASE_URL}/api/public/external-requests/checkout-session/   # start payment
POST {VITE_API_BASE_URL}/api/public/external-requests/verify/             # confirm on return
POST {VITE_API_BASE_URL}/api/public/stripe/webhook/                       # Stripe webhook
```

The checkout/verify client lives in `src/lib/checkout.ts`. The form keeps your
entered data in `sessionStorage` across the redirect, so a cancelled/failed
payment returns you to the summary with everything preserved.

**Backend Stripe config** (in the backend `.env` — never committed; keys via env):

```
STRIPE_SECRET_KEY=sk_test_or_live_...
STRIPE_PUBLISHABLE_KEY=pk_test_or_live_...
STRIPE_WEBHOOK_SECRET=whsec_...          # from the Stripe dashboard webhook (or `stripe listen`)
STRIPE_CURRENCY=usd
EXTERNAL_FORM_RETURN_ORIGINS=https://request.yourdomain.com
```

In production, the form's origin must be listed in the backend's
`CORS_ALLOWED_ORIGINS` **and** `EXTERNAL_FORM_RETURN_ORIGINS`. Configure a Stripe
webhook for the `checkout.session.completed` event pointing at
`/api/public/stripe/webhook/` and put its signing secret in `STRIPE_WEBHOOK_SECRET`.

Other scripts:

```bash
npm run build      # type-checks, then builds static files into dist/
npm run preview    # serves the production build locally
npm run typecheck  # tsc --noEmit
```

## Deploy

`npm run build` produces a static `dist/` folder — host it on any static/CDN
provider (Netlify, Vercel, S3, Nginx, GitHub Pages, etc.). No server required.

## Project structure

```
src/
  App.tsx                 # page shell + form state (single source of truth)
  main.tsx                # React entry
  types/form.ts           # typed form model + createEmptyForm()
  lib/
    formConfig.ts         # option lists (provinces, access methods, etc.)
    checkout.ts           # Stripe checkout/verify client + toPayload() mapping
    paymentSummary.ts     # fee + GST/VAT computation for the summary page
  components/
    Logo.tsx              # inline MapleRecord logo (no image dependency)
    form/                 # reusable primitives (Field, TextInput, TextArea,
                          #   SelectInput, RadioGroup, CheckboxGroup, FormSection)
  sections/               # one component per form section
  styles/                 # theme tokens, base layout, form styles (plain CSS)
```

## Designed for future integration

- **`src/types/form.ts`** — the whole form is one typed object, so it can be
  serialised/validated/submitted without touching the UI.
- **`src/lib/checkout.ts`** — the single seam where the public API / Stripe
  payment gateway is wired in. `App.tsx` calls `createCheckoutSession()` and
  `verifyPayment()` from here.
- **`src/lib/formConfig.ts`** — option values live in one place so a server can
  validate against the same source.

## Branding

Colours, typography (Inter), and the maple-leaf logo mirror the MapleRecord app,
but everything is inlined here (CSS variables + inline SVG) — nothing is imported
from the parent project.
