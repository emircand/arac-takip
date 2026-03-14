package com.aractakip.yakit.analitik;

import com.aractakip.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class YakitAnalitikController {

    private final YakitAnalitikService service;

    /**
     * Aylık lt/100km trend serisi.
     * GET /api/dashboard/yakit/trend?arac_id=UUID&baslangic=YYYY-MM&bitis=YYYY-MM
     * arac_id yoksa tüm araçlar döner.
     */
    @GetMapping("/api/dashboard/yakit/trend")
    public ApiResponse<List<YakitAnalitikDto.TrendResponse>> trend(
            @RequestParam(required = false) UUID aracId,
            @RequestParam(required = false) String baslangic,
            @RequestParam(required = false) String bitis) {
        return ApiResponse.ok(service.getTrend(aracId, baslangic, bitis));
    }

    /**
     * Seçili dönemde tüm araçların lt/100km karşılaştırması.
     * GET /api/dashboard/yakit/karsilastirma?donem=YYYY-MM
     */
    @GetMapping("/api/dashboard/yakit/karsilastirma")
    public ApiResponse<List<YakitAnalitikDto.KarsilastirmaRow>> karsilastirma(
            @RequestParam(required = false) String donem) {
        return ApiResponse.ok(service.getKarsilastirma(donem));
    }

    /**
     * Son N günde anomali tipi set edilmiş yakıt kayıtları.
     * GET /api/dashboard/yakit/anomaliler?gun=90
     */
    @GetMapping("/api/dashboard/yakit/anomaliler")
    public ApiResponse<List<YakitAnalitikDto.AnomalilerRow>> anomaliler(
            @RequestParam(defaultValue = "90") int gun) {
        return ApiResponse.ok(service.getAnomaliler(gun));
    }

    /**
     * Araç bazlı: son 12 ay trend + baseline + sapma + risk seviyesi.
     * GET /api/dashboard/yakit/ozet/{aracId}
     */
    @GetMapping("/api/dashboard/yakit/ozet/{aracId}")
    public ApiResponse<YakitAnalitikDto.OzetResponse> ozet(@PathVariable UUID aracId) {
        return ApiResponse.ok(service.getOzet(aracId));
    }

    /**
     * Tüm araçların son dönem risk tablosu (z-skoru + % sapma bazlı).
     * GET /api/dashboard/yakit/risk
     */
    @GetMapping("/api/dashboard/yakit/risk")
    public ApiResponse<List<YakitAnalitikDto.RiskRow>> risk() {
        return ApiResponse.ok(service.getRisk());
    }
}
