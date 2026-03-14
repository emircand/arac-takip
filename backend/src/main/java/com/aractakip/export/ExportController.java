package com.aractakip.export;

import com.aractakip.export.builder.PdfBuilder;
import com.aractakip.export.builder.XlsxBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
@PreAuthorize("hasRole('YONETICI')")
public class ExportController {

    private final ExportService exportService;
    private final XlsxBuilder xlsxBuilder;
    private final PdfBuilder pdfBuilder;

    private static final DateTimeFormatter DOSYA_FMT =
            DateTimeFormatter.ofPattern("yyyyMMdd_HHmm");

    @GetMapping("/{rapor}")
    public ResponseEntity<byte[]> export(
            @PathVariable String rapor,
            @RequestParam(defaultValue = "xlsx") String format,
            @RequestParam Map<String, String> params) {

        // format parametresini params'tan çıkar (sadece filtre kalması için)
        params.remove("format");

        RaporVeri veri = switch (rapor) {
            case "araclar"      -> exportService.araclar(params);
            case "soforler"     -> exportService.soforler(params);
            case "seferler"     -> exportService.seferler(params);
            case "yakitlar"     -> exportService.yakitlar(params);
            case "arizalar"     -> exportService.arizalar(params);
            case "stok"         -> exportService.stok(params);
            case "belgeler"     -> exportService.belgeler(params);
            case "yakit-analiz" -> exportService.yakitAnaliz(params);
            default -> throw new IllegalArgumentException("Bilinmeyen rapor: " + rapor);
        };

        String zaman = LocalDateTime.now().format(DOSYA_FMT);

        if ("pdf".equalsIgnoreCase(format)) {
            byte[] bytes = pdfBuilder.build(veri);
            String dosyaAdi = rapor + "_" + zaman + ".pdf";
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + dosyaAdi + "\"")
                    .body(bytes);
        } else {
            byte[] bytes = xlsxBuilder.build(veri);
            String dosyaAdi = rapor + "_" + zaman + ".xlsx";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + dosyaAdi + "\"")
                    .body(bytes);
        }
    }
}
