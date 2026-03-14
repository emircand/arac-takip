package com.aractakip.export.builder;

import com.aractakip.export.RaporVeri;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class XlsxBuilder {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd.MM.yyyy");
    private static final DateTimeFormatter DT_FMT   = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

    // Renkler (RGB)
    private static final byte[] KOYU_MAVI  = {(byte)0x1E, (byte)0x3A, (byte)0x5F};
    private static final byte[] ACIK_MAVI  = {(byte)0xD0, (byte)0xE4, (byte)0xF5};
    private static final byte[] ZEBRA_GRIS = {(byte)0xF5, (byte)0xF5, (byte)0xF5};
    private static final byte[] TOPLAM_BG  = {(byte)0xE8, (byte)0xF0, (byte)0xFE};

    public byte[] build(RaporVeri rapor) {
        try (SXSSFWorkbook wb = new SXSSFWorkbook(100)) {
            wb.setCompressTempFiles(true);

            for (RaporVeri.Sayfa sayfa : rapor.getSayfalar()) {
                Sheet sheet = wb.createSheet(sayfa.ad());
                yazSayfa(wb, sheet, rapor, sayfa);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("XLSX oluşturulamadı", e);
        }
    }

    private void yazSayfa(SXSSFWorkbook wb, Sheet sheet, RaporVeri rapor, RaporVeri.Sayfa sayfa) {
        int satirNo = 0;
        int kolonSayisi = sayfa.kolonlar().length;

        // ── Başlık satırı ──────────────────────────────────────────────────
        Row baslikRow = sheet.createRow(satirNo++);
        baslikRow.setHeightInPoints(24);
        Cell baslikCell = baslikRow.createCell(0);
        baslikCell.setCellValue(rapor.getBaslik());
        baslikCell.setCellStyle(baslikStili(wb));
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, kolonSayisi - 1));

        // ── Filtre bilgisi ─────────────────────────────────────────────────
        if (rapor.getFiltreBilgisi() != null && !rapor.getFiltreBilgisi().isBlank()) {
            Row filtreRow = sheet.createRow(satirNo++);
            Cell filtreCell = filtreRow.createCell(0);
            filtreCell.setCellValue("Filtreler: " + rapor.getFiltreBilgisi()
                    + "    Oluşturulma: " + LocalDateTime.now().format(DT_FMT));
            filtreCell.setCellStyle(filtreStili(wb));
            sheet.addMergedRegion(new CellRangeAddress(satirNo - 1, satirNo - 1, 0, kolonSayisi - 1));
        }

        // ── Boş satır ─────────────────────────────────────────────────────
        sheet.createRow(satirNo++);

        // ── Kolon başlıkları ───────────────────────────────────────────────
        Row headerRow = sheet.createRow(satirNo++);
        headerRow.setHeightInPoints(16);
        CellStyle headerStil = headerStili(wb);
        for (int c = 0; c < sayfa.kolonlar().length; c++) {
            Cell cell = headerRow.createCell(c);
            cell.setCellValue(sayfa.kolonlar()[c]);
            cell.setCellStyle(headerStil);
        }

        // ── Veri satırları ─────────────────────────────────────────────────
        CellStyle[] veriStiller = {veriStili(wb, false), veriStili(wb, true)};
        int satirIndex = 0;
        for (Object[] satirVeri : sayfa.satirlar()) {
            Row row = sheet.createRow(satirNo++);
            CellStyle stil = veriStiller[satirIndex % 2];
            for (int c = 0; c < satirVeri.length && c < kolonSayisi; c++) {
                Cell cell = row.createCell(c);
                setCellValue(cell, satirVeri[c], stil, wb);
            }
            satirIndex++;
        }

        // ── Toplam satırı ─────────────────────────────────────────────────
        if (sayfa.toplamSatiri() != null) {
            Row toplamRow = sheet.createRow(satirNo);
            toplamRow.setHeightInPoints(16);
            CellStyle toplamStil = toplamStili(wb);
            for (int c = 0; c < sayfa.toplamSatiri().length && c < kolonSayisi; c++) {
                Cell cell = toplamRow.createCell(c);
                setCellValue(cell, sayfa.toplamSatiri()[c], toplamStil, wb);
            }
        }

        // ── Auto column width ──────────────────────────────────────────────
        SXSSFSheet sxSheet = (SXSSFSheet) sheet;
        for (int c = 0; c < kolonSayisi; c++) {
            sxSheet.trackColumnForAutoSizing(c);
            sxSheet.autoSizeColumn(c);
            int genislik = sxSheet.getColumnWidth(c);
            sxSheet.setColumnWidth(c, Math.min(genislik + 512, 15000)); // max ~55 char
        }
    }

    private void setCellValue(Cell cell, Object val, CellStyle stil, SXSSFWorkbook wb) {
        cell.setCellStyle(stil);
        if (val == null) {
            cell.setCellValue("—");
        } else if (val instanceof Number n) {
            cell.setCellValue(n.doubleValue());
        } else if (val instanceof Boolean b) {
            cell.setCellValue(b ? "Evet" : "Hayır");
        } else if (val instanceof LocalDate d) {
            cell.setCellValue(d.format(DATE_FMT));
        } else if (val instanceof LocalDateTime dt) {
            cell.setCellValue(dt.format(DT_FMT));
        } else if (val instanceof java.time.Instant inst) {
            cell.setCellValue(LocalDateTime.ofInstant(inst, java.time.ZoneId.systemDefault()).format(DT_FMT));
        } else {
            cell.setCellValue(val.toString());
        }
    }

    // ── Stil fabrikası ────────────────────────────────────────────────────────

    private CellStyle baslikStili(SXSSFWorkbook wb) {
        CellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(xssfColor(wb, KOYU_MAVI));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.LEFT);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        Font f = wb.createFont();
        f.setBold(true);
        f.setFontHeightInPoints((short) 14);
        f.setColor(IndexedColors.WHITE.getIndex());
        s.setFont(f);
        return s;
    }

    private CellStyle filtreStili(SXSSFWorkbook wb) {
        CellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font f = wb.createFont();
        f.setItalic(true);
        f.setFontHeightInPoints((short) 9);
        s.setFont(f);
        return s;
    }

    private CellStyle headerStili(SXSSFWorkbook wb) {
        CellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(xssfColor(wb, ACIK_MAVI));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setBorderBottom(BorderStyle.THIN);
        s.setBorderTop(BorderStyle.THIN);
        s.setAlignment(HorizontalAlignment.CENTER);
        Font f = wb.createFont();
        f.setBold(true);
        f.setFontHeightInPoints((short) 10);
        s.setFont(f);
        return s;
    }

    private CellStyle veriStili(SXSSFWorkbook wb, boolean zebra) {
        CellStyle s = wb.createCellStyle();
        if (zebra) {
            s.setFillForegroundColor(xssfColor(wb, ZEBRA_GRIS));
            s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        }
        s.setBorderBottom(BorderStyle.HAIR);
        Font f = wb.createFont();
        f.setFontHeightInPoints((short) 10);
        s.setFont(f);
        return s;
    }

    private CellStyle toplamStili(SXSSFWorkbook wb) {
        CellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(xssfColor(wb, TOPLAM_BG));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setBorderTop(BorderStyle.MEDIUM);
        Font f = wb.createFont();
        f.setBold(true);
        f.setFontHeightInPoints((short) 10);
        s.setFont(f);
        return s;
    }

    private short xssfColor(SXSSFWorkbook wb, byte[] rgb) {
        // SXSSFWorkbook ile XSSFColor direkt kullanılamaz; indexed color fallback
        // Her renge en yakın IndexedColors kullanılır
        // Basitlik için: koyu mavi → DARK_BLUE, açık mavi → LIGHT_BLUE, gri → GREY_25
        if (rgb == KOYU_MAVI)  return IndexedColors.DARK_BLUE.getIndex();
        if (rgb == ACIK_MAVI)  return IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex();
        if (rgb == ZEBRA_GRIS) return IndexedColors.GREY_25_PERCENT.getIndex();
        if (rgb == TOPLAM_BG)  return IndexedColors.LIGHT_BLUE.getIndex();
        return IndexedColors.WHITE.getIndex();
    }
}
