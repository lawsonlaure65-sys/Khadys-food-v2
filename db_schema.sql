-- ==============================================================================
-- KHADY'S FOOD & EVENT - SCRIPT SQL OFFICIEL SUPABASE (Complet & Prêt à l'emploi)
-- Exécutez ce script dans Supabase > SQL Editor > "New Query" > "Run"
-- ==============================================================================

-- 1. TABLE DU MENU (PLATS & SPÉCIALITÉS)
CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image TEXT,
    category TEXT NOT NULL,
    rating NUMERIC DEFAULT 5,
    is_available BOOLEAN DEFAULT true,
    is_spicy BOOLEAN DEFAULT false,
    is_specialite_maison BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLE DES COMMANDES
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    items JSONB NOT NULL,
    total NUMERIC NOT NULL,
    delivery_fee NUMERIC NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'RECEIVED',
    payment_method TEXT NOT NULL,
    district TEXT,
    address TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLE DES PARAMÈTRES GLOBAUX (Plat du Jour, Photo Admin, Bannières, Codes Promo)
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ACTIVER LA SÉCURITÉ ROW LEVEL SECURITY (RLS)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- 5. POLITIQUES PERMISSIVES POUR CLÉ ANON (Lecture & Écriture Publiques)
DROP POLICY IF EXISTS "Public Full Access menu_items" ON menu_items;
CREATE POLICY "Public Full Access menu_items" ON menu_items 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access orders" ON orders;
CREATE POLICY "Public Full Access orders" ON orders 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access app_settings" ON app_settings;
CREATE POLICY "Public Full Access app_settings" ON app_settings 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 6. PUBLICATION TEMPS RÉEL (SUPABASE REALTIME)
-- Permet aux téléphones et ordinateurs connectés de recevoir les mises à jour instantanément
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE menu_items, orders, app_settings;
COMMIT;

-- 7. DONNÉES INITIALES DU MENU
INSERT INTO menu_items (id, name, description, price, image, category, rating, is_specialite_maison, is_spicy)
VALUES 
('sp1', 'Tiep Royal Khady', 'Le chef-d''œuvre de la maison au poisson capitaine, riz rouge parfumé et légumes fondants.', 5500, 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=800', 'Spécialité Maison', 5, true, true),
('sp2', 'Couscous Royal Khady', 'Couscous fin fait main, agneau tendre, boulettes kefta maison, légumes du Sahel & pois chiches mijotés.', 6500, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800', 'Spécialité Maison', 5, true, false),
('af1', 'Mafé Boeuf Express', 'Sauce arachide onctueuse de Bamako, viande de bœuf fondante et riz blanc parfumé.', 3500, 'https://images.unsplash.com/photo-1541518763531-4a949439a3f8?w=800', 'Plat Africain', 5, false, false),
('gr1', 'Suya Dibi d''Agneau au Feu de Bois', 'Fines lamelles d''agneau mariné au Kankankan du Sahel, oignons caramélisés et piment doux.', 4500, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', 'Grillade & Dibi', 5, true, true)
ON CONFLICT (id) DO NOTHING;
