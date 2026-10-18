-- Admin-only website configuration.
-- Store managers retain their existing store-management permissions.

create or replace function public.can_manage_site_settings()
returns boolean
language sql
stable
set search_path = public, pg_temp
as $$
  select coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin',
    false
  );
$$;

revoke all on function public.can_manage_site_settings()
from public, anon;

grant execute on function public.can_manage_site_settings()
to authenticated;

-- Website content: CMS admins only.
drop policy if exists "Admins manage site content" on public.site_content;
drop policy if exists "Store team manage site content" on public.site_content;

create policy "Admins manage site content"
on public.site_content
for all
to authenticated
using (public.can_manage_site_settings())
with check (public.can_manage_site_settings());

-- Banners: CMS admins only.
drop policy if exists "Admins manage banners" on public.banners;
drop policy if exists "Store team manage banners" on public.banners;

create policy "Admins manage banners"
on public.banners
for all
to authenticated
using (public.can_manage_site_settings())
with check (public.can_manage_site_settings());

-- Site settings: CMS admins only.
drop policy if exists "Admins manage site settings" on public.site_settings;
drop policy if exists "Store team manage site settings" on public.site_settings;

create policy "Admins manage site settings"
on public.site_settings
for all
to authenticated
using (public.can_manage_site_settings())
with check (public.can_manage_site_settings());
