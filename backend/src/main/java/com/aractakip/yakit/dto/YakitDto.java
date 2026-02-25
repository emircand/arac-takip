package com.aractakip.yakit.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class YakitDto {

    /** Önizleme yanıtı — upload sonrası döner */
    public record Preview(
            List<Row> matched,
            List<Unmatched> unmatched
    ) {}

    /** Eşleşen satır */
    public record Row(
            UUID aracId,
            String plaka,
            LocalDateTime tarih,
            BigDecimal miktarLt,
            BigDecimal tutar,
            String istasyon,
            String istasyonIli,
            String uttsNo,
            boolean duplika   // true → DB'de zaten var, kaydetme
    ) {}

    /** Eşleşmeyen satır */
    public record Unmatched(
            String plaka,
            int satirNo
    ) {}

    /** Liste yanıtı — GET /api/yakit */
    public record Response(
            UUID id,
            UUID aracId,
            String plaka,
            LocalDateTime tarih,
            BigDecimal miktarLt,
            BigDecimal tutar,
            String istasyon,
            String istasyonIli,
            String uttsNo,
            boolean anomali
    ) {}
}
