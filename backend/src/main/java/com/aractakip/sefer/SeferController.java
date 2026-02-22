package com.aractakip.sefer;

import com.aractakip.common.ApiResponse;
import com.aractakip.sefer.dto.SeferDto;
import com.aractakip.sefer.dto.SeferRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/seferler")
@RequiredArgsConstructor
public class SeferController {

    private final SeferService seferService;

    @GetMapping
    public ApiResponse<List<SeferDto>> getAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(required = false) String bolge,
            @RequestParam(required = false) UUID cekiciId,
            @RequestParam(required = false) UUID soforId
    ) {
        return ApiResponse.ok(seferService.getAll(start, end, bolge, cekiciId, soforId));
    }

    @GetMapping("/last-km")
    public ApiResponse<Map<String, Integer>> getLastKm(@RequestParam("cekici_id") UUID cekiciId) {
        Map<String, Integer> result = new java.util.HashMap<>();
        result.put("donus_km", seferService.getLastDonusKm(cekiciId));
        return ApiResponse.ok(result);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SeferDto> create(@RequestBody SeferRequest req, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ApiResponse.ok(seferService.create(req, userId));
    }

    @PutMapping("/{id}")
    public ApiResponse<SeferDto> update(@PathVariable UUID id, @RequestBody SeferRequest req) {
        return ApiResponse.ok(seferService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        seferService.delete(id);
        return ApiResponse.ok(null);
    }
}
