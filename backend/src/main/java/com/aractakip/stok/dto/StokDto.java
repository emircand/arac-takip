package com.aractakip.stok.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class StokDto {

    public record Response(
            UUID id,
            String stokAdi,
            String kodu,
            String birim,
            BigDecimal devir,
            BigDecimal giris,
            BigDecimal cikis,
            BigDecimal bakiye,
            Instant createdAt
    ) {}

    public record HareketResponse(
            UUID id,
            UUID stokId,
            String stokAdi,
            String tip,
            BigDecimal miktar,
            UUID arizaId,
            String aciklama,
            Instant createdAt
    ) {}
}
