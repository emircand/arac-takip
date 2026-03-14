package com.aractakip.stok.dto;

import java.math.BigDecimal;

public record StokRequest(
        String stokAdi,
        String kodu,
        String birim,
        BigDecimal devir,
        BigDecimal giris
) {}
