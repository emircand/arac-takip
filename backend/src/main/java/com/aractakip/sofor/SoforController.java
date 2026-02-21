package com.aractakip.sofor;

import com.aractakip.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/soforler")
@RequiredArgsConstructor
public class SoforController {

    private final SoforService soforService;

    @GetMapping
    public ApiResponse<List<Sofor>> getAll(
            @RequestParam(required = false) Boolean aktif) {
        return ApiResponse.ok(soforService.getAll(aktif));
    }
}
