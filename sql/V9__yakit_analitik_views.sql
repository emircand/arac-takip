-- ── Faz 1A: Yakıt Analitik View'ları ──────────────────────────────────────────

-- 1. Araç başına aylık yakıt toplamı (kaynak: yakitlar Excel import)
CREATE VIEW arac_aylik_yakit AS
SELECT
    y.arac_id,
    a.plaka,
    DATE_TRUNC('month', y.tarih)::date                                        AS donem,
    COUNT(*)                                                                   AS dolum_sayisi,
    SUM(y.miktar_lt)                                                           AS toplam_lt,
    SUM(y.tutar)                                                               AS toplam_tutar,
    ROUND(SUM(y.tutar) / NULLIF(SUM(y.miktar_lt), 0), 2)                      AS lt_birim_fiyat
FROM yakitlar y
JOIN araclar a ON a.id = y.arac_id
GROUP BY y.arac_id, a.plaka, DATE_TRUNC('month', y.tarih);

-- 2. Araç başına aylık sefer/km/tonaj özeti (kaynak: seferler)
CREATE VIEW arac_aylik_sefer AS
SELECT
    s.cekici_id                                                                AS arac_id,
    a.plaka,
    DATE_TRUNC('month', s.tarih)::date                                        AS donem,
    COUNT(*)                                                                   AS sefer_sayisi,
    SUM(s.km)                                                                  AS toplam_km,
    SUM(s.tonaj)                                                               AS toplam_tonaj,
    ROUND(AVG(s.tonaj), 0)                                                    AS ort_tonaj
FROM seferler s
JOIN araclar a ON a.id = s.cekici_id
WHERE s.km > 0
GROUP BY s.cekici_id, a.plaka, DATE_TRUNC('month', s.tarih);

-- 3. Ana analitik view — sefer × yakıt FULL JOIN, ay bazlı
CREATE VIEW arac_tuketim_analiz AS
SELECT
    COALESCE(sf.arac_id,    yk.arac_id)                                       AS arac_id,
    COALESCE(sf.plaka,      yk.plaka)                                         AS plaka,
    COALESCE(sf.donem,      yk.donem)                                         AS donem,

    -- Sefer metrikleri
    COALESCE(sf.sefer_sayisi, 0)                                              AS sefer_sayisi,
    COALESCE(sf.toplam_km,    0)                                              AS toplam_km,
    COALESCE(sf.toplam_tonaj, 0)                                              AS toplam_tonaj,
    sf.ort_tonaj,

    -- Yakıt metrikleri
    COALESCE(yk.dolum_sayisi, 0)                                              AS dolum_sayisi,
    COALESCE(yk.toplam_lt,    0)                                              AS toplam_lt,
    yk.lt_birim_fiyat,

    -- Hesaplanan metrikler
    CASE WHEN COALESCE(sf.toplam_km, 0) > 0
         THEN ROUND((yk.toplam_lt / sf.toplam_km) * 100, 2)
    END                                                                        AS lt_per_100km,

    CASE WHEN COALESCE(sf.toplam_km, 0) > 0 AND COALESCE(sf.ort_tonaj, 0) > 0
         THEN ROUND((yk.toplam_lt / sf.toplam_km * 100) / sf.ort_tonaj, 4)
    END                                                                        AS lt_per_100km_per_ton,

    -- Denge skoru: satın alınan - beklenen tüketim (baseline 35 lt/100km)
    ROUND(
        COALESCE(yk.toplam_lt, 0) - (COALESCE(sf.toplam_km, 0) * 0.35),
        2
    )                                                                          AS yakit_denge_lt

FROM arac_aylik_sefer sf
FULL OUTER JOIN arac_aylik_yakit yk
    ON sf.arac_id = yk.arac_id AND sf.donem = yk.donem;
