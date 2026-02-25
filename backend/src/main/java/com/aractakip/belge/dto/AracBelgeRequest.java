package com.aractakip.belge.dto;

import java.time.LocalDate;
import java.util.UUID;

public record AracBelgeRequest(
        UUID aracId,
        String belgeTuru,
        LocalDate bitisTarihi,
        String cihazNo
) {}
