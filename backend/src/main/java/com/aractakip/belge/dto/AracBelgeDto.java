package com.aractakip.belge.dto;

import com.aractakip.belge.AracBelge;
import com.aractakip.belge.BelgeDurum;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class AracBelgeDto {

    public record Response(
            UUID id,
            UUID aracId,
            String aracPlaka,
            String belgeTuru,
            LocalDate bitisTarihi,
            String cihazNo,
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
                    b.getBitisTarihi(),
                    b.getCihazNo(),
                    kalan,
                    durum.name().toLowerCase(),
                    durum.getRenk(),
                    b.getCreatedAt()
            );
        }
    }

    public record DurumSayim(long valid, long warning, long critical, long expired) {}
}
