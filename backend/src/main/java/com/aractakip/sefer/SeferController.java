package com.aractakip.sefer;

import com.aractakip.common.ApiResponse;
import com.aractakip.sefer.dto.SeferDto;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
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
}
