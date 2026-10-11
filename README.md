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
3. In Supabase Authentication, create the admin user and disable public sign-ups.
4. In the SQL Editor, grant that account the CMS admin role. Replace the email before running:

   ```sql
   update auth.users
   set raw_app_meta_data =
     coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where email = 'admin@example.com';
   ```

5. Copy `.env.example` to `.env.local` and add the project's **Project URL** and **anon/publishable key** from Supabase Project Settings → API.
6. Restart the development server and sign in at `/admin/login`.

The browser uses only the public anon/publishable key. Do not put a Supabase service-role key in `.env.local` or browser code. Database row-level security restricts CMS edits to accounts with the `app_metadata.role = admin` claim.

Connected CMS data includes products, categories, brands, homepage copy, banners, store/delivery settings, retailer applications, product reviews, and customer orders. Customer checkout submits orders to Supabase; order lookups require both the order number and checkout phone number. Admins can update order status and customers see a status timeline. The order-creation database function uses current published product prices and stock, and computes delivery charges only when delivery settings are verified. Retailer applications require a private shop/business proof upload; admins can review it and record a reason for each final decision. Product reviews are held for moderation and only appear publicly after approval.

## Deploy on Vercel

1. Push the reviewed code to GitHub and import `zauras25/Mobile-Studio` into Vercel. Use the repository root as the project root; Vercel detects Next.js and uses `npm run build`.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Project Settings → Environment Variables. Configure them for Preview and Production as appropriate. Use a separate Supabase project for Preview if test orders/content must not mix with the live store.
3. Run the reviewed [`supabase/schema.sql`](./supabase/schema.sql) in the intended Supabase project and assign the CMS admin role before testing the CMS or order flow.
4. Deploy a Preview first. Test a customer order, confirm that it appears in the CMS, change its status, and verify the customer can see the updated tracking timeline. Only promote to Production after replacing demo catalog/content with client-approved business information and confirming delivery, returns, payment, and contact details.

Only the public Supabase project URL and anon/publishable key belong in `NEXT_PUBLIC_*` variables. Never add a Supabase service-role key to Vercel client-exposed variables or commit `.env.local`.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
