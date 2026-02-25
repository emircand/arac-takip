-- =============================================================================
-- V5b — Belge tablosunu sadeleştir
-- Kullanılmayan alanlar kaldırıldı; arvato_gps için cihaz_no eklendi.
-- =============================================================================

BEGIN;

ALTER TABLE arac_belgeler
    DROP COLUMN IF EXISTS baslangic_tarihi,
    DROP COLUMN IF EXISTS police_no,
    DROP COLUMN IF EXISTS kurum,
    DROP COLUMN IF EXISTS tutar,
    DROP COLUMN IF EXISTS notlar,
    ADD COLUMN IF NOT EXISTS cihaz_no varchar(50);

COMMIT;
