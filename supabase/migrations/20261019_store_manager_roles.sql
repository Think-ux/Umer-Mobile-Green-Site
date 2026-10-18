create or replace function public.can_manage_store()
returns boolean
language sql
stable
set search_path = public, pg_temp
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'store_manager'),
    false
  );
$$;

revoke all on function public.can_manage_store() from public, anon;
grant execute on function public.can_manage_store() to authenticated;

create or replace function public.move_category(
  p_category_id bigint,
  p_direction integer
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_category_ids bigint[];
  v_current_index integer;
  v_neighbor_index integer;
  v_category_id bigint;
  v_parent_id bigint;
begin
  if not public.can_manage_store() then
    raise exception 'Only an admin or store manager can reorder categories.';
  end if;
  if p_direction not in (-1, 1) then
    raise exception 'Choose a valid category direction.';
  end if;

  select parent_id into v_parent_id
  from public.categories
  where id = p_category_id
  for update;
  if not found then
    raise exception 'Category not found.';
  end if;
  perform 1 from public.categories
  where parent_id is not distinct from v_parent_id
  for update;
  select array_agg(id order by sort_order, id)
  into v_category_ids
  from public.categories
  where parent_id is not distinct from v_parent_id;
  v_current_index := array_position(v_category_ids, p_category_id);
  if v_current_index is null then
    raise exception 'Category not found.';
  end if;

  v_neighbor_index := v_current_index + p_direction;
  if v_neighbor_index < 1 or v_neighbor_index > array_length(v_category_ids, 1) then
    return;
  end if;
  v_category_id := v_category_ids[v_current_index];
  v_category_ids[v_current_index] := v_category_ids[v_neighbor_index];
  v_category_ids[v_neighbor_index] := v_category_id;

  update public.categories as category
  set sort_order = ordered.ordinal::integer,
      updated_at = now()
  from unnest(v_category_ids) with ordinality as ordered(id, ordinal)
  where category.id = ordered.id;
end;
$$;

revoke all on function public.move_category(bigint, integer) from public, anon;
grant execute on function public.move_category(bigint, integer) to authenticated;

drop policy if exists "Admins manage customer orders" on public.customer_orders;
drop policy if exists "Store team manage customer orders" on public.customer_orders;
create policy "Store team manage customer orders"
  on public.customer_orders for all to authenticated
  using (public.can_manage_store())
  with check (public.can_manage_store());

drop policy if exists "Admins read customer order items" on public.customer_order_items;
drop policy if exists "Store team read customer order items" on public.customer_order_items;
create policy "Store team read customer order items"
  on public.customer_order_items for select to authenticated
  using (public.can_manage_store());

drop policy if exists "Admins read customer order status history" on public.customer_order_status_history;
drop policy if exists "Store team read customer order status history" on public.customer_order_status_history;
create policy "Store team read customer order status history"
  on public.customer_order_status_history for select to authenticated
  using (public.can_manage_store());

drop policy if exists "Admins manage retailer applications" on public.retailer_applications;
drop policy if exists "Store team manage retailer applications" on public.retailer_applications;
create policy "Store team manage retailer applications"
  on public.retailer_applications for all to authenticated
  using (public.can_manage_store())
  with check (public.can_manage_store());

drop policy if exists "Admins manage reviews" on public.reviews;
drop policy if exists "Store team manage reviews" on public.reviews;
create policy "Store team manage reviews"
  on public.reviews for all to authenticated
  using (public.can_manage_store())
  with check (public.can_manage_store());

drop policy if exists "Admins upload product images" on storage.objects;
drop policy if exists "Store team upload product images" on storage.objects;
create policy "Store team upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.can_manage_store());

drop policy if exists "Admins update product images" on storage.objects;
drop policy if exists "Store team update product images" on storage.objects;
create policy "Store team update product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.can_manage_store())
  with check (bucket_id = 'product-images' and public.can_manage_store());

drop policy if exists "Admins delete product images" on storage.objects;
drop policy if exists "Store team delete product images" on storage.objects;
create policy "Store team delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.can_manage_store());

drop policy if exists "Admins manage categories" on public.categories;
drop policy if exists "Store team manage categories" on public.categories;
create policy "Store team manage categories"
  on public.categories for all to authenticated
  using (public.can_manage_store())
  with check (public.can_manage_store());

drop policy if exists "Admins manage brands" on public.brands;
drop policy if exists "Store team manage brands" on public.brands;
create policy "Store team manage brands"
  on public.brands for all to authenticated
  using (public.can_manage_store())
  with check (public.can_manage_store());

drop policy if exists "Admins manage products" on public.products;
drop policy if exists "Store team manage products" on public.products;
create policy "Store team manage products"
  on public.products for all to authenticated
  using (public.can_manage_store())
  with check (public.can_manage_store());

drop policy if exists "Admins manage site content" on public.site_content;
drop policy if exists "Store team manage site content" on public.site_content;
create policy "Store team manage site content"
  on public.site_content for all to authenticated
  using (public.can_manage_store())
  with check (public.can_manage_store());

drop policy if exists "Admins manage banners" on public.banners;
drop policy if exists "Store team manage banners" on public.banners;
create policy "Store team manage banners"
  on public.banners for all to authenticated
  using (public.can_manage_store())
  with check (public.can_manage_store());

drop policy if exists "Admins manage site settings" on public.site_settings;
drop policy if exists "Store team manage site settings" on public.site_settings;
create policy "Store team manage site settings"
  on public.site_settings for all to authenticated
  using (public.can_manage_store())
  with check (public.can_manage_store());

drop policy if exists "Admins read retailer documents" on storage.objects;
drop policy if exists "Store team read retailer documents" on storage.objects;
create policy "Store team read retailer documents"
  on storage.objects for select to authenticated
  using (bucket_id = 'retailer-documents' and public.can_manage_store());
