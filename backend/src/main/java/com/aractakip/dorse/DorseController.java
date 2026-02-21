package com.aractakip.dorse;

import com.aractakip.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dorseler")
@RequiredArgsConstructor
public class DorseController {

    private final DorseService dorseService;

    @GetMapping
    public ApiResponse<List<Dorse>> getAll(
            @RequestParam(required = false) Boolean aktif) {
        return ApiResponse.ok(dorseService.getAll(aktif));
    }
}
