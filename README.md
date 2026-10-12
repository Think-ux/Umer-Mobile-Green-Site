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

## Supabase CMS setup

The CMS uses Supabase for shared catalog/content data and admin sign-in.

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql). This creates the CMS tables, row-level security policies, and demo catalog/content.
   If the project is already connected, run the current schema file again to add the current CMS fields for category icons, brand management, featured products, and private retailer proof documents.
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

The browser uses only the public anon/publishable key. Do not put a Supabase service-role key in `.env.local` or browser code. Database row-level security restricts CMS edits to accounts with the `app_metadata.role = admin` claim.

During local development and tests (`NODE_ENV` other than `production`), customer sign-up/sign-in on `/account` uses a browser-local mock. It does not call Supabase Auth, send email, or store/check the entered password; the mock account stores only its email and display name in that browser. This lets the account UI be tested without generating Auth emails, but does not test real customer authentication. Signed-in mock accounts can save browser-only demo product ratings; guest ratings are disabled, and demo ratings are never sent to Supabase or shown publicly. Production ratings require a real authenticated Supabase customer account. Admin and retailer password sign-in remain connected to Supabase; retailer password reset sends an email when configured as described below.
For local retailer UI testing, `/retailer/login` also offers a clearly labeled demo retailer entry when `NODE_ENV` is not `production`. It uses a browser-local session only, needs no Supabase project or password, and shows sample retailer order history; it does not unlock database-backed features, submit orders, reserve stock, or record payments. This demo entry is absent from production builds.

Production (`NODE_ENV=production`) continues to use Supabase email/password authentication. Supabase project email settings still control emails sent by Supabase outside this local mock, including dashboard actions and any other clients or server integrations. Keep production email confirmation and SMTP/security settings configured intentionally; do not treat the development mock as a production email-delivery control. Retailer sign-in includes a password reset link; invitation and reset links require the Edge Function setup and redirect allowlist described above.

To test without Auth emails, run `npm run dev`, open `/account`, create a development account, then sign out and sign back in with the same email. Any password is accepted by the mock and is never saved. The account is stored only in the current browser's local storage; signing out removes it. Product ratings cannot be submitted by guests or development mock accounts. Apply the updated `supabase/schema.sql` to the connected database so row-level security also blocks anonymous review inserts; authenticated customer ratings remain available in production. No Supabase dashboard change is needed for the app's local customer-account flow because it makes no Auth signup/login request. This does not block emails initiated manually in the Supabase dashboard or by another client, database trigger, or server integration; use a separate non-production Supabase project and its email settings/test SMTP sink if those sources also need to be tested without delivery. Do not disable email authentication on the production project.

Connected CMS data includes products, categories, brands, homepage copy, banners, store/delivery settings, retailer applications, product reviews, and customer orders. Production customer accounts use Supabase email/password authentication and save the display name to account metadata for product ratings. Customer checkout submits orders to Supabase and lets customers choose home delivery or store pickup. Delivery is available for Pakistani cities entered at checkout. Lahore orders use the configured flat local-delivery rate and do not select a courier/post service; the schema adds the Lahore all-localities rate of Rs. 300 when that Lahore rate is missing. Orders for other cities require the customer to select PostEx, TCS, Leopards Courier, M&P, or Pakistan Post; the courier booking and shipping charge are confirmed by the store, so nationwide orders are saved with delivery charge and total pending until confirmed. Store pickup has no delivery charge, but the store must confirm pickup address and readiness before the customer travels. Customers select JazzCash, EasyPaisa, or bank transfer at checkout; this records their requested method, while the store confirms payment details and collects payment separately. Optional city detection requests browser location only after the customer presses the button and grants permission; coordinates are sent to BigDataCloud for reverse geocoding. Customers can also enter any Pakistani city and their locality manually. Checkout shows each product's configured quality label without independently verifying authenticity. Submitting checkout records an order request; stock and final delivery charges are confirmed by the store. The unique `UMP-…` order number remains as an internal/legacy reference. Order lookups require both the tracking code (or a legacy order number) and checkout phone number. Admins can update order status and customers see a status timeline. The order-creation database function uses current published product prices and stock, and calculates Lahore local delivery server-side from the verified zone settings. Retailer applications collect a contact email and business type, require a business-proof upload and application acknowledgment, and are reviewed by admins. After approval, an admin can send a secure account setup link from Admin → Retailer applications. New users receive an invitation; an existing customer account can be enabled for retailer access and receives a password reset email. Retailers choose their own passwords, and admins never see or distribute them. Applicants do not create an Auth account or choose a password during application. Product reviews are held for moderation and only appear publicly after approval. The schema seeds a few approved review examples marked `is_demo`; storefront cards label them as demos, and they are excluded from product rating averages. Delete the demo rows before launch if you do not want public preview cards.

### Retailer account email setup

Deploy the admin-only Supabase Edge Functions and configure their server-side secrets before using retailer access or the registered account list:

```powershell
supabase functions deploy manage-retailer-access
supabase functions deploy list-customer-accounts
supabase secrets set --project-ref <project-ref> SITE_URL=https://your-store.example
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are available to Supabase Edge Functions as platform secrets. Never expose the service-role key in frontend code, `.env.local`, or `NEXT_PUBLIC_*` variables. Set `SITE_URL` to the deployed storefront origin (for local testing, use `http://localhost:3000`). In Supabase Authentication → URL Configuration, add `<SITE_URL>/retailer/setup-password` to the allowed redirect URLs. Configure Auth email delivery and the invite/reset templates in Supabase so invitation and recovery links return to the retailer password setup page. The admin must have `app_metadata.role = admin`; the function independently verifies this claim and that the application is approved before provisioning access. Existing accounts with a privileged non-customer role are not modified.

Apply the latest `supabase/schema.sql` in the Supabase SQL Editor before using new retailer applications, courier preferences, payment-method selection, Lahore local delivery, nationwide courier orders, store pickup, half-star product ratings, demo review examples, or the six-digit tracking-code flow. It adds and backfills unique tracking codes, delivery areas, fulfillment method, and preferred courier for orders; records the selected payment method; changes review ratings to half-star precision; and configures Lahore local delivery when no rate exists. In Admin → Site settings, review the Lahore rate and confirm delivery details. Other Pakistani cities can submit orders with a selected courier; the CMS order total will show delivery as pending until the store confirms the shipping charge. Previous `UMP-…` references continue to work for order lookup. Terms, privacy, shipping, and returns pages currently contain general draft wording marked as not final; confirm all business and legal details before treating them as active policies.

The CMS also supports order payment-status tracking (unpaid, paid, refunded), searchable and filterable paginated product lists, per-product retailer discount percentages shown to retailer accounts, products linked to managed brands, category reordering, banner image uploads, a live homepage content preview, registered customer/retailer account listings, and admin sign-out. The CMS accounts screen separates Supabase Auth accounts, retailer applications, and guest checkout orders. Guest checkout submissions are order contacts, not login accounts; visitors who only browse are not recorded as customers. Deploy/redeploy `list-customer-accounts` after updating it to show the three sources. Retailer discounts are display-only while wholesale checkout remains disabled. Apply the latest schema before using category reordering, payment-status tracking, or retailer discounts on an existing Supabase project. Lahore orders use local delivery at the configured rate and hide courier selection; nationwide orders outside Lahore require a courier/post preference and the store confirms their delivery charges after submission.

## Deploy on Vercel

1. Push the reviewed code to GitHub and import `zauras25/Mobile-Studio` into Vercel. Use the repository root as the project root; Vercel detects Next.js and uses `npm run build`.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Project Settings → Environment Variables. Configure them for Preview and Production as appropriate. Use a separate Supabase project for Preview if test orders/content must not mix with the live store.
3. Run the reviewed [`supabase/schema.sql`](./supabase/schema.sql) in the intended Supabase project and assign the CMS admin role before testing the CMS or order flow.
4. Deploy a Preview first. Test a customer order, confirm that it appears in the CMS, change its status, and verify the customer can see the updated tracking timeline. Only promote to Production after replacing demo catalog/content with client-approved business information and confirming delivery, returns, payment, and contact details.

Only the public Supabase project URL and anon/publishable key belong in `NEXT_PUBLIC_*` variables. Never add a Supabase service-role key to Vercel client-exposed variables or commit `.env.local`.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
