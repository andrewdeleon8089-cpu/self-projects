-- ============================================================
-- HobbyVault — Supabase Schema
-- Run this in your Supabase project SQL Editor
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- Linked to Supabase Auth users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email     TEXT NOT NULL,
  role      TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
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
-- PRODUCTS TABLE
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

-- Auto-update updated_at
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
-- ORDERS TABLE
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
-- ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(10, 2) NOT NULL
);

-- ============================================================
-- STORED PROCEDURE: Decrement stock
-- Called after a successful order placement
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
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin can see all profiles
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- PRODUCTS — public read, admin write
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "products_admin_insert" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "products_admin_update" ON public.products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "products_admin_delete" ON public.products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ORDERS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_insert_anyone" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (
    auth.uid() = customer_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "orders_admin_update" ON public.orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ORDER ITEMS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_insert_anyone" ON public.order_items
  FOR INSERT WITH CHECK (true);

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
-- STORAGE BUCKET (Run manually in Supabase Dashboard)
-- Go to Storage → New Bucket → Name: "product-images" → Public: ON
-- ============================================================

-- ============================================================
-- SEED DATA (Optional — remove in production)
-- ============================================================
INSERT INTO public.products (name, description, price, stock_quantity, category, is_preorder)
VALUES
  ('Pokémon Scarlet & Violet Booster Box', '36 booster packs. Sealed, brand new.', 2800.00, 15, 'tcg', false),
  ('Magic: The Gathering Commander Deck', 'Pre-built Commander deck, ready to play.', 1200.00, 8, 'tcg', false),
  ('One Piece Card Game — Romance Dawn Booster', '24-pack booster set, first edition.', 1500.00, 5, 'tcg', false),
  ('Gundam RX-78-2 Master Grade 2.0', 'Bandai MG 1/100 scale model kit. Sealed.', 1950.00, 3, 'collectibles', false),
  ('Demon Slayer Nezuko Nendoroid', 'Good Smile Company Nendoroid figure. Mint in box.', 1800.00, 2, 'collectibles', false),
  ('PlayStation 5 Slim', 'Sony PlayStation 5 Slim console with disc drive.', 24995.00, 4, 'consoles', false),
  ('Nintendo Switch OLED', 'Nintendo Switch OLED model, white edition.', 18500.00, 6, 'consoles', false),
  ('Elden Ring — PS5', 'Action RPG, physical edition, sealed.', 1995.00, 10, 'games', false),
  ('Pokémon Scarlet (Switch)', 'Nintendo Switch, physical cartridge, new.', 2200.00, 7, 'games', false),
  ('Sour Cream & Onion Pringles', 'The classic. Great for game nights!', 85.00, 50, 'f_and_b', false),
  ('Monster Energy Zero Sugar', '500ml can, imported.', 120.00, 30, 'f_and_b', false),
  ('Pokémon TCG: Prismatic Evolutions ETB', 'Pre-order! Elite Trainer Box. Estimated Q2 2025.', 3500.00, 0, 'tcg', true)
ON CONFLICT DO NOTHING;

