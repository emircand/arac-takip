package com.aractakip.yakit;

import com.aractakip.common.ApiResponse;
import com.aractakip.yakit.dto.YakitDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class YakitController {

    private final YakitService yakitService;

    /** Excel yükle → ön izleme döndür */
    @PostMapping("/api/yakit/upload")
    public ApiResponse<YakitDto.Preview> upload(@RequestParam("file") MultipartFile file) throws IOException {
        return ApiResponse.ok(yakitService.parseExcel(file));
    }

    /** Onaylanan satırları kaydet */
    @PostMapping("/api/yakit/confirm")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Integer> confirm(@RequestBody List<YakitDto.Row> rows) {
        int saved = yakitService.confirm(rows);
        return ApiResponse.ok(saved);
    }

    /** Kayıtları listele (opsiyonel araç filtresi) */
    @GetMapping("/api/yakit")
    public ApiResponse<List<YakitDto.Response>> list(
            @RequestParam(required = false) UUID aracId
    ) {
        return ApiResponse.ok(yakitService.list(aracId));
    }
}
