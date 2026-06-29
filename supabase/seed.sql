-- ============================================================================
-- Seed catalog — the 10 ciders + farm-store goods, with starting stock.
-- Idempotent: re-running updates price/stock by slug instead of duplicating.
-- ============================================================================
insert into public.products (slug, name, tier, category, description, price_cents, image_url, abv, stock_quantity, sort_order)
values
  -- Flagship — $9.50
  ('meadowlark-red',  'Meadowlark Red',  'Flagship', 'cider', 'Our signature estate cider. Balanced, medium-dry, and endlessly drinkable. The one that started it all.', 950, 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=700&q=80', '5% ABV', 48, 10),
  ('meadowlark-gold', 'Meadowlark Gold', 'Flagship', 'cider', 'A slightly sweeter expression of our estate apples — golden and bright, with a clean Kansas finish.', 950, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&q=80', '5% ABV', 48, 11),
  ('meadow-hopper',   'Meadow Hopper',   'Flagship', 'cider', 'Dry-hopped hard cider with a subtle herbal edge. A crossover for the craft beer crowd.', 950, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80', '5% ABV', 36, 12),
  -- Sturnella Reserve — $14
  ('peach-cider',      'Peach Cider',      'Sturnella Reserve', 'cider', 'Fermented with our own Meadowlark peaches. Stone fruit aroma, bright finish, and a warmth that''s unmistakably Kansas summer.', 1400, 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=700&q=80', '5% ABV', 30, 20),
  ('blackberry-cider', 'Blackberry Cider', 'Sturnella Reserve', 'cider', 'Deep berry character layered over a dry cider base. Dark, complex, and worth every sip.', 1400, 'https://images.unsplash.com/photo-1464976062524-40e5b2199126?w=700&q=80', '5% ABV', 24, 21),
  ('strawberry-cider', 'Strawberry Cider', 'Sturnella Reserve', 'cider', 'Made with May-harvest strawberries from the farm. Fragrant, semi-sweet, and bright red in the glass.', 1400, 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=700&q=80', '5% ABV', 24, 22),
  ('scrumpy',          'Scrumpy',          'Sturnella Reserve', 'cider', 'Traditional English-style cider — rough, rustic, and full of character. Made the old way, no apologies.', 1400, 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=700&q=80', '5% ABV', 18, 23),
  ('farmhouse-funk',   'Farmhouse Funk',   'Sturnella Reserve', 'cider', 'Wild-fermented with native orchard yeasts. Funky, complex, and a little unpredictable — just like the best things in life.', 1400, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=80', '5% ABV', 18, 24),
  -- Fine Cider — $18
  ('prize-22',    'Prize 22',    'Fine Cider', 'cider', 'Our flagship fine cider — named for the 2022 harvest. Exceptionally balanced, from a single apple variety at peak ripeness.', 1800, 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=700&q=80', '5% ABV', 12, 30),
  ('all-seasons', 'All Seasons', 'Fine Cider', 'cider', 'A blend across the full year''s harvest — spring, summer, fall. Every sip holds the whole orchard.', 1800, 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=700&q=80', '5% ABV', 12, 31),
  -- Farm Store goods
  ('apple-butter',  'Apple Butter',  'Farm Store', 'farm-good', 'Slow-cooked from estate apples. Spiced, dark, and deeply concentrated.', 800, 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&q=80', null, 40, 40),
  ('cider-mustard', 'Cider Mustard', 'Farm Store', 'farm-good', 'Made with Meadowlark hard cider. Goes on everything.', 700, 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=80', null, 40, 41),
  ('peach-jam',     'Peach Jam',     'Farm Store', 'farm-good', 'Orchard peaches, cane sugar, nothing else.', 900, 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80', null, 40, 42),
  ('farm-salsa',    'Farm Salsa',    'Farm Store', 'farm-good', 'Tomatoes, peppers, and herbs from the farm and local partners.', 800, 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&q=80', null, 40, 43)
on conflict (slug) do update
  set name = excluded.name,
      tier = excluded.tier,
      category = excluded.category,
      description = excluded.description,
      price_cents = excluded.price_cents,
      image_url = excluded.image_url,
      abv = excluded.abv,
      stock_quantity = excluded.stock_quantity,
      sort_order = excluded.sort_order,
      updated_at = now();
