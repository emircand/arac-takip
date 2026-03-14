package com.aractakip.stok;

import com.aractakip.common.ApiResponse;
import com.aractakip.stok.dto.StokDto;
import com.aractakip.stok.dto.StokGirisRequest;
import com.aractakip.stok.dto.StokRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class StokController {

    private final StokService stokService;

    @GetMapping("/api/stok")
    public ApiResponse<List<StokDto.Response>> list(@RequestParam(required = false) String ara) {
        List<StokDto.Response> data = (ara != null && !ara.isBlank())
                ? stokService.ara(ara)
                : stokService.list();
        return ApiResponse.ok(data);
    }

    @PostMapping("/api/stok")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<StokDto.Response> create(@RequestBody StokRequest req) {
        return ApiResponse.ok(stokService.create(req));
    }

    @PutMapping("/api/stok/{id}")
    public ApiResponse<StokDto.Response> update(@PathVariable UUID id, @RequestBody StokRequest req) {
        return ApiResponse.ok(stokService.update(id, req));
    }

    @PostMapping("/api/stok/{id}/giris")
    public ApiResponse<StokDto.Response> giris(@PathVariable UUID id, @RequestBody StokGirisRequest req) {
        return ApiResponse.ok(stokService.girisYap(id, req));
    }
}
