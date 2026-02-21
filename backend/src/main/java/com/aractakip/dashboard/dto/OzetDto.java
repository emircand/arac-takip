package com.aractakip.dashboard.dto;

import com.aractakip.sefer.SeferRepository.OzetProj;

public record OzetDto(long tripCount, double totalTonaj, long totalKm, double totalYakit) {

    public static OzetDto from(OzetProj p) {
        if (p == null) return new OzetDto(0, 0, 0, 0);
        return new OzetDto(
                p.getTripCount() != null ? p.getTripCount() : 0L,
                p.getTotalTonaj() != null ? p.getTotalTonaj() : 0.0,
                p.getTotalKm() != null ? p.getTotalKm() : 0L,
                p.getTotalYakit() != null ? p.getTotalYakit() : 0.0
        );
    }
}
