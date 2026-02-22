-- =============================================================================
-- Module 3 — Vehicle Refactor
-- Merges cekiciler + dorseler into a single araclar table with arac_turleri.
-- Run manually; never run twice (uses IF NOT EXISTS / ON CONFLICT guards).
-- =============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Create arac_turleri
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS arac_turleri (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    ad                  text        UNIQUE NOT NULL,
    motorlu             bool        NOT NULL DEFAULT false,
    muayene_zorunlu     bool        NOT NULL DEFAULT false,
    sigorta_zorunlu     bool        NOT NULL DEFAULT false,
    gps_destekli        bool        NOT NULL DEFAULT false,
    sefere_katilabilir  bool        NOT NULL DEFAULT false,
    dorse_alabilir      bool        NOT NULL DEFAULT false
);

-- Seed — idempotent
INSERT INTO arac_turleri
    (ad, motorlu, muayene_zorunlu, sigorta_zorunlu, gps_destekli, sefere_katilabilir, dorse_alabilir)
VALUES
    ('cekici', true,  true,  true,  true,  true,  true ),
    ('dorse',  false, true,  false, false, false, false),
    ('pikap',  true,  true,  true,  true,  false, false)
ON CONFLICT (ad) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Create araclar
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS araclar (
    id          uuid        PRIMARY KEY,
    plaka       text        UNIQUE NOT NULL,
    tur_id      uuid        NOT NULL REFERENCES arac_turleri(id),
    aktif       bool        NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Migrate cekiciler → araclar  (same UUIDs preserved)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO araclar (id, plaka, tur_id, aktif, created_at)
SELECT
    c.id,
    c.plaka,
    (SELECT id FROM arac_turleri WHERE ad = 'cekici'),
    COALESCE(c.aktif, true),
    now()
FROM cekiciler c
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Migrate dorseler → araclar  (same UUIDs preserved)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO araclar (id, plaka, tur_id, aktif, created_at)
SELECT
    d.id,
    d.plaka,
    (SELECT id FROM arac_turleri WHERE ad = 'dorse'),
    COALESCE(d.aktif, true),
    now()
FROM dorseler d
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Drop existing FK constraints on seferler that point to cekiciler/dorseler
--    (Hibernate auto-names them; discover dynamically)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT kcu.constraint_name
        FROM   information_schema.key_column_usage kcu
        JOIN   information_schema.referential_constraints rc
               ON rc.constraint_name = kcu.constraint_name
        JOIN   information_schema.key_column_usage kcu2
               ON kcu2.constraint_name = rc.unique_constraint_name
        WHERE  kcu.table_name  = 'seferler'
          AND  kcu.column_name IN ('cekici_id', 'dorse_id')
          AND  kcu2.table_name IN ('cekiciler', 'dorseler')
    LOOP
        EXECUTE 'ALTER TABLE seferler DROP CONSTRAINT IF EXISTS '
                || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Re-add FK constraints pointing to araclar
--    UUIDs already match — no column value changes needed.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE seferler
    ADD CONSTRAINT fk_seferler_cekici
        FOREIGN KEY (cekici_id) REFERENCES araclar(id),
    ADD CONSTRAINT fk_seferler_dorse
        FOREIGN KEY (dorse_id)  REFERENCES araclar(id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Drop dependent views, then old tables
-- ─────────────────────────────────────────────────────────────────────────────
DROP VIEW IF EXISTS cekici_ozet;

DROP TABLE IF EXISTS cekiciler;
DROP TABLE IF EXISTS dorseler;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Recreate cekici_ozet against araclar
-- ─────────────────────────────────────────────────────────────────────────────
CREATE VIEW cekici_ozet AS
SELECT
    a.id,
    a.plaka,
    count(s.id)                                                         AS toplam_sefer,
    sum(s.tonaj)                                                        AS toplam_tonaj,
    sum(s.km)                                                           AS toplam_km,
    sum(s.yakit)                                                        AS toplam_yakit,
    round((sum(s.yakit) / NULLIF(sum(s.km), 0)::numeric) * 100, 2)    AS lt_per_100km
FROM araclar a
LEFT JOIN seferler s ON s.cekici_id = a.id
WHERE a.aktif = true
  AND a.tur_id = (SELECT id FROM arac_turleri WHERE ad = 'cekici')
GROUP BY a.id, a.plaka;

COMMIT;
