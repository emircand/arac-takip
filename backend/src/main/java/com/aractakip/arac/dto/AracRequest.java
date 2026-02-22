package com.aractakip.arac.dto;

import java.util.UUID;

public record AracRequest(
        String plaka,
        UUID turId,
        Boolean aktif
) {}
