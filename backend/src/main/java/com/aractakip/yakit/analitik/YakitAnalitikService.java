package com.aractakip.yakit.analitik;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class YakitAnalitikService {

    private final JdbcTemplate jdbc;

    // ── Trend ─────────────────────────────────────────────────────────────────

    /**
     * Araç(lar)ın aylık tüketim trendi.
     * aracId null → tüm araçlar; baslangic/bitis null → tüm dönemler
     */
    public List<YakitAnalitikDto.TrendResponse> getTrend(UUID aracId, String baslangic, String bitis) {
        StringBuilder sql = new StringBuilder(
                "SELECT arac_id, plaka, donem, sefer_sayisi, toplam_km, toplam_tonaj, " +
                "ort_tonaj, dolum_sayisi, toplam_lt, lt_per_100km, lt_per_100km_per_ton, yakit_denge_lt " +
                "FROM arac_tuketim_analiz WHERE 1=1 ");

        List<Object> params = new ArrayList<>();
        if (aracId != null) {
            sql.append("AND arac_id = ? ");
            params.add(aracId);
        }
        if (baslangic != null) {
            sql.append("AND donem >= ?::date ");
            params.add(baslangic + "-01");
        }
        if (bitis != null) {
            sql.append("AND donem <= ?::date ");
            params.add(bitis + "-01");
        }
        sql.append("ORDER BY arac_id, donem");

        List<Map<String, Object>> rows = jdbc.queryForList(sql.toString(), params.toArray());

        // araç bazlı gruplama
        Map<UUID, List<Map<String, Object>>> byArac = new LinkedHashMap<>();
        Map<UUID, String> plakalar = new LinkedHashMap<>();
        for (Map<String, Object> row : rows) {
            UUID aid = (UUID) row.get("arac_id");
            byArac.computeIfAbsent(aid, k -> new ArrayList<>()).add(row);
            plakalar.putIfAbsent(aid, (String) row.get("plaka"));
        }

        return byArac.entrySet().stream()
                .map(e -> new YakitAnalitikDto.TrendResponse(
                        e.getKey(),
                        plakalar.get(e.getKey()),
                        e.getValue().stream().map(this::toDonemVeri).toList()
                ))
                .toList();
    }

    // ── Karşılaştırma ─────────────────────────────────────────────────────────

    /** Belirli dönemde tüm araçların karşılaştırması — lt/100km'ye göre azalan sıra */
    public List<YakitAnalitikDto.KarsilastirmaRow> getKarsilastirma(String donem) {
        String sql = "SELECT arac_id, plaka, donem, lt_per_100km, toplam_km, toplam_lt, yakit_denge_lt " +
                     "FROM arac_tuketim_analiz " +
                     "WHERE donem = ?::date AND lt_per_100km IS NOT NULL " +
                     "ORDER BY lt_per_100km DESC";

        String donemDate = (donem != null ? donem : LocalDate.now().withDayOfMonth(1).toString()) + "-01";
        // normalize: "2025-01" → "2025-01-01"
        if (donemDate.length() == 7) donemDate = donemDate + "-01";

        return jdbc.query(sql, (rs, i) -> new YakitAnalitikDto.KarsilastirmaRow(
                UUID.fromString(rs.getString("arac_id")),
                rs.getString("plaka"),
                rs.getDate("donem").toLocalDate(),
                toBD(rs.getBigDecimal("lt_per_100km")),
                rs.getLong("toplam_km"),
                toBD(rs.getBigDecimal("toplam_lt")),
                toBD(rs.getBigDecimal("yakit_denge_lt"))
        ), donemDate);
    }

    // ── Anomaliler ────────────────────────────────────────────────────────────

    /** Son N günde anomali tipi set edilmiş yakıt kayıtları */
    public List<YakitAnalitikDto.AnomalilerRow> getAnomaliler(int gun) {
        String sql = "SELECT y.id, y.arac_id, a.plaka, y.tarih, y.miktar_lt, " +
                     "y.anomali_tipi, y.istasyon, y.istasyon_ili " +
                     "FROM yakitlar y JOIN araclar a ON a.id = y.arac_id " +
                     "WHERE y.anomali_tipi IS NOT NULL " +
                     "AND y.tarih >= NOW() - INTERVAL '1 day' * ? " +
                     "ORDER BY y.tarih DESC";

        return jdbc.query(sql, (rs, i) -> new YakitAnalitikDto.AnomalilerRow(
                UUID.fromString(rs.getString("id")),
                UUID.fromString(rs.getString("arac_id")),
                rs.getString("plaka"),
                rs.getTimestamp("tarih").toLocalDateTime(),
                toBD(rs.getBigDecimal("miktar_lt")),
                rs.getString("anomali_tipi"),
                rs.getString("istasyon"),
                rs.getString("istasyon_ili")
        ), gun);
    }

    // ── Özet ──────────────────────────────────────────────────────────────────

    /** Araç bazlı: son 12 ay trend + baseline + sapma + risk seviyesi */
    public YakitAnalitikDto.OzetResponse getOzet(UUID aracId) {
        String sql = "SELECT arac_id, plaka, donem, sefer_sayisi, toplam_km, toplam_tonaj, " +
                     "ort_tonaj, dolum_sayisi, toplam_lt, lt_per_100km, lt_per_100km_per_ton, yakit_denge_lt " +
                     "FROM arac_tuketim_analiz " +
                     "WHERE arac_id = ? AND donem >= (CURRENT_DATE - INTERVAL '12 months')::date " +
                     "ORDER BY donem DESC";

        List<YakitAnalitikDto.DonemVeri> aylar = jdbc.query(sql,
                (rs, i) -> toDonemVeri(rsToMap(rs)), aracId);

        if (aylar.isEmpty()) {
            return new YakitAnalitikDto.OzetResponse(aracId, null, aylar, null, null, null, "NORMAL");
        }

        String plaka = jdbc.queryForObject(
                "SELECT plaka FROM araclar WHERE id = ?", String.class, aracId);

        // Son dönem
        BigDecimal sonDonem = aylar.stream()
                .filter(a -> a.ltPer100km() != null)
                .map(YakitAnalitikDto.DonemVeri::ltPer100km)
                .findFirst().orElse(null);

        // Baseline: son 3 ayın (son dönem hariç) ortalaması
        List<BigDecimal> oncekiAylar = aylar.stream()
                .skip(1)
                .filter(a -> a.ltPer100km() != null)
                .limit(3)
                .map(YakitAnalitikDto.DonemVeri::ltPer100km)
                .toList();

        BigDecimal baseline = null;
        if (!oncekiAylar.isEmpty()) {
            BigDecimal toplam = oncekiAylar.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
            baseline = toplam.divide(BigDecimal.valueOf(oncekiAylar.size()), 2, RoundingMode.HALF_UP);
        }

        BigDecimal sapmaPct = null;
        String risk = "NORMAL";
        if (sonDonem != null && baseline != null && baseline.compareTo(BigDecimal.ZERO) > 0) {
            sapmaPct = sonDonem.subtract(baseline)
                    .divide(baseline, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP);

            double sapma = sapmaPct.doubleValue();
            if (sapma > 50) risk = "KRITIK";
            else if (sapma > 25) risk = "SUPHE";
            else if (sapma > 10) risk = "DIKKAT";
        }

        return new YakitAnalitikDto.OzetResponse(
                aracId, plaka,
                aylar,
                baseline, sonDonem, sapmaPct, risk
        );
    }

    // ── Risk (Faz 4B) ─────────────────────────────────────────────────────────

    /**
     * Tüm araçların son dönem risk seviyesi — z-skoru + % sapma üzerinden.
     * GET /api/dashboard/yakit/risk
     */
    public List<YakitAnalitikDto.RiskRow> getRisk() {
        String sql = """
                SELECT arac_id, plaka, donem, lt_per_100km,
                       baseline_3ay, sapma_pct, z_skoru
                FROM arac_tuketim_baseline
                WHERE (arac_id, donem) IN (
                    SELECT arac_id, MAX(donem)
                    FROM arac_tuketim_baseline
                    GROUP BY arac_id
                )
                ORDER BY sapma_pct DESC NULLS LAST
                """;

        return jdbc.query(sql, (rs, i) -> {
            BigDecimal sapmaPct = toBD(rs.getBigDecimal("sapma_pct"));
            BigDecimal zSkoru   = toBD(rs.getBigDecimal("z_skoru"));
            String risk = riskHesapla(sapmaPct, zSkoru);
            return new YakitAnalitikDto.RiskRow(
                    UUID.fromString(rs.getString("arac_id")),
                    rs.getString("plaka"),
                    rs.getDate("donem").toLocalDate(),
                    toBD(rs.getBigDecimal("lt_per_100km")),
                    toBD(rs.getBigDecimal("baseline_3ay")),
                    sapmaPct,
                    zSkoru,
                    risk
            );
        });
    }

    /** % sapma + z-skoru kombinasyonundan risk seviyesi */
    public static String riskHesapla(BigDecimal sapmaPct, BigDecimal zSkoru) {
        double z = zSkoru != null ? Math.abs(zSkoru.doubleValue()) : 0;
        double sapma = sapmaPct != null ? sapmaPct.doubleValue() : 0;
        if (z > 3 || sapma > 50)  return "KRITIK";
        if (z > 2 || sapma > 25)  return "SUPHE";
        if (z > 1 || sapma > 10)  return "DIKKAT";
        return "NORMAL";
    }

    // ── Yardımcılar ───────────────────────────────────────────────────────────

    private YakitAnalitikDto.DonemVeri toDonemVeri(Map<String, Object> row) {
        return new YakitAnalitikDto.DonemVeri(
                toLocalDate(row.get("donem")),
                toInt(row.get("sefer_sayisi")),
                toLong(row.get("toplam_km")),
                toLong(row.get("toplam_tonaj")),
                row.get("ort_tonaj") != null ? ((Number) row.get("ort_tonaj")).intValue() : null,
                toInt(row.get("dolum_sayisi")),
                toBD(row.get("toplam_lt")),
                toBD(row.get("lt_per_100km")),
                toBD(row.get("lt_per_100km_per_ton")),
                toBD(row.get("yakit_denge_lt"))
        );
    }

    private Map<String, Object> rsToMap(java.sql.ResultSet rs) throws java.sql.SQLException {
        Map<String, Object> map = new LinkedHashMap<>();
        int cols = rs.getMetaData().getColumnCount();
        for (int i = 1; i <= cols; i++) {
            map.put(rs.getMetaData().getColumnName(i), rs.getObject(i));
        }
        return map;
    }

    private static LocalDate toLocalDate(Object o) {
        if (o == null) return null;
        if (o instanceof Date d) return d.toLocalDate();
        if (o instanceof LocalDate ld) return ld;
        return null;
    }

    private static BigDecimal toBD(Object o) {
        if (o == null) return null;
        if (o instanceof BigDecimal bd) return bd;
        if (o instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        return null;
    }

    private static int toInt(Object o) {
        return o instanceof Number n ? n.intValue() : 0;
    }

    private static long toLong(Object o) {
        return o instanceof Number n ? n.longValue() : 0L;
    }
}
