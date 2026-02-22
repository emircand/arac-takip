package com.aractakip.sefer.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record SeferRequest(
        LocalDate tarih,
        String bolge,
        UUID cekiciId,
        UUID dorseId,
        UUID soforId,
        LocalTime cikisSaati,
        LocalTime donusSaati,
        Integer tonaj,
        Integer cikisKm,
        Integer donusKm,
        Integer sfrSrs,
        Integer sfr,
        BigDecimal yakit,
        BigDecimal alinanYakit,
        String notlar
) {}
