package com.aractakip.belge;

import com.aractakip.belge.dto.AracBelgeDto;
import com.aractakip.belge.dto.AracBelgeRequest;
import com.aractakip.belge.dto.YaklasanBelgeDto;
import com.aractakip.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class AracBelgeController {

    private final AracBelgeService belgeService;

    @GetMapping("/api/arac-belgeler")
    public ApiResponse<List<AracBelgeDto.Response>> getByArac(@RequestParam UUID aracId) {
        return ApiResponse.ok(belgeService.getByArac(aracId));
    }

    @GetMapping("/api/arac-belgeler/gecmis")
    public ApiResponse<List<AracBelgeDto.Response>> getGecmis(
            @RequestParam UUID aracId,
            @RequestParam String belgeTuru
    ) {
        return ApiResponse.ok(belgeService.getGecmis(aracId, belgeTuru));
    }

    @GetMapping("/api/arac-belgeler/uyarilar")
    public ApiResponse<List<AracBelgeDto.Response>> getUyarilar(
            @RequestParam(defaultValue = "30") int gun
    ) {
        return ApiResponse.ok(belgeService.getUyarilar(gun));
    }

    @GetMapping("/api/arac-belgeler/yaklasan")
    public ApiResponse<List<YaklasanBelgeDto>> getYaklasan(
            @RequestParam(defaultValue = "60") int gun,
            @RequestParam(name = "belge_turu", required = false) String belgeTuru,
            @RequestParam(name = "sube_id", required = false) Integer subeId,
            @RequestParam(name = "bolge_id", required = false) Integer bolgeId,
            @RequestParam(defaultValue = "bitis_tarihi_asc") String siralama
    ) {
        return ApiResponse.ok(belgeService.getYaklasan(gun, belgeTuru, subeId, bolgeId, siralama));
    }

    @GetMapping("/api/arac-belgeler/dashboard/sayim")
    public ApiResponse<AracBelgeDto.DurumSayim> getDashboardSayim() {
        return ApiResponse.ok(belgeService.getDashboardSayim());
    }

    @GetMapping("/api/arac-belgeler/ozet/{aracId}")
    public ApiResponse<List<AracBelgeDto.Response>> getOzet(@PathVariable UUID aracId) {
        return ApiResponse.ok(belgeService.getOzet(aracId));
    }

    @GetMapping("/api/arac-belgeler/{id}")
    public ApiResponse<AracBelgeDto.Response> getById(@PathVariable UUID id) {
        return ApiResponse.ok(belgeService.getById(id));
    }

    @PostMapping("/api/arac-belgeler")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AracBelgeDto.Response> create(@RequestBody AracBelgeRequest req) {
        return ApiResponse.ok(belgeService.create(req));
    }

    @PutMapping("/api/arac-belgeler/{id}")
    public ApiResponse<AracBelgeDto.Response> update(
            @PathVariable UUID id,
            @RequestBody AracBelgeRequest req
    ) {
        return ApiResponse.ok(belgeService.update(id, req));
    }

    @DeleteMapping("/api/arac-belgeler/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        belgeService.delete(id);
    }
}
