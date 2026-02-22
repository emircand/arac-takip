package com.aractakip.belge.dto;

import com.aractakip.belge.AracBelge;
import com.aractakip.belge.BelgeDurum;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class AracBelgeDto {

    public record Response(
            UUID id,
            UUID aracId,
            String aracPlaka,
            String belgeTuru,
            LocalDate baslangicTarihi,
            LocalDate bitisTarihi,
            String policeNo,
            String kurum,
            BigDecimal tutar,
            String notlar,
            long kalanGun,
            String durum,
            String durumRenk,
            Instant createdAt
    ) {
        public static Response from(AracBelge b) {
            long kalan = b.getKalanGun();
            BelgeDurum durum = b.getDurum();
            return new Response(
                    b.getId(),
                    b.getArac().getId(),
                    b.getArac().getPlaka(),
                    b.getBelgeTuru(),
                    b.getBaslangicTarihi(),
                    b.getBitisTarihi(),
                    b.getPoliceNo(),
                    b.getKurum(),
                    b.getTutar(),
                    b.getNotlar(),
                    kalan,
                    durum.name().toLowerCase(),
                    durum.getRenk(),
                    b.getCreatedAt()
            );
        }
    }

    public record DurumSayim(long valid, long warning, long critical, long expired) {}
}
