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

## Design system

Global design tokens live in [`src/app/globals.css`](./src/app/globals.css). They provide shared color palettes and semantic colors, typography and line-height scales, spacing, responsive layout dimensions, grid recipes, aspect ratios, border radii, and elevation shadows. Existing Tailwind utilities are backed by these tokens across the storefront, account, retailer, and CMS pages; use named token utilities instead of arbitrary values such as `text-[11px]` or `grid-cols-[...]`.

Reusable primitives are exported from [`src/components/ui/index.tsx`](./src/components/ui/index.tsx):

- `Button` supports `primary`, `secondary`, `outline`, `ghost`, and `danger` variants plus `sm`, `md`, and `lg` sizes.
- `Card` provides a shared surface and accepts `article`, `div`, or `section` semantics.
- `Input` provides the standard form-field treatment.
- `Badge` supports brand, neutral, success, warning, and danger states.

Use semantic color utilities (`bg-canvas`, `text-content-primary`, `text-content-secondary`, `border-border-default`, and `bg-brand-primary`) and spacing utilities (`p-xs`, `gap-md`, and similar) when adding UI. Named layout utilities such as `grid-cols-checkout`, `min-h-page-content`, and `aspect-banner-card-mobile` are available for shared compositions. Prefer shared primitives and token-backed utilities over introducing one-off color, type, spacing, radius, or shadow values. Inline styles are reserved for runtime data such as banner images, carousel positions, and rating widths.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Supabase CMS setup

The CMS uses Supabase for shared catalog/content data and admin sign-in.

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql). This creates the CMS tables and row-level security policies; it does not add sample products or reviews.
   If the project already contains the catalog examples from an earlier schema version, run [`supabase/migrations/20261017_remove_demo_catalog.sql`](./supabase/migrations/20261017_remove_demo_catalog.sql) to unpublish those products and remove reviews marked as demos. The migration keeps product rows to preserve historical order references.
3. In Supabase Authentication, enable email sign-ups for customer accounts. New customers can register and sign in at `/account`. Create the admin user separately; customer metadata cannot grant CMS or retailer roles.
4. In the SQL Editor, grant that account the CMS admin role. Replace the email before running:

   ```sql
   update auth.users
   set raw_app_meta_data =
     coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where email = 'admin@example.com';
   ```

5. Copy `.env.example` to `.env.local` and add the project's **Project URL** and **anon/publishable key** from Supabase Project Settings → API.
6. Restart the development server. Customers can sign up or sign in at `/account`; administrators sign in at `/admin/login`.

The browser uses only the public anon/publishable key. Do not put a Supabase service-role key in `.env.local` or browser code. Database row-level security restricts CMS edits to accounts with the `app_metadata.role = admin` claim. Customer and retailer accounts always use Supabase Auth; no browser-local demo accounts or demo retailer sessions are available.

Supabase project email settings control account confirmation, password reset, and invitation emails. Configure email confirmation and SMTP/security settings intentionally. For development or email-delivery tests, use a separate non-production Supabase project and its test email configuration; do not disable email authentication on the production project. Admin and retailer sign-in include password reset links; invitation and reset links require the Edge Function setup and redirect allowlist described below.

Connected CMS data includes products, categories, brands, homepage copy, banners, store/delivery settings, retailer applications, product reviews, and customer orders. Customer accounts use Supabase email/password authentication and save the display name to account metadata for product ratings. Customer checkout submits orders to Supabase and lets customers choose home delivery or store pickup. Delivery is available for Pakistani cities entered at checkout. Lahore orders use the configured flat local-delivery rate and do not select a courier/post service; the schema adds the Lahore all-localities rate of Rs. 300 when that Lahore rate is missing. Orders for other cities require the customer to select PostEx, TCS, Leopards Courier, M&P, or Pakistan Post; the courier booking and shipping charge are confirmed by the store, so nationwide orders are saved with delivery charge and total pending until confirmed. Store pickup has no delivery charge, but the store must confirm pickup address and readiness before the customer travels. Customers select JazzCash, EasyPaisa, or bank transfer at checkout; this records their requested method, while the store confirms payment details and collects payment separately. Optional city detection requests browser location only after the customer presses the button and grants permission; coordinates are sent to BigDataCloud for reverse geocoding. Customers can also enter any Pakistani city and their locality manually. Checkout shows each product's configured quality label without independently verifying authenticity. Submitting checkout records an order request; stock and final delivery charges are confirmed by the store. The unique `UMP-…` order number remains as an internal/legacy reference. Order lookups require both the tracking code (or a legacy order number) and checkout phone number. Admins can update order status and customers see a status timeline. The order-creation database function uses current published product prices and stock, and calculates Lahore local delivery server-side from the verified zone settings. Retailer applications collect a contact email and business type, require a business-proof upload and application acknowledgment, and are reviewed by admins. After approval, an admin can send a secure account setup link from Admin → Retailer applications. New users receive an invitation; an existing customer account can be enabled for retailer access and receives a password reset email. Retailers choose their own passwords, and admins never see or distribute them. Applicants do not create an Auth account or choose a password during application. Product reviews are held for moderation and only appear publicly after approval; sample reviews are not seeded.

### Retailer account email setup

Deploy the admin-only Supabase Edge Functions and configure their server-side secrets before using retailer access or the registered account list:

```powershell
supabase functions deploy manage-retailer-access
supabase functions deploy list-customer-accounts
supabase secrets set --project-ref <project-ref> SITE_URL=https://your-store.example
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are available to Supabase Edge Functions as platform secrets. Never expose the service-role key in frontend code, `.env.local`, or `NEXT_PUBLIC_*` variables. Set `SITE_URL` to the deployed storefront origin (for local testing, use `http://localhost:3000`). In Supabase Authentication → URL Configuration, add `<SITE_URL>/retailer/setup-password` to the allowed redirect URLs. Configure Auth email delivery and the invite/reset templates in Supabase so invitation and recovery links return to the password setup page. Admin password reset uses this same page and routes admins back to the CMS after they choose a new password. The admin must have `app_metadata.role = admin`; the function independently verifies this claim and that the application is approved before provisioning access. Existing accounts with a privileged non-customer role are not modified.

Apply the latest `supabase/schema.sql` in the Supabase SQL Editor before using new retailer applications, courier preferences, payment-method selection, Lahore local delivery, nationwide courier orders, store pickup, half-star product ratings, demo review examples, or the six-digit tracking-code flow. It adds and backfills unique tracking codes, delivery areas, fulfillment method, and preferred courier for orders; records the selected payment method; changes review ratings to half-star precision; and configures Lahore local delivery when no rate exists. In Admin → Site settings, review the Lahore rate and confirm delivery details. Other Pakistani cities can submit orders with a selected courier; the CMS order total will show delivery as pending until the store confirms the shipping charge. Previous `UMP-…` references continue to work for order lookup. Terms, privacy, shipping, and returns pages currently contain general draft wording marked as not final; confirm all business and legal details before treating them as active policies.

The CMS also supports order payment-status tracking (unpaid, paid, refunded), searchable and filterable paginated product lists, per-product retailer discount percentages shown to retailer accounts, products linked to managed brands, category reordering, banner image uploads, a live homepage content preview, registered customer/retailer account listings, and admin sign-out. The CMS accounts screen separates Supabase Auth accounts, retailer applications, and guest checkout orders. Guest checkout submissions are order contacts, not login accounts; visitors who only browse are not recorded as customers. Deploy/redeploy `list-customer-accounts` after updating it to show the three sources. Retailer discounts are display-only while wholesale checkout remains disabled. Apply the latest schema before using category reordering, payment-status tracking, or retailer discounts on an existing Supabase project. Lahore orders use local delivery at the configured rate and hide courier selection; nationwide orders outside Lahore require a courier/post preference and the store confirms their delivery charges after submission.

## Deploy on Vercel

1. Push the reviewed code to GitHub and import `zauras25/Mobile-Studio` into Vercel. Use the repository root as the project root; Vercel detects Next.js and uses `npm run build`.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Project Settings → Environment Variables. Configure them for Preview and Production as appropriate. Use a separate Supabase project for Preview if test orders/content must not mix with the live store.
3. Run the reviewed [`supabase/schema.sql`](./supabase/schema.sql) in the intended Supabase project and assign the CMS admin role before testing the CMS or order flow. For an existing project with the earlier example catalog, also run the catalog cleanup migration in the setup instructions above.
4. Deploy a Preview first. Test a customer order, confirm that it appears in the CMS, change its status, and verify the customer can see the updated tracking timeline. Only promote to Production after adding verified product, delivery, returns, payment, and contact information.

Only the public Supabase project URL and anon/publishable key belong in `NEXT_PUBLIC_*` variables. Never add a Supabase service-role key to Vercel client-exposed variables or commit `.env.local`.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
