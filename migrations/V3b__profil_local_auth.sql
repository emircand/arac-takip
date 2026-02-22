-- =============================================================================
-- Module 3b — Profiller: Supabase Auth bağımlılığını kaldır, local auth'a geç
-- =============================================================================

BEGIN;

-- 1. Yeni sütunları ekle
ALTER TABLE profiller
    ADD COLUMN IF NOT EXISTS email      text,
    ADD COLUMN IF NOT EXISTS sifre_hash text,
    ADD COLUMN IF NOT EXISTS aktif      bool NOT NULL DEFAULT true;

-- 2. Mevcut kullanıcının e-postasını auth.users'tan kopyala
UPDATE profiller p
SET    email = u.email
FROM   auth.users u
WHERE  u.id = p.id;

-- 3. Geçici şifre belirle: Admin1234!
--    (bcrypt — Spring Security BCryptPasswordEncoder ile doğrulanabilir)
UPDATE profiller
SET    sifre_hash = crypt('Admin1234!', gen_salt('bf', 10))
WHERE  sifre_hash IS NULL;

-- 4. NOT NULL + UNIQUE kısıtları
ALTER TABLE profiller
    ALTER COLUMN email      SET NOT NULL,
    ALTER COLUMN sifre_hash SET NOT NULL,
    ADD  CONSTRAINT profiller_email_unique UNIQUE (email);

-- 5. Supabase Auth FK'sini kaldır
ALTER TABLE profiller DROP CONSTRAINT IF EXISTS profiller_id_fkey;

-- 6. RLS policy'lerini kaldır (artık Spring Security yönetiyor)
DROP POLICY IF EXISTS "herkes kendi profilini okuyabilir" ON profiller;
DROP POLICY IF EXISTS "yonetici hepsini okuyabilir"      ON profiller;

COMMIT;
