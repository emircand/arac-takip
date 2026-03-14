package com.aractakip.ariza.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ArizaParcaRequest(
        String parcaAdi,
        BigDecimal miktar,
        String birim,
        UUID stokId
) {}
