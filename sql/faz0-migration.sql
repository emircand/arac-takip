-- =============================================================================
-- FAZ 0 — Veri Modeli Zenginleştirme
-- Güvenli: tüm ALTER'lar IF NOT EXISTS kullanır, tekrar çalıştırılabilir.
-- =============================================================================

BEGIN;

-- ─── 1. bolgeler ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bolgeler (
    id    SERIAL      PRIMARY KEY,
    ad    VARCHAR(50) NOT NULL UNIQUE,
    aktif BOOLEAN     NOT NULL DEFAULT true
);

INSERT INTO bolgeler (ad) VALUES
    ('AKSU'),
    ('ANDIRIN'),
    ('ÇAĞLAYANCERİT'),
    ('EKİNÖZÜ'),
    ('ELBİSTAN'),
    ('GÖKSUN'),
    ('NURHAK'),
    ('PAZARCIK'),
    ('TÜRKOĞLU')
ON CONFLICT (ad) DO NOTHING;

-- ─── 2. araclar ──────────────────────────────────────────────────────────────

ALTER TABLE araclar
    ADD COLUMN IF NOT EXISTS marka          VARCHAR(50),
    ADD COLUMN IF NOT EXISTS model_yili     INTEGER,
    ADD COLUMN IF NOT EXISTS cinsi          VARCHAR(100),
    ADD COLUMN IF NOT EXISTS renk           VARCHAR(30),
    ADD COLUMN IF NOT EXISTS motor_gucu     INTEGER,
    ADD COLUMN IF NOT EXISTS silindir_hacmi INTEGER,
    ADD COLUMN IF NOT EXISTS sase_no        VARCHAR(50),
    ADD COLUMN IF NOT EXISTS firma          VARCHAR(50),
    ADD COLUMN IF NOT EXISTS bos_agirlik    INTEGER,
    ADD COLUMN IF NOT EXISTS lastik_tipi    VARCHAR(50),
    ADD COLUMN IF NOT EXISTS arvento_no     INTEGER,
    ADD COLUMN IF NOT EXISTS bolge_id       INTEGER REFERENCES bolgeler(id),
    ADD COLUMN IF NOT EXISTS sube           VARCHAR(50),
    ADD COLUMN IF NOT EXISTS onceki_plaka   VARCHAR(20),
    ADD COLUMN IF NOT EXISTS durumu         VARCHAR(20) NOT NULL DEFAULT 'aktif';

-- ─── 3. seferler ─────────────────────────────────────────────────────────────
-- cikis_saati ve donus_saati zaten mevcut — atlanıyor.
-- alinan_yakit: seferde alınan yakıt (mevcut yakit = sefer yakıt tüketimi)

ALTER TABLE seferler
    ADD COLUMN IF NOT EXISTS alinan_yakit DECIMAL(10, 2);

-- ─── 4. soforler ─────────────────────────────────────────────────────────────

ALTER TABLE soforler
    ADD COLUMN IF NOT EXISTS bolge_id INTEGER REFERENCES bolgeler(id);

-- ─── 5. Views — drop & recreate ──────────────────────────────────────────────

DROP VIEW IF EXISTS cekici_ozet CASCADE;
DROP VIEW IF EXISTS sofor_ozet CASCADE;
DROP VIEW IF EXISTS gunluk_bolge_ozet CASCADE;

CREATE VIEW cekici_ozet AS
SELECT
    a.id,
    a.plaka,
    a.marka,
    count(s.id)                                                          AS toplam_sefer,
    sum(s.tonaj)                                                         AS toplam_tonaj,
    sum(s.km)                                                            AS toplam_km,
    sum(s.yakit)                                                         AS toplam_yakit,
    sum(s.alinan_yakit)                                                  AS toplam_alinan_yakit,
    round((sum(s.yakit) / NULLIF(sum(s.km), 0)::numeric) * 100, 2)     AS lt_per_100km
FROM araclar a
LEFT JOIN seferler s ON s.cekici_id = a.id
WHERE a.aktif = true
  AND a.tur_id = (SELECT id FROM arac_turleri WHERE ad = 'cekici')
GROUP BY a.id, a.plaka, a.marka;

CREATE VIEW sofor_ozet AS
SELECT
    sf.id,
    sf.ad_soyad,
    count(s.id)  AS toplam_sefer,
    sum(s.tonaj) AS toplam_tonaj,
    sum(s.km)    AS toplam_km
FROM soforler sf
LEFT JOIN seferler s ON s.sofor_id = sf.id
WHERE sf.aktif = true
GROUP BY sf.id, sf.ad_soyad;

CREATE VIEW gunluk_bolge_ozet AS
SELECT
    tarih,
    bolge,
    count(*)                  AS sefer_sayisi,
    sum(tonaj)                AS toplam_tonaj,
    sum(km)                   AS toplam_km,
    sum(yakit)                AS toplam_yakit,
    count(DISTINCT cekici_id) AS aktif_cekici,
    count(DISTINCT sofor_id)  AS aktif_sofor
FROM seferler
GROUP BY tarih, bolge
ORDER BY tarih DESC, sum(tonaj) DESC;

COMMIT;
