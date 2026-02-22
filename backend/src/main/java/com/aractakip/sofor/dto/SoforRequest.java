package com.aractakip.sofor.dto;

public record SoforRequest(
        String adSoyad,
        String telefon,
        Boolean aktif,
        Integer subeId
) {}
