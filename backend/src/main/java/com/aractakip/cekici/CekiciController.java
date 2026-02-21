package com.aractakip.cekici;

import com.aractakip.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cekiciler")
@RequiredArgsConstructor
public class CekiciController {

    private final CekiciService cekiciService;

    @GetMapping
    public ApiResponse<List<Cekici>> getAll(
            @RequestParam(required = false) Boolean aktif) {
        return ApiResponse.ok(cekiciService.getAll(aktif));
    }
}
