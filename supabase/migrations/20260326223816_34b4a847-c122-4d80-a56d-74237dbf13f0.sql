
-- 1. Create stores table
CREATE TABLE public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT 'My Store',
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- 2. Security definer functions
CREATE OR REPLACE FUNCTION public.owns_store(_user_id uuid, _store_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.stores WHERE id = _store_id AND owner_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.get_user_store_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.stores WHERE owner_id = _user_id LIMIT 1
$$;

-- 3. Store RLS
CREATE POLICY "Anyone can view stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Owners can update their store" ON public.stores FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Authenticated users can create stores" ON public.stores FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

-- 4. Add store_id columns
ALTER TABLE public.products ADD COLUMN store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
ALTER TABLE public.categories ADD COLUMN store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
ALTER TABLE public.site_settings ADD COLUMN store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
ALTER TABLE public.page_views ADD COLUMN store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;

-- 5. Fix unique constraint on site_settings
ALTER TABLE public.site_settings DROP CONSTRAINT IF EXISTS site_settings_key_key;
ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_store_key UNIQUE (store_id, key);

-- 6. Drop old RLS policies and create store-scoped ones

-- Products
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;

CREATE POLICY "Store owners can insert products" ON public.products FOR INSERT WITH CHECK (public.owns_store(auth.uid(), store_id));
CREATE POLICY "Store owners can update products" ON public.products FOR UPDATE USING (public.owns_store(auth.uid(), store_id));
CREATE POLICY "Store owners can delete products" ON public.products FOR DELETE USING (public.owns_store(auth.uid(), store_id));
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);

-- Categories
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;

CREATE POLICY "Store owners can insert categories" ON public.categories FOR INSERT WITH CHECK (public.owns_store(auth.uid(), store_id));
CREATE POLICY "Store owners can update categories" ON public.categories FOR UPDATE USING (public.owns_store(auth.uid(), store_id));
CREATE POLICY "Store owners can delete categories" ON public.categories FOR DELETE USING (public.owns_store(auth.uid(), store_id));
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);

-- Site Settings
DROP POLICY IF EXISTS "Admins can insert settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can delete settings" ON public.site_settings;
DROP POLICY IF EXISTS "Anyone can view settings" ON public.site_settings;

CREATE POLICY "Store owners can insert settings" ON public.site_settings FOR INSERT WITH CHECK (public.owns_store(auth.uid(), store_id));
CREATE POLICY "Store owners can update settings" ON public.site_settings FOR UPDATE USING (public.owns_store(auth.uid(), store_id));
CREATE POLICY "Store owners can delete settings" ON public.site_settings FOR DELETE USING (public.owns_store(auth.uid(), store_id));
CREATE POLICY "Anyone can view settings" ON public.site_settings FOR SELECT USING (true);

-- Messages
DROP POLICY IF EXISTS "Admins can delete messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can view messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can send messages" ON public.messages;

CREATE POLICY "Store owners can view messages" ON public.messages FOR SELECT USING (public.owns_store(auth.uid(), store_id));
CREATE POLICY "Store owners can delete messages" ON public.messages FOR DELETE USING (public.owns_store(auth.uid(), store_id));
CREATE POLICY "Anyone can send messages" ON public.messages FOR INSERT WITH CHECK (true);

-- Page Views
DROP POLICY IF EXISTS "Admins can view page views" ON public.page_views;
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;

CREATE POLICY "Store owners can view page views" ON public.page_views FOR SELECT USING (public.owns_store(auth.uid(), store_id));
CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);
