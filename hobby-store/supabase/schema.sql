-- ============================================================
-- HobbyVault — Complete Supabase Database Schema
-- Run this in your Supabase project SQL Editor
-- ============================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. PROFILES TABLE (Linked to Supabase Auth users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: Automatically create a profile row whenever a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  description       TEXT,
  price             NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock_quantity    INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  image_url         TEXT,
  category          TEXT NOT NULL CHECK (category IN ('tcg', 'collectibles', 'consoles', 'games', 'f_and_b')),
  is_preorder       BOOLEAN NOT NULL DEFAULT FALSE,
  preorder_est_date TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: Auto-update updated_at timestamp on edit
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 4. ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_name      TEXT,
  guest_contact   TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  total_price     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(10, 2) NOT NULL
);

-- ============================================================
-- 6. STORED PROCEDURE: Decrement Stock
-- Called after checkout to safely update stock counts
-- ============================================================
CREATE OR REPLACE FUNCTION public.decrement_stock(p_product_id UUID, p_qty INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.products
  SET stock_quantity = GREATEST(0, stock_quantity - p_qty)
  WHERE id = p_product_id;
END;
$$;

-- ============================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- --- PROFILES ---
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- --- PRODUCTS (Public can browse, only admin can insert/update/delete) ---
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_read" ON public.products;
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "products_admin_insert" ON public.products;
CREATE POLICY "products_admin_insert" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "products_admin_update" ON public.products;
CREATE POLICY "products_admin_update" ON public.products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "products_admin_delete" ON public.products;
CREATE POLICY "products_admin_delete" ON public.products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- --- ORDERS ---
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_insert_anyone" ON public.orders;
CREATE POLICY "orders_insert_anyone" ON public.orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (
    auth.uid() = customer_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "orders_admin_update" ON public.orders;
CREATE POLICY "orders_admin_update" ON public.orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- --- ORDER ITEMS ---
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_insert_anyone" ON public.order_items;
CREATE POLICY "order_items_insert_anyone" ON public.order_items
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "order_items_select_own_or_admin" ON public.order_items;
CREATE POLICY "order_items_select_own_or_admin" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND (
        o.customer_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- ============================================================
-- 8. INITIAL SEED DATA (Sample Products)
-- ============================================================
INSERT INTO public.products (name, description, price, stock_quantity, category, is_preorder, preorder_est_date)
VALUES
  ('Pokémon Scarlet & Violet Booster Box', '36 booster packs. Factory sealed, brand new English edition.', 2800.00, 15, 'tcg', false, null),
  ('Magic: The Gathering Commander Deck', 'Pre-built 100-card Commander deck, ready to play out of the box.', 1200.00, 8, 'tcg', false, null),
  ('One Piece Card Game — Romance Dawn Booster Box', '24-pack booster set, original Japanese first edition.', 1500.00, 5, 'tcg', false, null),
  ('Gundam RX-78-2 Master Grade 2.0', 'Bandai MG 1/100 scale model kit. High detail articulation.', 1950.00, 3, 'collectibles', false, null),
  ('Demon Slayer Nezuko Kamado Nendoroid', 'Good Smile Company authentic Nendoroid action figure. Mint in box.', 1800.00, 2, 'collectibles', false, null),
  ('PlayStation 5 Slim (Disc Edition)', 'Sony PlayStation 5 Slim console with 1TB SSD and DualSense wireless controller.', 24995.00, 4, 'consoles', false, null),
  ('Nintendo Switch OLED Model', 'Nintendo Switch OLED 64GB console, white Joy-Con edition.', 18500.00, 6, 'consoles', false, null),
  ('Elden Ring — PlayStation 5', 'Bandai Namco Action RPG by FromSoftware. Physical disc edition, sealed.', 1995.00, 10, 'games', false, null),
  ('The Legend of Zelda: Tears of the Kingdom', 'Nintendo Switch physical game cartridge, brand new sealed.', 2200.00, 7, 'games', false, null),
  ('Sour Cream & Onion Pringles (110g)', 'Classic game night snack canister.', 85.00, 50, 'f_and_b', false, null),
  ('Monster Energy Drink (Zero Sugar 500ml)', 'Ice-cold carbonated energy drink can.', 120.00, 30, 'f_and_b', false, null),
  ('Pokémon TCG: Prismatic Evolutions Elite Trainer Box', 'Upcoming release! Pre-order allocation. Ships upon arrival.', 3500.00, 0, 'tcg', true, 'May 2025')
ON CONFLICT DO NOTHING;