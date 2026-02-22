package com.aractakip.sofor;

import com.aractakip.common.AktifRequest;
import com.aractakip.common.ApiResponse;
import com.aractakip.sofor.dto.SoforRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/soforler")
@RequiredArgsConstructor
public class SoforController {

    private final SoforService soforService;

    @GetMapping
    public ApiResponse<List<Sofor>> getAll(@RequestParam(required = false) Boolean aktif) {
        return ApiResponse.ok(soforService.getAll(aktif));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Sofor> create(@RequestBody SoforRequest req) {
        return ApiResponse.ok(soforService.create(req));
    }

    @PutMapping("/{id}")
    public ApiResponse<Sofor> update(@PathVariable UUID id, @RequestBody SoforRequest req) {
        return ApiResponse.ok(soforService.update(id, req));
    }

    @PatchMapping("/{id}/aktif")
    public ApiResponse<Sofor> setAktif(@PathVariable UUID id, @RequestBody AktifRequest req) {
        return ApiResponse.ok(soforService.setAktif(id, req));
    }
}
