package com.aractakip.yakit;

import com.aractakip.arac.Arac;
import com.aractakip.arac.AracRepository;
import com.aractakip.yakit.dto.YakitDto;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class YakitService {

    private static final DateTimeFormatter TR_DT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    // Sütun indeksleri (0-tabanlı)
    private static final int COL_PLAKA   = 2;
    private static final int COL_UTTS    = 3;
    private static final int COL_LT      = 6;
    private static final int COL_TUTAR   = 7;
    private static final int COL_TARIH   = 8;
    private static final int COL_ISTASYON    = 9;
    private static final int COL_ISTASYON_IL = 10;

    private final AracRepository aracRepository;
    private final YakitRepository yakitRepository;

    /** Excel'i parse et, ön izleme döndür */
    public YakitDto.Preview parseExcel(MultipartFile file) throws IOException {
        // Plaka → Arac haritası (normalize edilmiş)
        Map<String, Arac> plakaMap = aracRepository.findAllByOrderByPlakaAsc().stream()
                .collect(Collectors.toMap(
                        a -> normalizePlaka(a.getPlaka()),
                        a -> a,
                        (a, b) -> a));

        List<YakitDto.Row> matched         = new ArrayList<>();
        List<YakitDto.Unmatched> unmatched = new ArrayList<>();

        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            int rowNum = 0;
            for (Row row : sheet) {
                rowNum++;
                if (rowNum == 1) continue; // başlık satırı

                String plaka = stringCell(row, COL_PLAKA);
                if (plaka == null || plaka.isBlank()) continue;

                String plakaKey = normalizePlaka(plaka);
                Arac arac = plakaMap.get(plakaKey);

                if (arac == null) {
                    unmatched.add(new YakitDto.Unmatched(plaka, rowNum));
                    continue;
                }

                BigDecimal miktarLt = numericCell(row, COL_LT);
                BigDecimal tutar    = numericCell(row, COL_TUTAR);
                LocalDateTime tarih = parseTarih(stringCell(row, COL_TARIH));

                if (miktarLt == null || tarih == null) {
                    unmatched.add(new YakitDto.Unmatched(plaka + " (eksik veri)", rowNum));
                    continue;
                }

                matched.add(new YakitDto.Row(
                        arac.getId(),
                        arac.getPlaka(),
                        tarih,
                        miktarLt,
                        tutar,
                        stringCell(row, COL_ISTASYON),
                        stringCell(row, COL_ISTASYON_IL),
                        stringCell(row, COL_UTTS),
                        false // duplika — henüz bilinmiyor, aşağıda işaretlenecek
                ));
            }
        }

        // Hangi UTTS numaraları DB'de zaten var? → tek sorgu
        Set<String> kandidatUttsNos = matched.stream()
                .map(YakitDto.Row::uttsNo)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<String> mevcutlar = kandidatUttsNos.isEmpty()
                ? Collections.emptySet()
                : yakitRepository.findExistingUttsNos(kandidatUttsNos);

        if (!mevcutlar.isEmpty()) {
            matched = matched.stream().map(r ->
                    r.uttsNo() != null && mevcutlar.contains(r.uttsNo())
                            ? new YakitDto.Row(r.aracId(), r.plaka(), r.tarih(), r.miktarLt(),
                                               r.tutar(), r.istasyon(), r.istasyonIli(), r.uttsNo(), true)
                            : r
            ).toList();
        }

        return new YakitDto.Preview(matched, unmatched);
    }

    /** Onaylanan satırları kaydet — duplika ve zaten kayıtlı olanları atla */
    @Transactional
    public int confirm(List<YakitDto.Row> rows) {
        // Frontend'den duplika:true gelenler zaten işaretli; backend tekrar teyit eder
        Set<String> mevcutUttsNos = rows.stream()
                .map(YakitDto.Row::uttsNo)
                .filter(Objects::nonNull)
                .collect(Collectors.collectingAndThen(
                        Collectors.toSet(),
                        set -> set.isEmpty() ? Collections.emptySet() : yakitRepository.findExistingUttsNos(set)
                ));

        List<YakitDto.Row> temizRows = rows.stream()
                .filter(r -> !r.duplika())
                .filter(r -> r.uttsNo() == null || !mevcutUttsNos.contains(r.uttsNo()))
                .toList();

        if (temizRows.isEmpty()) return 0;

        // ── Anomali tespiti için ön yükleme ──────────────────────────────────────
        Set<UUID> aracIds = temizRows.stream().map(YakitDto.Row::aracId).collect(Collectors.toSet());
        Map<UUID, Arac> aracMap = aracRepository.findAllById(aracIds)
                .stream().collect(Collectors.toMap(Arac::getId, a -> a));

        // Hızlı dolum: DB'de son 24 saatlik kayıtları çek (batch'in en erken tarihinden 4h öncesinden)
        LocalDateTime enErkentarih = temizRows.stream().map(YakitDto.Row::tarih)
                .min(LocalDateTime::compareTo).orElse(LocalDateTime.now()).minusHours(4);
        Map<UUID, List<LocalDateTime>> dbTarihMap = new HashMap<>();
        yakitRepository.findAracIdVeTarihByAracIdsAndTarihAfter(aracIds, enErkentarih)
                .forEach(row -> {
                    UUID aid = (UUID) row[0];
                    LocalDateTime t = (LocalDateTime) row[1];
                    dbTarihMap.computeIfAbsent(aid, k -> new ArrayList<>()).add(t);
                });

        // Batch içi hızlı dolum takibi: araç başına işlenmiş tarihler
        Map<UUID, List<LocalDateTime>> batchTarihMap = new HashMap<>();

        List<Yakit> entities = new ArrayList<>();
        for (YakitDto.Row r : temizRows) {
            Yakit y = new Yakit();
            Arac arac = aracMap.get(r.aracId());
            y.setArac(arac != null ? arac : aracRepository.getReferenceById(r.aracId()));
            y.setTarih(r.tarih());
            y.setMiktarLt(r.miktarLt());
            y.setTutar(r.tutar());
            y.setIstasyon(r.istasyon());
            y.setIstasyonIli(r.istasyonIli());
            y.setUttsNo(r.uttsNo());

            String anomaliTipi = tespit(r, arac, dbTarihMap, batchTarihMap);
            y.setAnomaliTipi(anomaliTipi);
            y.setAnomali(anomaliTipi != null);

            // Bu kaydı batch map'e ekle (sonraki kayıtlar için hızlı dolum kontrolü)
            batchTarihMap.computeIfAbsent(r.aracId(), k -> new ArrayList<>()).add(r.tarih());

            entities.add(y);
        }

        yakitRepository.saveAll(entities);
        return entities.size();
    }

    /** Tek bir yakıt kaydı için anomali tipi döndür — öncelik sırası: hayalet > hızlı > mesai > güzergah */
    private String tespit(YakitDto.Row r, Arac arac,
                           Map<UUID, List<LocalDateTime>> dbTarihMap,
                           Map<UUID, List<LocalDateTime>> batchTarihMap) {
        // 1. Hayalet yakıt: miktar > tank_kapasitesi × 1.1
        if (arac != null && arac.getTur() != null && arac.getTur().getTankKapasitesiLt() != null) {
            BigDecimal limit = BigDecimal.valueOf(arac.getTur().getTankKapasitesiLt() * 1.1);
            if (r.miktarLt().compareTo(limit) > 0) return "hayalet_yakit";
        }

        // 2. Hızlı dolum: aynı araç son 4 saatte başka kayıt var mı?
        List<LocalDateTime> dbTarihler = dbTarihMap.getOrDefault(r.aracId(), Collections.emptyList());
        List<LocalDateTime> batchTarihler = batchTarihMap.getOrDefault(r.aracId(), Collections.emptyList());
        boolean hizliDolum = dbTarihler.stream().anyMatch(t -> Math.abs(java.time.Duration.between(t, r.tarih()).toHours()) < 4)
                || batchTarihler.stream().anyMatch(t -> Math.abs(java.time.Duration.between(t, r.tarih()).toHours()) < 4);
        if (hizliDolum) return "hizli_dolum";

        // 3. Mesai dışı: 22:00–06:00 veya pazar
        int hour = r.tarih().getHour();
        if (hour >= 22 || hour < 6 || r.tarih().getDayOfWeek() == DayOfWeek.SUNDAY) return "mesai_disi";

        // 4. Güzergah dışı: istasyon ili, araç bölgesiyle eşleşmiyor
        if (arac != null && r.istasyonIli() != null && arac.getBolge() != null) {
            String bolgeAd = arac.getBolge().getAd().toUpperCase(Locale.ROOT).trim();
            String il = r.istasyonIli().toUpperCase(Locale.ROOT).trim();
            if (!il.contains(bolgeAd) && !bolgeAd.contains(il)) return "guzergah_disi";
        }

        return null;
    }

    /** Tüm kayıtları listele (opsiyonel araç filtresi) */
    public List<YakitDto.Response> list(UUID aracId) {
        List<Yakit> kayitlar = (aracId != null)
                ? yakitRepository.findByAracIdOrderByTarihDesc(aracId)
                : yakitRepository.findAllByOrderByTarihDesc();
        return kayitlar.stream().map(this::toResponse).toList();
    }

    // ─── yardımcılar ────────────────────────────────────────────────

    private YakitDto.Response toResponse(Yakit y) {
        return new YakitDto.Response(
                y.getId(),
                y.getArac().getId(),
                y.getArac().getPlaka(),
                y.getTarih(),
                y.getMiktarLt(),
                y.getTutar(),
                y.getIstasyon(),
                y.getIstasyonIli(),
                y.getUttsNo(),
                y.isAnomali(),
                y.getAnomaliTipi()
        );
    }

    private static String normalizePlaka(String raw) {
        if (raw == null) return "";
        return raw.trim().toUpperCase(Locale.ROOT).replaceAll("\\s+", "");
    }

    private static String stringCell(Row row, int col) {
        Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                // Tarih sütunu bazen numeric gelebilir; string cast yeterli
                DataFormatter fmt = new DataFormatter();
                yield fmt.formatCellValue(cell).trim();
            }
            default -> null;
        };
    }

    private static BigDecimal numericCell(Row row, int col) {
        Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            return BigDecimal.valueOf(cell.getNumericCellValue());
        }
        if (cell.getCellType() == CellType.STRING) {
            try { return new BigDecimal(cell.getStringCellValue().replace(",", ".")); }
            catch (NumberFormatException e) { return null; }
        }
        return null;
    }

    private static LocalDateTime parseTarih(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try { return LocalDateTime.parse(raw, TR_DT); }
        catch (Exception e) { return null; }
    }
}
