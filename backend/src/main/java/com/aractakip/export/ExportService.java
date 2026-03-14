package com.aractakip.export;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final JdbcTemplate jdbc;

    private static final DateTimeFormatter AY_FMT = DateTimeFormatter.ofPattern("MMMM yyyy", new Locale("tr"));

    // ── R1: Araçlar ──────────────────────────────────────────────────────────

    public RaporVeri araclar(Map<String, String> p) {
        StringBuilder sql = new StringBuilder("""
            SELECT a.plaka, at2.ad AS tur, a.marka, a.model_yili, a.sase_no,
                   f.ad AS firma, b.ad AS bolge, s.ad AS sube,
                   a.durumu, a.arvento_no
            FROM araclar a
            LEFT JOIN arac_turleri at2 ON at2.id = a.tur_id
            LEFT JOIN firmalar f       ON f.id = a.firma_id
            LEFT JOIN subeler s        ON s.id = a.sube_id
            LEFT JOIN bolgeler b       ON b.id = s.bolge_id
            WHERE 1=1
            """);
        List<Object> params = new ArrayList<>();
        if (has(p, "durumu"))    { sql.append(" AND a.durumu = ?");   params.add(p.get("durumu")); }
        if (has(p, "tur_id"))    { sql.append(" AND a.tur_id = ?::uuid"); params.add(p.get("tur_id")); }
        if (has(p, "firma_id"))  { sql.append(" AND a.firma_id = ?::uuid"); params.add(p.get("firma_id")); }
        sql.append(" ORDER BY a.plaka");

        List<Object[]> rows = jdbc.query(sql.toString(), params.toArray(),
                (rs, i) -> new Object[]{
                        rs.getString("plaka"), rs.getString("tur"), rs.getString("marka"),
                        rs.getObject("model_yili"), rs.getString("sase_no"),
                        rs.getString("firma"), rs.getString("bolge"), rs.getString("sube"),
                        rs.getString("durumu"), rs.getObject("arvento_no")});

        String[] kolonlar = {"Plaka","Tür","Marka","Model Yılı","Şasi No",
                             "Firma","Bölge","Şube","Durum","Arvento No"};
        return RaporVeri.tekSayfa("Araç Listesi", filtre(p,"durumu","tur_id"),
                "Araçlar", kolonlar, rows, toplam("Toplam: " + rows.size() + " araç", 10));
    }

    // ── R2: Şoförler ─────────────────────────────────────────────────────────

    public RaporVeri soforler(Map<String, String> p) {
        StringBuilder sql = new StringBuilder("""
            SELECT s.ad_soyad, s.telefon, b.ad AS bolge, sb.ad AS sube,
                   CASE WHEN s.aktif THEN 'Aktif' ELSE 'Pasif' END AS durum
            FROM soforler s
            LEFT JOIN subeler sb ON sb.id = s.sube_id
            LEFT JOIN bolgeler b ON b.id = sb.bolge_id
            WHERE 1=1
            """);
        List<Object> params = new ArrayList<>();
        if (has(p, "aktif")) {
            sql.append(" AND s.aktif = ?");
            params.add(Boolean.parseBoolean(p.get("aktif")));
        }
        sql.append(" ORDER BY s.ad_soyad");

        List<Object[]> rows = jdbc.query(sql.toString(), params.toArray(),
                (rs, i) -> new Object[]{
                        rs.getString("ad_soyad"), rs.getString("telefon"),
                        rs.getString("bolge"), rs.getString("sube"), rs.getString("durum")});

        String[] kolonlar = {"Ad Soyad","Telefon","Bölge","Şube","Durum"};
        return RaporVeri.tekSayfa("Şoför Listesi", filtre(p,"aktif"),
                "Şoförler", kolonlar, rows, toplam("Toplam: " + rows.size() + " şoför", 5));
    }

    // ── R3: Seferler ─────────────────────────────────────────────────────────

    public RaporVeri seferler(Map<String, String> p) {
        StringBuilder sql = new StringBuilder("""
            SELECT s.tarih, a.plaka, sf.ad_soyad AS sofor, s.bolge,
                   s.cikis_km, s.donus_km, s.km, s.tonaj, s.notlar
            FROM seferler s
            JOIN araclar a ON a.id = s.cekici_id
            LEFT JOIN soforler sf ON sf.id = s.sofor_id
            WHERE 1=1
            """);
        List<Object> params = new ArrayList<>();
        if (has(p, "baslangic")) { sql.append(" AND s.tarih >= ?::date"); params.add(p.get("baslangic")); }
        if (has(p, "bitis"))     { sql.append(" AND s.tarih <= ?::date"); params.add(p.get("bitis")); }
        if (has(p, "arac_id"))   { sql.append(" AND s.cekici_id = ?::uuid"); params.add(p.get("arac_id")); }
        if (has(p, "sofor_id"))  { sql.append(" AND s.sofor_id = ?::uuid");  params.add(p.get("sofor_id")); }
        if (has(p, "bolge"))     { sql.append(" AND s.bolge = ?");  params.add(p.get("bolge")); }
        sql.append(" ORDER BY s.tarih DESC");

        List<Object[]> rows = jdbc.query(sql.toString(), params.toArray(),
                (rs, i) -> new Object[]{
                        rs.getDate("tarih") != null ? rs.getDate("tarih").toLocalDate() : null,
                        rs.getString("plaka"), rs.getString("sofor"), rs.getString("bolge"),
                        rs.getObject("cikis_km"), rs.getObject("donus_km"),
                        rs.getObject("km"), rs.getObject("tonaj"), rs.getString("notlar")});

        long topKm    = rows.stream().mapToLong(r -> toLong(r[6])).sum();
        long topTonaj = rows.stream().mapToLong(r -> toLong(r[7])).sum();
        Object[] toplam = {"TOPLAM (" + rows.size() + " sefer)", null, null, null,
                           null, null, topKm, topTonaj, null};

        String[] kolonlar = {"Tarih","Plaka","Şoför","Bölge","Çıkış KM","Dönüş KM","KM","Tonaj (kg)","Notlar"};
        return RaporVeri.tekSayfa("Sefer Dökümü", tarihFiltre(p), "Seferler", kolonlar, rows, toplam);
    }

    // ── R4: Yakıtlar ─────────────────────────────────────────────────────────

    public RaporVeri yakitlar(Map<String, String> p) {
        StringBuilder sql = new StringBuilder("""
            SELECT y.tarih, a.plaka, y.miktar_lt, y.tutar,
                   ROUND(y.tutar / NULLIF(y.miktar_lt,0), 2) AS lt_birim_fiyat,
                   y.istasyon, y.istasyon_ili, y.utts_no,
                   COALESCE(y.anomali_tipi, '-') AS anomali_tipi
            FROM yakitlar y
            JOIN araclar a ON a.id = y.arac_id
            WHERE 1=1
            """);
        List<Object> params = new ArrayList<>();
        if (has(p, "baslangic")) { sql.append(" AND y.tarih >= ?::timestamp"); params.add(p.get("baslangic")); }
        if (has(p, "bitis"))     { sql.append(" AND y.tarih <= ?::timestamp + INTERVAL '1 day'"); params.add(p.get("bitis")); }
        if (has(p, "arac_id"))   { sql.append(" AND y.arac_id = ?::uuid"); params.add(p.get("arac_id")); }
        if ("true".equals(p.get("sadece_anomaliler"))) { sql.append(" AND y.anomali_tipi IS NOT NULL"); }
        sql.append(" ORDER BY y.tarih DESC");

        List<Object[]> rows = jdbc.query(sql.toString(), params.toArray(),
                (rs, i) -> new Object[]{
                        rs.getTimestamp("tarih") != null ? rs.getTimestamp("tarih").toLocalDateTime() : null,
                        rs.getString("plaka"), rs.getBigDecimal("miktar_lt"),
                        rs.getBigDecimal("tutar"), rs.getBigDecimal("lt_birim_fiyat"),
                        rs.getString("istasyon"), rs.getString("istasyon_ili"),
                        rs.getString("utts_no"), rs.getString("anomali_tipi")});

        double topLt    = rows.stream().mapToDouble(r -> toDouble(r[2])).sum();
        double topTutar = rows.stream().mapToDouble(r -> toDouble(r[3])).sum();
        Object[] toplam = {"TOPLAM (" + rows.size() + " kayıt)", null,
                           round(topLt), round(topTutar),
                           round(topLt > 0 ? topTutar / topLt : 0),
                           null, null, null, null};

        String[] kolonlar = {"Tarih","Plaka","Miktar (lt)","Tutar (₺)","lt/₺",
                             "İstasyon","İl","UTTS No","Anomali"};
        return RaporVeri.tekSayfa("Yakıt Dökümü", tarihFiltre(p), "Yakıtlar", kolonlar, rows, toplam);
    }

    // ── R5: Arızalar (2 sheet) ────────────────────────────────────────────────

    public RaporVeri arizalar(Map<String, String> p) {
        // Sheet 1: Arıza listesi
        StringBuilder sql1 = new StringBuilder("""
            SELECT a.bildirim_zamani, ar.plaka, a.baslik, a.durum,
                   CASE WHEN a.calisalamaz THEN 'Evet' ELSE 'Hayır' END AS calisalamaz,
                   a.islem_yapan, a.tamamlandi_at, a.aciklama
            FROM arizalar a
            JOIN araclar ar ON ar.id = a.arac_id
            WHERE 1=1
            """);
        List<Object> p1 = new ArrayList<>();
        if (has(p, "baslangic")) { sql1.append(" AND a.bildirim_zamani >= ?::timestamp"); p1.add(p.get("baslangic")); }
        if (has(p, "bitis"))     { sql1.append(" AND a.bildirim_zamani <= ?::timestamp + INTERVAL '1 day'"); p1.add(p.get("bitis")); }
        if (has(p, "arac_id"))   { sql1.append(" AND a.arac_id = ?::uuid"); p1.add(p.get("arac_id")); }
        if (has(p, "durum"))     { sql1.append(" AND a.durum = ?"); p1.add(p.get("durum")); }
        sql1.append(" ORDER BY a.bildirim_zamani DESC");

        List<Object[]> rows1 = jdbc.query(sql1.toString(), p1.toArray(),
                (rs, i) -> new Object[]{
                        rs.getTimestamp("bildirim_zamani") != null ? rs.getTimestamp("bildirim_zamani").toLocalDateTime() : null,
                        rs.getString("plaka"), rs.getString("baslik"), rs.getString("durum"),
                        rs.getString("calisalamaz"), rs.getString("islem_yapan"),
                        rs.getTimestamp("tamamlandi_at") != null ? rs.getTimestamp("tamamlandi_at").toLocalDateTime() : null,
                        rs.getString("aciklama")});

        // Sheet 2: Parça kullanımı
        List<Object[]> rows2 = jdbc.query("""
            SELECT ar.plaka, a.baslik, ap.parca_adi, ap.miktar, ap.birim,
                   CASE WHEN ap.kullanildi THEN 'Kullanıldı' ELSE 'Bekliyor' END AS durum
            FROM ariza_parcalar ap
            JOIN arizalar a ON a.id = ap.ariza_id
            JOIN araclar ar ON ar.id = a.arac_id
            ORDER BY ar.plaka, a.baslik, ap.parca_adi
            """,
                (rs, i) -> new Object[]{
                        rs.getString("plaka"), rs.getString("baslik"),
                        rs.getString("parca_adi"), rs.getBigDecimal("miktar"),
                        rs.getString("birim"), rs.getString("durum")});

        var sayfa1 = new RaporVeri.Sayfa("Arızalar",
                new String[]{"Tarih","Plaka","Başlık","Durum","Çalışamaz","İşlem Yapan","Tamamlanma","Açıklama"},
                rows1, toplam("TOPLAM: " + rows1.size() + " arıza", 8));

        var sayfa2 = new RaporVeri.Sayfa("Parçalar",
                new String[]{"Plaka","Arıza","Parça Adı","Miktar","Birim","Durum"},
                rows2, toplam("TOPLAM: " + rows2.size() + " parça kaydı", 6));

        return new RaporVeri("Arıza Raporu", tarihFiltre(p),
                List.of(sayfa1, sayfa2), false);
    }

    // ── R6: Stok ─────────────────────────────────────────────────────────────

    public RaporVeri stok(Map<String, String> p) {
        String sql = """
            SELECT sk.stok_adi, sk.kodu, sk.birim,
                   sk.devir, sk.giris, sk.cikis,
                   (sk.devir + sk.giris - sk.cikis) AS bakiye,
                   CASE WHEN (sk.devir + sk.giris - sk.cikis) <= 0 THEN 'Tükendi'
                        WHEN (sk.devir + sk.giris - sk.cikis) <= 5 THEN 'Az Kaldı'
                        ELSE 'Yeterli' END AS durum
            FROM stok_kalemleri sk
            """ + ("true".equals(p.get("sadece_kritik")) ?
                " WHERE (sk.devir + sk.giris - sk.cikis) <= 5 " : "") +
            " ORDER BY sk.stok_adi";

        List<Object[]> rows = jdbc.query(sql,
                (rs, i) -> new Object[]{
                        rs.getString("stok_adi"), rs.getString("kodu"), rs.getString("birim"),
                        rs.getBigDecimal("devir"), rs.getBigDecimal("giris"), rs.getBigDecimal("cikis"),
                        rs.getBigDecimal("bakiye"), rs.getString("durum")});

        double topGiris  = rows.stream().mapToDouble(r -> toDouble(r[4])).sum();
        double topCikis  = rows.stream().mapToDouble(r -> toDouble(r[5])).sum();
        double topBakiye = rows.stream().mapToDouble(r -> toDouble(r[6])).sum();
        Object[] toplam = {"TOPLAM (" + rows.size() + " kalem)", null, null,
                           null, round(topGiris), round(topCikis), round(topBakiye), null};

        String[] kolonlar = {"Stok Adı","Kod","Birim","Devir","Giriş","Çıkış","Bakiye","Durum"};
        return RaporVeri.tekSayfa("Stok Durumu",
                "true".equals(p.get("sadece_kritik")) ? "Sadece kritik (bakiye ≤ 5)" : null,
                "Stok", kolonlar, rows, toplam);
    }

    // ── R7: Belgeler ─────────────────────────────────────────────────────────

    public RaporVeri belgeler(Map<String, String> p) {
        int gun = p.containsKey("gun") ? Integer.parseInt(p.get("gun")) : 60;
        StringBuilder sql = new StringBuilder("""
            SELECT a.plaka, ab.belge_turu,
                   ab.bitis_tarihi,
                   (ab.bitis_tarihi - CURRENT_DATE) AS kalan_gun,
                   CASE WHEN ab.bitis_tarihi < CURRENT_DATE                          THEN 'Süresi Dolmuş'
                        WHEN ab.bitis_tarihi <= CURRENT_DATE + INTERVAL '15 days'    THEN 'Kritik'
                        WHEN ab.bitis_tarihi <= CURRENT_DATE + INTERVAL '30 days'    THEN 'Uyarı'
                        ELSE 'Geçerli' END AS durum,
                   b.ad AS bolge, s.ad AS sube, f.ad AS firma
            FROM arac_belgeler ab
            JOIN araclar a ON a.id = ab.arac_id
            LEFT JOIN subeler s ON s.id = a.sube_id
            LEFT JOIN bolgeler b ON b.id = s.bolge_id
            LEFT JOIN firmalar f ON f.id = a.firma_id
            WHERE ab.bitis_tarihi <= CURRENT_DATE + INTERVAL '1 day' * ?
            """);
        List<Object> params = new ArrayList<>();
        params.add(gun);
        if (has(p, "belge_turu")) { sql.append(" AND ab.belge_turu = ?"); params.add(p.get("belge_turu")); }
        if (has(p, "bolge_id"))   { sql.append(" AND b.id = ?"); params.add(Integer.parseInt(p.get("bolge_id"))); }
        sql.append(" ORDER BY ab.bitis_tarihi ASC");

        List<Object[]> rows = jdbc.query(sql.toString(), params.toArray(),
                (rs, i) -> new Object[]{
                        rs.getString("plaka"), rs.getString("belge_turu"),
                        rs.getDate("bitis_tarihi") != null ? rs.getDate("bitis_tarihi").toLocalDate() : null,
                        rs.getObject("kalan_gun"),
                        rs.getString("durum"), rs.getString("bolge"),
                        rs.getString("sube"), rs.getString("firma")});

        String[] kolonlar = {"Plaka","Belge Türü","Bitiş Tarihi","Kalan Gün",
                             "Durum","Bölge","Şube","Firma"};
        return RaporVeri.tekSayfa("Belge Takibi",
                "Son " + gun + " gün" + (has(p,"belge_turu") ? ", tür: " + p.get("belge_turu") : ""),
                "Belgeler", kolonlar, rows, toplam("TOPLAM: " + rows.size() + " belge", 8));
    }

    // ── R8: Yakıt Analitik (2 sheet) ─────────────────────────────────────────

    public RaporVeri yakitAnaliz(Map<String, String> p) {
        // Sheet 1: Aylık tüketim
        StringBuilder sql1 = new StringBuilder("""
            SELECT plaka, to_char(donem,'YYYY-MM') AS donem,
                   sefer_sayisi, toplam_km, toplam_tonaj,
                   dolum_sayisi, toplam_lt, lt_per_100km,
                   lt_per_100km_per_ton, yakit_denge_lt
            FROM arac_tuketim_analiz
            WHERE 1=1
            """);
        List<Object> p1 = new ArrayList<>();
        if (has(p, "baslangic")) { sql1.append(" AND donem >= ?::date"); p1.add(p.get("baslangic") + "-01"); }
        if (has(p, "bitis"))     { sql1.append(" AND donem <= ?::date"); p1.add(p.get("bitis") + "-01"); }
        sql1.append(" ORDER BY plaka, donem");

        List<Object[]> rows1 = jdbc.query(sql1.toString(), p1.toArray(),
                (rs, i) -> new Object[]{
                        rs.getString("plaka"), rs.getString("donem"),
                        rs.getInt("sefer_sayisi"), rs.getLong("toplam_km"),
                        rs.getLong("toplam_tonaj"), rs.getInt("dolum_sayisi"),
                        rs.getBigDecimal("toplam_lt"), rs.getBigDecimal("lt_per_100km"),
                        rs.getBigDecimal("lt_per_100km_per_ton"), rs.getBigDecimal("yakit_denge_lt")});

        // Sheet 2: Risk tablosu (son dönem)
        List<Object[]> rows2 = jdbc.query("""
            SELECT plaka, to_char(donem,'YYYY-MM') AS donem,
                   lt_per_100km, baseline_3ay, sapma_pct, z_skoru,
                   CASE WHEN ABS(COALESCE(z_skoru,0)) > 3 OR COALESCE(sapma_pct,0) > 50 THEN 'KRİTİK'
                        WHEN ABS(COALESCE(z_skoru,0)) > 2 OR COALESCE(sapma_pct,0) > 25 THEN 'ŞÜPHE'
                        WHEN ABS(COALESCE(z_skoru,0)) > 1 OR COALESCE(sapma_pct,0) > 10 THEN 'DİKKAT'
                        ELSE 'NORMAL' END AS risk
            FROM arac_tuketim_baseline
            WHERE (arac_id, donem) IN (
                SELECT arac_id, MAX(donem) FROM arac_tuketim_baseline GROUP BY arac_id
            )
            ORDER BY sapma_pct DESC NULLS LAST
            """,
                (rs, i) -> new Object[]{
                        rs.getString("plaka"), rs.getString("donem"),
                        rs.getBigDecimal("lt_per_100km"), rs.getBigDecimal("baseline_3ay"),
                        rs.getBigDecimal("sapma_pct"), rs.getBigDecimal("z_skoru"),
                        rs.getString("risk")});

        var sayfa1 = new RaporVeri.Sayfa("Aylık Tüketim",
                new String[]{"Plaka","Dönem","Sefer","Toplam KM","Toplam Tonaj","Dolum",
                             "Toplam lt","lt/100km","lt/100km/ton","Yakıt Dengesi"},
                rows1, null);

        var sayfa2 = new RaporVeri.Sayfa("Risk Tablosu",
                new String[]{"Plaka","Dönem","lt/100km","Baseline (3ay)","Sapma %","Z-Skoru","Risk"},
                rows2, null);

        String donemBilgi = (has(p,"baslangic") ? p.get("baslangic") : "") +
                (has(p,"bitis") ? " – " + p.get("bitis") : "");

        return new RaporVeri("Yakıt Analitik Raporu",
                donemBilgi.isBlank() ? "Tüm dönemler" : donemBilgi,
                List.of(sayfa1, sayfa2), true);
    }

    // ── Yardımcılar ───────────────────────────────────────────────────────────

    private static boolean has(Map<String, String> p, String key) {
        return p.containsKey(key) && p.get(key) != null && !p.get(key).isBlank();
    }

    private static String filtre(Map<String, String> p, String... keys) {
        StringBuilder sb = new StringBuilder();
        for (String k : keys) {
            if (has(p, k)) {
                if (!sb.isEmpty()) sb.append(", ");
                sb.append(k).append("=").append(p.get(k));
            }
        }
        return sb.isEmpty() ? null : sb.toString();
    }

    private static String tarihFiltre(Map<String, String> p) {
        String b = p.getOrDefault("baslangic", "");
        String e = p.getOrDefault("bitis", "");
        if (b.isBlank() && e.isBlank()) return "Tüm tarihler";
        if (b.isBlank()) return "—  → " + e;
        if (e.isBlank()) return b + "  → bugün";
        return b + "  →  " + e;
    }

    private static Object[] toplam(String etiket, int kolonSayisi) {
        Object[] t = new Object[kolonSayisi];
        t[0] = etiket;
        return t;
    }

    private static long toLong(Object o) {
        return o instanceof Number n ? n.longValue() : 0L;
    }

    private static double toDouble(Object o) {
        return o instanceof Number n ? n.doubleValue() : 0.0;
    }

    private static BigDecimal round(double v) {
        return BigDecimal.valueOf(Math.round(v * 100.0) / 100.0);
    }
}
