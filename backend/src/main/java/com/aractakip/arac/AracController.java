package com.aractakip.arac;

import com.aractakip.arac.dto.AracRequest;
import com.aractakip.common.AktifRequest;
import com.aractakip.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class AracController {

    private final AracService aracService;

    // ── /api/araclar ─────────────────────────────────────────────────────────

    @GetMapping("/api/araclar")
    public ApiResponse<List<Arac>> getAll(
            @RequestParam(required = false) String tur,
            @RequestParam(required = false) Boolean aktif
    ) {
        return ApiResponse.ok(aracService.getAll(tur, aktif));
    }

    @GetMapping("/api/araclar/sefere-katilabilir")
    public ApiResponse<List<Arac>> getSefereKatilabilir() {
        return ApiResponse.ok(aracService.getSefereKatilabilir());
    }

    @GetMapping("/api/araclar/cekiciler")
    public ApiResponse<List<Arac>> getCekiciler(@RequestParam(required = false) Boolean aktif) {
        return ApiResponse.ok(aracService.getAll("cekici", aktif));
    }

    @GetMapping("/api/araclar/dorseler")
    public ApiResponse<List<Arac>> getDorseler(@RequestParam(required = false) Boolean aktif) {
        return ApiResponse.ok(aracService.getAll("semitreyler", aktif));
    }

    @PostMapping("/api/araclar")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Arac> create(@RequestBody AracRequest req) {
        return ApiResponse.ok(aracService.create(req));
    }

    @PutMapping("/api/araclar/{id}")
    public ApiResponse<Arac> update(@PathVariable UUID id, @RequestBody AracRequest req) {
        return ApiResponse.ok(aracService.update(id, req));
    }

    @PatchMapping("/api/araclar/{id}/aktif")
    public ApiResponse<Arac> setAktif(@PathVariable UUID id, @RequestBody AktifRequest req) {
        return ApiResponse.ok(aracService.setAktif(id, req));
    }

    // ── /api/arac-turleri ────────────────────────────────────────────────────

    @GetMapping("/api/arac-turleri")
    public ApiResponse<List<AracTuru>> getTurler() {
        return ApiResponse.ok(aracService.getAllTurler());
    }
}
