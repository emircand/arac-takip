package com.aractakip.firma;

import com.aractakip.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/firmalar")
@RequiredArgsConstructor
public class FirmaController {

    private final FirmaRepository firmaRepository;

    @GetMapping
    public ApiResponse<List<Firma>> getAll() {
        return ApiResponse.ok(firmaRepository.findByAktifTrueOrderByAdAsc());
    }
}
