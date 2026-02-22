-- =============================================================================
-- FAZ 1 — Lokasyon Hiyerarşisi: depolar → bolgeler → subeler + firmalar
-- Güvenli: tekrar çalıştırılabilir (idempotent)
-- =============================================================================

BEGIN;

-- ─── 1. firmalar ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS firmalar (
    id    SERIAL       PRIMARY KEY,
    ad    VARCHAR(100) NOT NULL UNIQUE,
    aktif BOOLEAN      NOT NULL DEFAULT true
);

INSERT INTO firmalar (ad) VALUES ('BONEMO'), ('LİDER') ON CONFLICT (ad) DO NOTHING;

-- ─── 2. depolar ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS depolar (
    id    SERIAL       PRIMARY KEY,
    ad    VARCHAR(100) NOT NULL UNIQUE,
    aktif BOOLEAN      NOT NULL DEFAULT true
);

INSERT INTO depolar (ad) VALUES ('Çöp Garajı'), ('Ankara Depo') ON CONFLICT (ad) DO NOTHING;

-- ─── 3. Eski bolgeler → subeler ───────────────────────────────────────────────
-- Mevcut bolgeler (AKSU, ANDIRIN, vb.) gerçekte şube seviyesindedir.
-- Tabloyu subeler olarak yeniden adlandırıyoruz, yeni bolgeler tablosu ayrıca oluşturulacak.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'subeler'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'bolgeler'
    ) THEN
        -- FK kısıtlamalarını kaldır
        EXECUTE 'ALTER TABLE araclar  DROP CONSTRAINT IF EXISTS araclar_bolge_id_fkey';
        EXECUTE 'ALTER TABLE soforler DROP CONSTRAINT IF EXISTS soforler_bolge_id_fkey';
        -- PK constraint'i yeniden adlandır (yeni bolgeler tablosuyla çakışmasın)
        EXECUTE 'ALTER TABLE bolgeler RENAME CONSTRAINT bolgeler_pkey TO subeler_pkey';
        -- Unique constraint'i kaldır (yeni formatta eklenecek)
        EXECUTE 'ALTER TABLE bolgeler DROP CONSTRAINT IF EXISTS bolgeler_ad_key';
        -- Tabloyu yeniden adlandır
        EXECUTE 'ALTER TABLE bolgeler RENAME TO subeler';
        -- Sequence'i yeniden adlandır
        EXECUTE 'ALTER SEQUENCE IF EXISTS bolgeler_id_seq RENAME TO subeler_id_seq';
    END IF;
END $$;

-- ─── 4. Yeni bolgeler tablosu ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bolgeler (
    id      SERIAL      PRIMARY KEY,
    ad      VARCHAR(50) NOT NULL,
    depo_id INTEGER     NOT NULL REFERENCES depolar(id),
    aktif   BOOLEAN     NOT NULL DEFAULT true,
    UNIQUE (ad, depo_id)
);

INSERT INTO bolgeler (ad, depo_id)
SELECT 'KAHRAMANMARAŞ', d.id FROM depolar d WHERE d.ad = 'Çöp Garajı'
ON CONFLICT (ad, depo_id) DO NOTHING;

INSERT INTO bolgeler (ad, depo_id)
SELECT 'ANKARA', d.id FROM depolar d WHERE d.ad = 'Ankara Depo'
ON CONFLICT (ad, depo_id) DO NOTHING;

-- ─── 5. subeler.bolge_id ──────────────────────────────────────────────────────

ALTER TABLE subeler ADD COLUMN IF NOT EXISTS bolge_id INTEGER REFERENCES bolgeler(id);

-- Mevcut şubeleri KAHRAMANMARAŞ bölgesine bağla
UPDATE subeler
   SET bolge_id = (SELECT id FROM bolgeler WHERE ad = 'KAHRAMANMARAŞ')
 WHERE bolge_id IS NULL;

-- UNIQUE(ad, bolge_id) kısıtı
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'subeler'
          AND constraint_name = 'subeler_ad_bolge_key'
    ) THEN
        EXECUTE 'ALTER TABLE subeler ADD CONSTRAINT subeler_ad_bolge_key UNIQUE (ad, bolge_id)';
    END IF;
END $$;

-- Ankara şubelerini ekle
INSERT INTO subeler (ad, bolge_id)
VALUES
    ('SİNCAN', (SELECT id FROM bolgeler WHERE ad = 'ANKARA')),
    ('OFİS',   (SELECT id FROM bolgeler WHERE ad = 'ANKARA'))
ON CONFLICT (ad, bolge_id) DO NOTHING;

-- ─── 6. araclar: bolge_id → sube_id + firma_id ───────────────────────────────

DO $$
BEGIN
    -- bolge_id → sube_id rename
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'araclar' AND column_name = 'bolge_id'
    ) THEN
        EXECUTE 'ALTER TABLE araclar RENAME COLUMN bolge_id TO sube_id';
    END IF;
    -- FK kısıtı
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public' AND table_name = 'araclar'
          AND constraint_name = 'araclar_sube_id_fkey'
    ) THEN
        EXECUTE 'ALTER TABLE araclar ADD CONSTRAINT araclar_sube_id_fkey FOREIGN KEY (sube_id) REFERENCES subeler(id)';
    END IF;
END $$;

ALTER TABLE araclar ADD COLUMN IF NOT EXISTS firma_id INTEGER REFERENCES firmalar(id);

-- ─── 7. soforler: bolge_id → sube_id ─────────────────────────────────────────

DO $$
BEGIN
    -- bolge_id → sube_id rename
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'soforler' AND column_name = 'bolge_id'
    ) THEN
        EXECUTE 'ALTER TABLE soforler RENAME COLUMN bolge_id TO sube_id';
    END IF;
    -- FK kısıtı
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public' AND table_name = 'soforler'
          AND constraint_name = 'soforler_sube_id_fkey'
    ) THEN
        EXECUTE 'ALTER TABLE soforler ADD CONSTRAINT soforler_sube_id_fkey FOREIGN KEY (sube_id) REFERENCES subeler(id)';
    END IF;
END $$;

COMMIT;

-- ─── 8. İzinler (yeni tablolar postgres kullanıcısı tarafından oluşturulmuşsa) ─
-- Bu adım idempotent: zaten verilmiş izinlerde GRANT hatasız çalışır.
GRANT ALL ON TABLE firmalar TO aractakip;
GRANT ALL ON TABLE depolar  TO aractakip;
GRANT ALL ON TABLE bolgeler TO aractakip;
GRANT USAGE, SELECT ON SEQUENCE firmalar_id_seq TO aractakip;
GRANT USAGE, SELECT ON SEQUENCE depolar_id_seq  TO aractakip;
GRANT USAGE, SELECT ON SEQUENCE bolgeler_id_seq TO aractakip;
