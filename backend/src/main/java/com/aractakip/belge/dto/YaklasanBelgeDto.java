package com.aractakip.belge.dto;

import java.time.LocalDate;
import java.util.UUID;

public record YaklasanBelgeDto(
        UUID belgeId,
        String belgeTuru,
        LocalDate bitisTarihi,
        long kalanGun,
        String durum,
        String durumRenk,
        UUID aracId,
        String aracPlaka,
        String aracTur,
        Integer subeId,
        String sube,
        String bolge,
        String depo,
        Integer firmaId,
        String firma
) {}
