package com.aractakip.ariza.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class ArizaDto {

    public record Response(
            UUID id,
            UUID aracId,
            String plaka,
            UUID soforId,
            String soforAd,
            String baslik,
            String aciklama,
            String durum,
            boolean calisalamaz,
            Instant bildirimZamani,
            String islemYapan,
            String tamamlannaNotu,
            Instant tamamlandiAt,
            Instant createdAt
    ) {}

    public record Detail(
            UUID id,
            UUID aracId,
            String plaka,
            UUID soforId,
            String soforAd,
            String baslik,
            String aciklama,
            String durum,
            boolean calisalamaz,
            Instant bildirimZamani,
            String islemYapan,
            String tamamlannaNotu,
            Instant tamamlandiAt,
            Instant createdAt,
            List<ParcaResponse> parcalar,
            List<HareketResponse> hareketler
    ) {}

    public record ParcaResponse(
            UUID id,
            UUID stokId,
            String stokAdi,
            String parcaAdi,
            BigDecimal miktar,
            String birim,
            boolean kullanildi,
            Instant createdAt
    ) {}

    public record HareketResponse(
            UUID id,
            String eskiDurum,
            String yeniDurum,
            String aciklama,
            Instant createdAt
    ) {}

    public record Sayim(
            long acik,
            long devam,
            long tamamlandi,
            long iptal
    ) {}
}
