package com.aractakip.ariza;

import com.aractakip.ariza.dto.*;
import com.aractakip.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ArizaController {

    private final ArizaService arizaService;

    @GetMapping("/api/arizalar")
    public ApiResponse<List<ArizaDto.Response>> list(
            @RequestParam(required = false) UUID aracId,
            @RequestParam(required = false) String durum
    ) {
        return ApiResponse.ok(arizaService.list(aracId, durum));
    }

    @GetMapping("/api/arizalar/sayim")
    public ApiResponse<ArizaDto.Sayim> sayim() {
        return ApiResponse.ok(arizaService.getSayim());
    }

    @GetMapping("/api/arizalar/{id}")
    public ApiResponse<ArizaDto.Detail> detail(@PathVariable UUID id) {
        return ApiResponse.ok(arizaService.getDetail(id));
    }

    @PostMapping("/api/arizalar")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ArizaDto.Response> create(@RequestBody ArizaRequest req) {
        return ApiResponse.ok(arizaService.create(req));
    }

    @PutMapping("/api/arizalar/{id}")
    public ApiResponse<ArizaDto.Response> update(@PathVariable UUID id, @RequestBody ArizaRequest req) {
        return ApiResponse.ok(arizaService.update(id, req));
    }

    @DeleteMapping("/api/arizalar/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        arizaService.delete(id);
        return ApiResponse.ok(null);
    }

    @PostMapping("/api/arizalar/{id}/durum")
    public ApiResponse<ArizaDto.Response> changeDurum(
            @PathVariable UUID id,
            @RequestBody ArizaDurumRequest req
    ) {
        return ApiResponse.ok(arizaService.changeDurum(id, req));
    }

    @PostMapping("/api/arizalar/{id}/tamamla")
    public ApiResponse<ArizaDto.Response> tamamla(@PathVariable UUID id) {
        return ApiResponse.ok(arizaService.tamamla(id));
    }

    @PostMapping("/api/arizalar/{id}/parcalar")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ArizaDto.ParcaResponse> addParca(
            @PathVariable UUID id,
            @RequestBody ArizaParcaRequest req
    ) {
        return ApiResponse.ok(arizaService.addParca(id, req));
    }

    @DeleteMapping("/api/arizalar/{id}/parcalar/{parcaId}")
    public ApiResponse<Void> deleteParca(
            @PathVariable UUID id,
            @PathVariable UUID parcaId
    ) {
        arizaService.deleteParca(parcaId);
        return ApiResponse.ok(null);
    }
}
