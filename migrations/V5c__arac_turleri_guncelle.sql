-- =============================================================================
-- V5c — Araç türlerini güncelle
-- dorse → semitreyler, pikap → pick-up; yeni türler eklendi.
-- cekici dokunulmadı (cekici_ozet view ad'a göre filtreler).
-- =============================================================================

BEGIN;

-- Mevcut türleri yeniden adlandır
UPDATE arac_turleri SET ad = 'semitreyler' WHERE ad = 'dorse';
UPDATE arac_turleri SET ad = 'pick-up'     WHERE ad = 'pikap';

-- Yeni türler
INSERT INTO arac_turleri (ad, motorlu, muayene_zorunlu, sigorta_zorunlu, gps_destekli, sefere_katilabilir, dorse_alabilir)
VALUES
    ('kamyonet', true, true, true, false, false, false),
    ('otomobil', true, true, true, false, false, false),
    ('suv',      true, true, true, false, false, false),
    ('panelvan', true, true, true, false, false, false)
ON CONFLICT DO NOTHING;

COMMIT;
