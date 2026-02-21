package com.aractakip.sefer.dto;

import com.aractakip.sefer.Sefer;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record SeferDto(
        UUID id,
        LocalDate tarih,
        String bolge,
        String cekiciPlaka,
        String dorsePlaka,
        String soforAdSoyad,
        LocalTime cikisSaati,
        LocalTime donusSaati,
        String sfrSuresi,
        BigDecimal tonaj,
        Integer cikisKm,
        Integer donusKm,
        Integer km,
        Integer sfrSrs,
        Integer sfr,
        BigDecimal yakit,
        String notlar,
        UUID girdiYapan
) {
    public static SeferDto from(Sefer s) {
        String sfrSuresi = null;
        if (s.getCikisSaati() != null && s.getDonusSaati() != null) {
            Duration d = Duration.between(s.getCikisSaati(), s.getDonusSaati());
            long hours = d.toHours();
            long minutes = d.toMinutesPart();
            sfrSuresi = String.format("%dsa %02ddk", hours, minutes);
        }
        return new SeferDto(
                s.getId(),
                s.getTarih(),
                s.getBolge(),
                s.getCekici() != null ? s.getCekici().getPlaka() : null,
                s.getDorse() != null ? s.getDorse().getPlaka() : null,
                s.getSofor() != null ? s.getSofor().getAdSoyad() : null,
                s.getCikisSaati(),
                s.getDonusSaati(),
                sfrSuresi,
                s.getTonaj(),
                s.getCikisKm(),
                s.getDonusKm(),
                s.getKm(),
                s.getSfrSrs(),
                s.getSfr(),
                s.getYakit(),
                s.getNotlar(),
                s.getGirdiYapan()
        );
    }
}
