package com.aractakip.export.builder;

import com.aractakip.export.RaporVeri;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class PdfBuilder {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd.MM.yyyy");
    private static final DateTimeFormatter DT_FMT   = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

    private static final Color KOYU_MAVI  = new Color(0x1E, 0x3A, 0x5F);
    private static final Color ACIK_MAVI  = new Color(0xD0, 0xE4, 0xF5);
    private static final Color ZEBRA_GRIS = new Color(0xF5, 0xF5, 0xF5);
    private static final Color TOPLAM_BG  = new Color(0xE8, 0xF0, 0xFE);

    public byte[] build(RaporVeri rapor) {
        Rectangle sayfa = rapor.isLandscape() ? PageSize.A4.rotate() : PageSize.A4;
        Document doc = new Document(sayfa, 30, 30, 40, 40);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            writer.setPageEvent(new FooterHandler(rapor.getBaslik()));
            doc.open();

            BaseFont bf = turkceFont();
            Font fontBaslik   = new Font(bf, 16, Font.BOLD,   Color.WHITE);
            Font fontFiltre   = new Font(bf, 9,  Font.ITALIC, Color.GRAY);
            Font fontKolon    = new Font(bf, 9,  Font.BOLD,   Color.BLACK);
            Font fontVeri     = new Font(bf, 8,  Font.NORMAL, Color.BLACK);
            Font fontToplam   = new Font(bf, 9,  Font.BOLD,   Color.BLACK);

            for (int s = 0; s < rapor.getSayfalar().size(); s++) {
                RaporVeri.Sayfa sayfa2 = rapor.getSayfalar().get(s);

                // Birden fazla sayfa → yeni sayfa başına geç
                if (s > 0) doc.newPage();

                // ── Üst bilgi ──────────────────────────────────────────────
                PdfPTable header = new PdfPTable(1);
                header.setWidthPercentage(100);
                header.setSpacingAfter(4);

                PdfPCell baslikCell = new PdfPCell(new Phrase(rapor.getBaslik()
                        + (rapor.getSayfalar().size() > 1 ? " — " + sayfa2.ad() : ""), fontBaslik));
                baslikCell.setBackgroundColor(KOYU_MAVI);
                baslikCell.setPadding(8);
                baslikCell.setBorder(Rectangle.NO_BORDER);
                header.addCell(baslikCell);

                if (rapor.getFiltreBilgisi() != null && !rapor.getFiltreBilgisi().isBlank()) {
                    PdfPCell filtreCell = new PdfPCell(new Phrase(
                            "Filtreler: " + rapor.getFiltreBilgisi()
                            + "    Oluşturulma: " + LocalDateTime.now().format(DT_FMT), fontFiltre));
                    filtreCell.setBackgroundColor(new Color(0xF0, 0xF4, 0xF8));
                    filtreCell.setPadding(5);
                    filtreCell.setBorder(Rectangle.NO_BORDER);
                    header.addCell(filtreCell);
                }
                doc.add(header);

                // ── Veri tablosu ───────────────────────────────────────────
                int kolonSayisi = sayfa2.kolonlar().length;
                PdfPTable tablo = new PdfPTable(kolonSayisi);
                tablo.setWidthPercentage(100);
                tablo.setSpacingBefore(6);
                tablo.setHeaderRows(1);

                // Kolon başlıkları
                for (String kolon : sayfa2.kolonlar()) {
                    PdfPCell cell = new PdfPCell(new Phrase(kolon, fontKolon));
                    cell.setBackgroundColor(ACIK_MAVI);
                    cell.setPadding(5);
                    cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    tablo.addCell(cell);
                }

                // Veri satırları
                int satirIndex = 0;
                for (Object[] satirVeri : sayfa2.satirlar()) {
                    Color bg = (satirIndex % 2 == 1) ? ZEBRA_GRIS : Color.WHITE;
                    for (int c = 0; c < kolonSayisi; c++) {
                        Object val = c < satirVeri.length ? satirVeri[c] : null;
                        PdfPCell cell = new PdfPCell(new Phrase(formatVal(val), fontVeri));
                        cell.setBackgroundColor(bg);
                        cell.setPadding(4);
                        cell.setBorderColor(new Color(0xDD, 0xDD, 0xDD));
                        // Sayısal değerler sağa hizalı
                        if (val instanceof Number) {
                            cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                        }
                        tablo.addCell(cell);
                    }
                    satirIndex++;
                }

                // Toplam satırı
                if (sayfa2.toplamSatiri() != null) {
                    for (int c = 0; c < kolonSayisi; c++) {
                        Object val = c < sayfa2.toplamSatiri().length ? sayfa2.toplamSatiri()[c] : null;
                        PdfPCell cell = new PdfPCell(new Phrase(formatVal(val), fontToplam));
                        cell.setBackgroundColor(TOPLAM_BG);
                        cell.setPadding(5);
                        cell.setBorderWidthTop(1.5f);
                        if (val instanceof Number) {
                            cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                        }
                        tablo.addCell(cell);
                    }
                }

                doc.add(tablo);
            }

            doc.close();
        } catch (Exception e) {
            throw new RuntimeException("PDF oluşturulamadı: " + e.getMessage(), e);
        }
        return out.toByteArray();
    }

    private String formatVal(Object val) {
        if (val == null)                    return "—";
        if (val instanceof LocalDate d)     return d.format(DATE_FMT);
        if (val instanceof LocalDateTime dt) return dt.format(DT_FMT);
        if (val instanceof java.time.Instant i)
            return LocalDateTime.ofInstant(i, java.time.ZoneId.systemDefault()).format(DT_FMT);
        if (val instanceof Double d)        return String.format("%.2f", d);
        if (val instanceof Float f)         return String.format("%.2f", f);
        return val.toString();
    }

    /**
     * Türkçe karakter destekli font yükle.
     * macOS/Linux sistem fontları denenir; bulunamazsa Helvetica fallback.
     */
    private BaseFont turkceFont() {
        String[] fontPaths = {
            "/Library/Fonts/Arial Unicode MS.ttf",
            "/System/Library/Fonts/Supplemental/Arial.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "fonts/LiberationSans-Regular.ttf",  // classpath resource
        };
        for (String path : fontPaths) {
            try {
                // Classpath denemesi
                if (!path.startsWith("/")) {
                    try (var is = getClass().getClassLoader().getResourceAsStream(path)) {
                        if (is != null) {
                            byte[] data = is.readAllBytes();
                            return BaseFont.createFont(path, BaseFont.IDENTITY_H, BaseFont.EMBEDDED, true, data, null);
                        }
                    }
                    continue;
                }
                // Sistem yolu denemesi
                java.io.File f = new java.io.File(path);
                if (f.exists()) {
                    return BaseFont.createFont(path, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
                }
            } catch (Exception ignored) {}
        }
        // Fallback: Helvetica (Türkçe özel karakterler bozulabilir)
        try {
            return BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
        } catch (Exception e) {
            throw new RuntimeException("Font yüklenemedi", e);
        }
    }

    /** Her sayfanın altına sayfa numarası ve timestamp yazar */
    private static class FooterHandler extends PdfPageEventHelper {
        private final String raporAdi;
        FooterHandler(String raporAdi) { this.raporAdi = raporAdi; }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            try {
                PdfContentByte cb = writer.getDirectContent();
                BaseFont bf = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
                cb.setFontAndSize(bf, 8);
                cb.setColorFill(Color.GRAY);

                float bottom = document.bottom() - 15;
                // Sol: timestamp
                cb.beginText();
                cb.setTextMatrix(document.left(), bottom);
                cb.showText(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")));
                cb.endText();
                // Sağ: sayfa no
                String pageNo = "Sayfa " + writer.getPageNumber();
                float txtWidth = bf.getWidthPoint(pageNo, 8);
                cb.beginText();
                cb.setTextMatrix(document.right() - txtWidth, bottom);
                cb.showText(pageNo);
                cb.endText();
            } catch (Exception ignored) {}
        }
    }
}
