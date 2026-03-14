package com.aractakip.stok.dto;

import java.math.BigDecimal;

public record StokGirisRequest(
        BigDecimal miktar,
        String aciklama
) {}
