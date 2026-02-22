package com.aractakip.belge.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record AracBelgeRequest(
        UUID aracId,
        String belgeTuru,
        LocalDate baslangicTarihi,
        LocalDate bitisTarihi,
        String policeNo,
        String kurum,
        BigDecimal tutar,
        String notlar
) {}
