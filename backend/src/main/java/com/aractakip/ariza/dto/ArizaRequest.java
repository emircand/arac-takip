package com.aractakip.ariza.dto;

import java.time.Instant;
import java.util.UUID;

public record ArizaRequest(
        UUID aracId,
        UUID soforId,
        String baslik,
        String aciklama,
        boolean calisalamaz,
        Instant bildirimZamani,
        String islemYapan
) {}
