package com.aractakip.ariza.dto;

public record ArizaDurumRequest(
        String durum,
        String aciklama,
        String tamamlannaNotu,
        String islemYapan
) {}
