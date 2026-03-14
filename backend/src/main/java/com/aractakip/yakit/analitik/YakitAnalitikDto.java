package com.aractakip.yakit.analitik;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class YakitAnalitikDto {

    /** Aylık tüketim noktası — trend grafiği için */
    public record DonemVeri(
            LocalDate donem,
            int seferSayisi,
            long toplamKm,
            long toplamTonaj,
            Integer ortTonaj,
            int dolumSayisi,
            BigDecimal toplamLt,
            BigDecimal ltPer100km,
            BigDecimal ltPer100kmPerTon,
            BigDecimal yakitDengeLt
    ) {}

    /** Araç bazlı trend — GET /api/dashboard/yakit/trend */
    public record TrendResponse(
            UUID aracId,
            String plaka,
            List<DonemVeri> data
    ) {}

    /** Tek araç/dönem satırı — karşılaştırma tablosu için */
    public record KarsilastirmaRow(
            UUID aracId,
            String plaka,
            LocalDate donem,
            BigDecimal ltPer100km,
            long toplamKm,
            BigDecimal toplamLt,
            BigDecimal yakitDengeLt
    ) {}

    /** Anomali satırı — GET /api/dashboard/yakit/anomaliler */
    public record AnomalilerRow(
            UUID yakitId,
            UUID aracId,
            String plaka,
            LocalDateTime tarih,
            BigDecimal miktarLt,
            String anomaliTipi,
            String istasyon,
            String istasyonIli
    ) {}

    /** Araç özeti — GET /api/dashboard/yakit/ozet/{arac_id} */
    public record OzetResponse(
            UUID aracId,
            String plaka,
            List<DonemVeri> son12Ay,
            BigDecimal baselineLtPer100km,   // son 3 ayın ortalaması
            BigDecimal sonDonemLtPer100km,   // en son ay
            BigDecimal sapmaPct,             // % sapma
            String riskSeviyesi             // NORMAL / DIKKAT / SUPHE / KRITIK
    ) {}

    /** Filo risk özeti — GET /api/dashboard/yakit/risk */
    public record RiskRow(
            UUID aracId,
            String plaka,
            LocalDate donem,
            BigDecimal ltPer100km,
            BigDecimal baseline3ay,
            BigDecimal sapmaPct,
            BigDecimal zSkoru,
            String riskSeviyesi
    ) {}
}
