begin;

alter table public.reviews
add column if not exists is_demo boolean not null default false;

-- Preserve order references while removing the preloaded products from the storefront.
update public.products
set is_published = false,
    is_featured = false,
    updated_at = now()
where (slug, image) in (
  ('iphone-13-lcd-premium', 'https://images.unsplash.com/photo-1592286927505-2fd7b8e6b9a0?auto=format&fit=crop&w=900&q=80'),
  ('samsung-a15-lcd', 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=900&q=80'),
  ('iphone-11-battery', 'https://images.unsplash.com/photo-1609592424274-7f7f8f6e8b35?auto=format&fit=crop&w=900&q=80'),
  ('samsung-s23-charging-flex', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=900&q=80'),
  ('iphone-12-camera-glass', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80'),
  ('redmi-note-12-housing', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80')
);

delete from public.reviews
where is_demo = true;

drop index if exists public.reviews_demo_product_unique;

alter table public.reviews
drop column if exists is_demo;

update public.categories category
set count = (
  select count(*)::integer
  from public.products product
  where product.category = category.name
    and product.is_published
);

commit;
