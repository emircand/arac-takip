-- Faz 4A: Araç başına 3-aylık hareketli ortalama + 6-aylık standart sapma + z-skoru
CREATE VIEW arac_tuketim_baseline AS
SELECT
    arac_id,
    plaka,
    donem,
    lt_per_100km,

    -- 3 aylık (dahil) hareketli ortalama
    AVG(lt_per_100km) OVER (
        PARTITION BY arac_id
        ORDER BY donem
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    )                                                          AS baseline_3ay,

    -- 6 aylık (dahil) standart sapma
    STDDEV(lt_per_100km) OVER (
        PARTITION BY arac_id
        ORDER BY donem
        ROWS BETWEEN 5 PRECEDING AND CURRENT ROW
    )                                                          AS std_6ay,

    -- Z-skoru: (bu ay - baseline) / std  → |z|>2 anomali, |z|>3 kritik
    CASE
        WHEN STDDEV(lt_per_100km) OVER (
                 PARTITION BY arac_id
                 ORDER BY donem
                 ROWS BETWEEN 5 PRECEDING AND CURRENT ROW
             ) > 0
        THEN ROUND(
            (lt_per_100km - AVG(lt_per_100km) OVER (
                PARTITION BY arac_id
                ORDER BY donem
                ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
            )) /
            STDDEV(lt_per_100km) OVER (
                PARTITION BY arac_id
                ORDER BY donem
                ROWS BETWEEN 5 PRECEDING AND CURRENT ROW
            ),
            2
        )
    END                                                        AS z_skoru,

    -- % sapma: (bu ay - baseline) / baseline * 100
    CASE
        WHEN AVG(lt_per_100km) OVER (
                 PARTITION BY arac_id
                 ORDER BY donem
                 ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
             ) > 0
        THEN ROUND(
            (lt_per_100km - AVG(lt_per_100km) OVER (
                PARTITION BY arac_id
                ORDER BY donem
                ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
            )) /
            AVG(lt_per_100km) OVER (
                PARTITION BY arac_id
                ORDER BY donem
                ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
            ) * 100,
            1
        )
    END                                                        AS sapma_pct

FROM arac_tuketim_analiz
WHERE lt_per_100km IS NOT NULL;
